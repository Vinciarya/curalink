'use strict';

/**
 * reRanker.js — Curalink intelligence layer
 *
 * Architecture (SOLID / OOP):
 *   ScoreConfig        — immutable scoring constants (SRP, OCP)
 *   PublicationScorer  — scores one publication (SRP)
 *   TrialScorer        — scores one clinical trial (SRP)
 *   Deduplicator       — deduplicates a list by title similarity (SRP)
 *   ReRanker           — orchestrates the full pipeline (SRP, DIP)
 *
 * Formula:
 *   Publication TOTAL = relevance(0-40) + recency(0-30) + credibility(0-20) + bonus(0-10)
 *   Trial       TOTAL = weighted signals, capped at 100
 */

const { ScoreMath } = require('../utils/scoreUtils');

// ─── ScoreConfig ──────────────────────────────────────────────────────────────

/**
 * Central home for every magic number and lookup table in the scoring system.
 * Change values here; nothing else needs to touch them. (Open/Closed Principle)
 */
class ScoreConfig {
  // Publication caps
  static MAX_RELEVANCE   = 40;
  static MAX_RECENCY     = 30;
  static MAX_CREDIBILITY = 20;
  static MAX_BONUS       = 10;

  // Recency ladder: [maxAge, points]
  static RECENCY_LADDER = [
    [1,  30], [2, 27], [3, 24],
    [5,  18], [8, 10], [12,  5],
  ];

  // Source trust points
  static SOURCE_PTS = { PubMed: 10, OpenAlex: 7 };

  // Citation impact ladder: [minCount, points]
  static CITATION_LADDER = [
    [500, 10], [100, 7], [50, 5], [10, 3], [1, 1],
  ];
  static CITATION_UNKNOWN_PTS = 5; // benefit-of-the-doubt for missing data

  // High-quality study-design terms (title bonus)
  static QUALITY_TERMS = [
    'randomized', 'randomised', 'clinical trial',
    'meta-analysis', 'systematic review', 'rct', 'cohort',
  ];

  // Trial scoring weights
  static TRIAL_STATUS_WEIGHT  = 0.4;
  static TRIAL_MAX_SCORE      = 100;

  // Deduplication
  static DEDUP_THRESHOLD      = 0.85;

  // Default pipeline limits
  static DEFAULT_TOP_PUBS     = 8;
  static DEFAULT_TOP_TRIALS   = 5;

  // Evaluated once at startup
  static CURRENT_YEAR = new Date().getFullYear();
}

// ─── PublicationScorer ────────────────────────────────────────────────────────

/**
 * Scores a single publication across four independent dimensions.
 * Each dimension is encapsulated in its own private method.
 *
 * @example
 *   const scorer = new PublicationScorer();
 *   const breakdown = scorer.score(pub, { disease, query, keyTerms });
 */
class PublicationScorer {
  /**
   * @param {Object}   pub
   * @param {Object}   ctx
   * @param {string}   ctx.disease
   * @param {string}   ctx.query
   * @param {string[]} [ctx.keyTerms=[]]
   * @returns {{ relevance, recency, credibility, bonus, total }}
   */
  score(pub, { disease, query, keyTerms = [] }) {
    const relevance   = this.#relevance(pub, disease, query, keyTerms);
    const recency     = this.#recency(pub.year);
    const credibility = this.#credibility(pub.source, pub.citedByCount);
    const bonus       = this.#bonus(pub);
    return { relevance, recency, credibility, bonus, total: relevance + recency + credibility + bonus };
  }

  // ── Private dimension methods ──────────────────────────────────────────────

  /**
   * Relevance (0–40):
   *   +15 disease in title | +8 keyTerm in title (fallback)
   *   +12 query in title   | +3×uniqueAbstractHits capped at 13
   */
  #relevance(pub, disease, query, keyTerms) {
    const title    = (pub.title    || '').toLowerCase();
    const abstract = (pub.abstract || '').toLowerCase();
    const dis      = disease.toLowerCase();
    const qry      = query.toLowerCase();
    const keys     = keyTerms.map((k) => k.toLowerCase());

    let pts = title.includes(dis) ? 15
            : keys.some((k) => title.includes(k)) ? 8 : 0;

    if (title.includes(qry)) pts += 12;

