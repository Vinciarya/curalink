'use strict';

const axios = require('axios');

class OpenAlexService {
  constructor() {
    this._baseUrl    = 'https://api.openalex.org/works';
    this._timeoutMs  = 15000;
    this._headers    = { 'User-Agent': 'Curalink/1.0 (hackathon@curalink.ai)' };
    // host_venue is deprecated — use primary_location
    this._select = [
      'id', 'title', 'abstract_inverted_index', 'authorships',
      'publication_year', 'primary_location', 'open_access', 'cited_by_count', 'doi',
    ].join(',');
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Search OpenAlex Works and return normalized publications.
   * Fetches page 1 (and page 2 in parallel if count > 100).
   * @param {string} query
   * @param {number} count
   * @returns {Promise<{ publications: object[], totalCount: number, retrieved: number }>}
   */
  async search(query, count = 100) {
    if (!query) return this._empty();
    try {
      const perPage = Math.min(count, 100);
      const pages   = [this._fetchPage(query, 1, perPage)];
      if (count > 100) pages.push(this._fetchPage(query, 2, perPage));

      const settled = await Promise.allSettled(pages);

      let totalCount = 0;
      const rawWorks = [];

      settled.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          if (i === 0) totalCount = result.value.meta?.count ?? 0;
          rawWorks.push(...result.value.results);
          console.log(`[OpenAlex] Page ${i + 1}: ${result.value.results.length} works`);
        } else {
          console.error(`[OpenAlex] Page ${i + 1} failed:`, result.reason?.message);
        }
      });

      const publications = rawWorks.map((w) => this._normalize(w)).filter(Boolean);
      console.log(`[OpenAlex] "${query}": ${publications.length} valid / ${rawWorks.length} raw`);

      return { publications, totalCount, retrieved: publications.length };
    } catch (err) {
      console.error('[OpenAlex] Search failed:', err.message);
      return this._empty();
    }
  }

  // ── Private methods ────────────────────────────────────────────────────────

  async _fetchPage(query, page, perPage) {
    const { data } = await axios.get(this._baseUrl, {
      params: {
        search:     query,
        'per-page': perPage,
        page,
        sort:       'relevance_score:desc',
        filter:     'from_publication_date:2015-01-01',
        select:     this._select,
      },
      timeout: this._timeoutMs,
      headers: this._headers,
    });
    return { results: data?.results ?? [], meta: data?.meta ?? {} };
  }

  _normalize(work) {
    try {
      const title    = work.title?.trim() || null;
      const abstract = this._reconstructAbstract(work.abstract_inverted_index);
      if (!title || !abstract) return null;

      const shortId = (work.id ?? '').replace('https://openalex.org/', '');
      const doi     = work.doi ?? null;

      return {
        id:           `openalex_${shortId}`,
        openalexId:   work.id,
        title,
        abstract,
        authors:      (work.authorships ?? []).slice(0, 5)
                        .map((a) => a?.author?.display_name).filter(Boolean),
        year:         work.publication_year ?? null,
        journal:      work.primary_location?.source?.display_name ?? null,
        citedByCount: work.cited_by_count ?? 0,
        isOpenAccess: work.open_access?.is_oa ?? false,
        source:       'OpenAlex',
        url:          doi ? `https://doi.org/${doi}` : work.id,
        score:        0,
      };
    } catch (err) {
      console.error('[OpenAlex] Normalize error:', err.message);
      return null;
    }
  }

  /**
   * Reconstruct prose abstract from OpenAlex inverted index.
   * Inverted index: { "word": [pos1, pos2, ...] }
   */
  _reconstructAbstract(invertedIndex) {
    if (!invertedIndex || typeof invertedIndex !== 'object') return null;

    const posMap = {};
    for (const [word, positions] of Object.entries(invertedIndex)) {
      if (Array.isArray(positions)) {
        positions.forEach((p) => { posMap[p] = word; });
      }
    }

    const keys = Object.keys(posMap).map(Number);
    if (keys.length === 0) return null;

    const maxPos = Math.max(...keys);
    return Array.from({ length: maxPos + 1 }, (_, i) => posMap[i] || '').join(' ').trim() || null;
  }

  _empty() { return { publications: [], totalCount: 0, retrieved: 0 }; }
}

module.exports = new OpenAlexService();
