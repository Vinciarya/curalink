'use strict';

/**
 * tests/unit/reRanker.test.js
 *
 * Tests cover:
 *   scorePublication — individual score dimensions + caps
 *   scoreTrial       — location + status signals
 *   reRank           — topK slicing, deduplication, ordering
 */

const { scorePublication, scoreTrial, reRank } = require('../../src/services/reRanker');

// ─── Shared context ───────────────────────────────────────────────────────────

const PARKINSON_CONTEXT = {
  disease:  "Parkinson's disease",
  query:    'deep brain stimulation',
  keyTerms: ['DBS', 'neurostimulation'],
};

// ─── scorePublication ─────────────────────────────────────────────────────────

describe('scorePublication', () => {
  test('recent, relevant, high-cited PubMed paper scores > 70', () => {
    const pub = {
      title: "Deep brain stimulation outcomes in Parkinson's disease: 2024 systematic review",
      abstract:
        "This randomized clinical trial evaluated DBS in Parkinson's disease patients across " +
        'multiple centers. Results demonstrated significant improvement in motor function...',
      year:         new Date().getFullYear() - 1,
      source:       'PubMed',
      citedByCount: 150,
      isOpenAccess: true,
    };

    const score = scorePublication(pub, PARKINSON_CONTEXT);

    expect(score.total).toBeGreaterThan(70);
    expect(score.relevance).toBeGreaterThan(25);
    expect(score.recency).toBeGreaterThanOrEqual(27);
  });

  test('old, irrelevant paper scores < 20', () => {
    const pub = {
      title:        'General overview of vitamins',
      abstract:     'A broad review of nutritional supplements and their effects.',
      year:         2005,
      source:       'OpenAlex',
      citedByCount: 0,
      isOpenAccess: false,
    };

    const score = scorePublication(pub, PARKINSON_CONTEXT);

    expect(score.total).toBeLessThan(20);
  });

  test('relevance, credibility, and bonus are individually capped', () => {
    const pub = {
      title:
        "Deep brain stimulation Parkinson's disease deep brain stimulation",
      abstract:
        "deep brain stimulation DBS Parkinson's disease neurostimulation deep brain stimulation",
      year:         2024,
      source:       'PubMed',
      citedByCount: 1000,
      isOpenAccess: true,
    };

    const score = scorePublication(pub, PARKINSON_CONTEXT);

    expect(score.relevance).toBeLessThanOrEqual(40);
    expect(score.credibility).toBeLessThanOrEqual(20);
    expect(score.bonus).toBeLessThanOrEqual(10);
  });
});

// ─── reRank ───────────────────────────────────────────────────────────────────

describe('reRank', () => {
  test('returns at most topK publications', () => {
    const pubs = Array.from({ length: 20 }, (_, i) => ({
      title:        `Paper ${i} about Parkinson's disease treatment`,
      abstract:     'Study on DBS treatment outcomes.',
      year:         2020 + (i % 5),
      source:       i % 2 === 0 ? 'PubMed' : 'OpenAlex',
      citedByCount: i * 10,
      isOpenAccess: false,
      score:        0,
    }));

    const { publications } = reRank({ publications: pubs, trials: [], ...PARKINSON_CONTEXT });

    expect(publications.length).toBeLessThanOrEqual(8);
    expect(publications.length).toBeGreaterThan(0);
  });

  test('deduplication removes near-identical titles', () => {
    const pubs = [
      {
        title:        'DBS in Parkinson disease: a review',
        abstract:     'x',
        year:         2023,
        source:       'PubMed',
        citedByCount: 50,
        isOpenAccess: false,
        score:        0,
      },
      {
        title:        "DBS in Parkinson's disease: a review",
        abstract:     'y',
        year:         2023,
        source:       'OpenAlex',
        citedByCount: 30,
        isOpenAccess: false,
        score:        0,
      },
    ];

    const { publications } = reRank({ publications: pubs, trials: [], ...PARKINSON_CONTEXT });

    expect(publications.length).toBe(1);
  });

  test('top-ranked pub has higher score than bottom-ranked', () => {
    const pubs = [
      {
        title:        'General neurology',
        abstract:     'Overview.',
        year:         2000,
        source:       'OpenAlex',
        citedByCount: 0,
        isOpenAccess: false,
        score:        0,
      },
      {
        title:        "Deep brain stimulation Parkinson's 2024 RCT",
        abstract:
          "Randomized trial of DBS in Parkinson's disease showed significant improvement.",
        year:         2024,
        source:       'PubMed',
        citedByCount: 200,
        isOpenAccess: true,
        score:        0,
      },
    ];

    const { publications } = reRank({
      publications: pubs,
      trials:       [],
      ...PARKINSON_CONTEXT,
      topK: { pubs: 5, trials: 0 },
    });

    expect(publications[0].score).toBeGreaterThan(
      publications[publications.length - 1].score
    );
  });
});

// ─── scoreTrial ───────────────────────────────────────────────────────────────

describe('scoreTrial', () => {
  const trialContext = {
    disease:  "Parkinson's disease",
    query:    'deep brain stimulation',
    location: 'Toronto, Canada',
  };

  test('recruiting trial with local location scores highest', () => {
    const trial = {
      title:          "Deep Brain Stimulation for Parkinson's Disease",
      summary:        'A trial evaluating DBS efficacy in PD patients.',
      eligibility:    "Adults with Parkinson's disease.",
      locations:      ['Toronto, Canada', 'New York, USA'],
      statusPriority: 100,
      contact:        'Dr. Smith | 416-555-0100 | smith@uhn.ca',
      score:          0,
    };

    expect(scoreTrial(trial, trialContext)).toBeGreaterThan(60);
  });
});