    const allTerms   = [dis, qry, ...keys];
    const uniqueHits = new Set(allTerms.filter((t) => abstract.includes(t))).size;
    pts += Math.min(uniqueHits * 3, 13);

    return ScoreMath.clamp(pts, 0, ScoreConfig.MAX_RELEVANCE);
  }

  /** Recency (0–30): walks the ladder from newest to oldest. */
  #recency(year) {
    if (!year) return 1;
    const age = ScoreConfig.CURRENT_YEAR - year;
    for (const [maxAge, pts] of ScoreConfig.RECENCY_LADDER) {
      if (age <= maxAge) return pts;
    }
    return 1;
  }

  /** Credibility (0–20): source trust + citation impact, both via lookup tables. */
  #credibility(source, citedByCount) {
    const sourcePts = ScoreConfig.SOURCE_PTS[source] ?? 0;
    const citePts   = this.#citationPts(citedByCount);
    return ScoreMath.clamp(sourcePts + citePts, 0, ScoreConfig.MAX_CREDIBILITY);
  }

  #citationPts(count) {
    if (count == null) return ScoreConfig.CITATION_UNKNOWN_PTS;
    for (const [min, pts] of ScoreConfig.CITATION_LADDER) {
      if (count > min) return pts;
    }
    return 0;
  }

  /** Bonus (0–10): abstract length + open access + study design. */
  #bonus(pub) {
    const title    = (pub.title    || '').toLowerCase();
    const abstract = (pub.abstract || '').toLowerCase();
    let pts = 0;
    if (abstract.length > 100)                                      pts += 4;
    if (pub.isOpenAccess)                                           pts += 3;
    if (ScoreConfig.QUALITY_TERMS.some((t) => title.includes(t)))  pts += 3;
    return ScoreMath.clamp(pts, 0, ScoreConfig.MAX_BONUS);
  }
}

// ─── TrialScorer ──────────────────────────────────────────────────────────────

/**
 * Scores a clinical trial using status priority, text signals, and geo-matching.
 */
class TrialScorer {
  /**
   * @param {Object}      trial
   * @param {Object}      ctx
   * @param {string}      ctx.disease
   * @param {string}      ctx.query
   * @param {string|null} [ctx.location]
   * @returns {number} score in [0, 100]
   */
  score(trial, { disease, query, location }) {
    const title   = (trial.title   || '').toLowerCase();
    const summary = (trial.summary || '').toLowerCase();
    const dis     = disease.toLowerCase();
    const qry     = query.toLowerCase();

    let pts = (trial.statusPriority || 0) * ScoreConfig.TRIAL_STATUS_WEIGHT;

    if (title.includes(dis))  pts += 20;
    if (title.includes(qry))  pts += 15;
    if (summary.includes(qry)) pts += 8;

    pts += this.#locationBonus(trial.locations, location);
    pts += this.#contactBonus(trial.contact);

    return ScoreMath.clamp(Math.round(pts), 0, ScoreConfig.TRIAL_MAX_SCORE);
  }

  /** +15 city match, +8 country match (parsed from "City, Country" string). */
  #locationBonus(trialLocations, location) {
    if (!location) return 0;
    const parts   = location.split(',').map((p) => p.trim().toLowerCase());
    const city    = parts[0] || '';
    const country = parts[parts.length - 1] || '';
    const locText = (trialLocations || []).join(' ').toLowerCase();
    return (city    && locText.includes(city)    ? 15 : 0)
         + (country && locText.includes(country) ?  8 : 0);
  }

  /** +5 if contact string has more than 2 tokens (name + detail). */
  #contactBonus(contact) {
    const c = (contact || '').trim();
    return c && c.split(/\s+/).length > 2 ? 5 : 0;
  }
}

// ─── Deduplicator ─────────────────────────────────────────────────────────────

/**
 * Removes near-duplicate items from a list using title similarity.
 * The first occurrence always wins (caller should pre-sort by score).
 */
class Deduplicator {
  /** @param {number} threshold  similarity ratio above which items are duplicates */
  constructor(threshold = ScoreConfig.DEDUP_THRESHOLD) {
    this.#threshold = threshold;
  }

  #threshold;

  /**
   * @param {Object[]} items  – must each have a `.title` string field
   * @returns {Object[]}
   */
  deduplicate(items) {
    const seen   = [];
    const result = [];
    for (const item of items) {
      const norm = ScoreMath.normalizeTitle(item.title || '');
      if (!seen.some((s) => ScoreMath.similarity(s, norm) > this.#threshold)) {
        seen.push(norm);
        result.push(item);
      }
    }
    return result;
  }
}

// ─── ReRanker ────────────────────────────────────────────────────────────────

/**
 * Orchestrates the full pipeline:
 *   score → sort → deduplicate → slice → log
 *
 * Dependencies are injected, making the class easy to test or extend.
 */
class ReRanker {
  #pubScorer;
  #trialScorer;
  #deduplicator;

  /**
   * @param {PublicationScorer} pubScorer
   * @param {TrialScorer}       trialScorer
   * @param {Deduplicator}      deduplicator
   */
  constructor(pubScorer, trialScorer, deduplicator) {
    this.#pubScorer    = pubScorer;
    this.#trialScorer  = trialScorer;
    this.#deduplicator = deduplicator;
  }

  /**
   * @param {Object}   opts
   * @param {Object[]} opts.publications
   * @param {Object[]} opts.trials
   * @param {string}   opts.disease
   * @param {string}   opts.query
   * @param {string[]} [opts.keyTerms=[]]
   * @param {string}   [opts.location]
   * @param {{pubs?: number, trials?: number}} [opts.topK]
   * @returns {{ publications: Object[], trials: Object[] }}
   */
  run({ publications = [], trials = [], disease, query, keyTerms = [], location, topK = {} }) {
    const maxPubs   = topK.pubs   ?? ScoreConfig.DEFAULT_TOP_PUBS;
    const maxTrials = topK.trials ?? ScoreConfig.DEFAULT_TOP_TRIALS;

    const topPubs   = this.#rankPublications(publications, { disease, query, keyTerms }, maxPubs);
    const topTrials = this.#rankTrials(trials, { disease, query, location }, maxTrials);

    this.#log(publications.length, topPubs, trials.length, topTrials);

    return { publications: topPubs, trials: topTrials };
  }

  // ── Private pipeline stages ───────────────────────────────────────────────

  #rankPublications(pubs, ctx, limit) {
    const scored = pubs
      .map((pub) => {
        const breakdown = this.#pubScorer.score(pub, ctx);
        return { ...pub, ...breakdown, score: breakdown.total };
      })
      .sort((a, b) => b.total - a.total);

    return this.#deduplicator.deduplicate(scored).slice(0, limit);
  }

  #rankTrials(trials, ctx, limit) {
    return trials
      .map((trial) => ({ ...trial, score: this.#trialScorer.score(trial, ctx) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  #log(pubsIn, topPubs, trialsIn, topTrials) {
    console.log(
      `[RERANKER] Publications: ${pubsIn} → ${topPubs.length} ` +
      `| Trials: ${trialsIn} → ${topTrials.length}`
    );
    if (topPubs.length > 0) {
      console.log(
        `[RERANKER] Top pub score: ${topPubs[0].score.toFixed(1)} ` +
        `| Bottom: ${topPubs[topPubs.length - 1].score.toFixed(1)}`
      );
    }
  }
}

// ─── Singleton / facade ───────────────────────────────────────────────────────

/** Pre-wired default instance used by all call-sites. */
const _ranker = new ReRanker(
  new PublicationScorer(),
  new TrialScorer(),
  new Deduplicator()
);

const _pubScorer   = new PublicationScorer();
const _trialScorer = new TrialScorer();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Score a single publication.
 * @param {Object} pub
 * @param {{ disease: string, query: string, keyTerms?: string[] }} ctx
 * @returns {{ relevance, recency, credibility, bonus, total }}
 */
const scorePublication = (pub, ctx) => _pubScorer.score(pub, ctx);

/**
 * Score a single clinical trial.
 * @param {Object} trial
 * @param {{ disease: string, query: string, location?: string }} ctx
 * @returns {number}
 */
const scoreTrial = (trial, ctx) => _trialScorer.score(trial, ctx);

/**
 * Re-rank publications and trials and return the top-K of each.
 * @param {Object} opts  see ReRanker#run for full parameter spec
 * @returns {{ publications: Object[], trials: Object[] }}
 */
const reRank = (opts) => _ranker.run(opts);

module.exports = { reRank, scorePublication, scoreTrial };
