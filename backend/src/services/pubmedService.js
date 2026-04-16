'use strict';

const axios = require('axios');
const { parseArticles } = require('../utils/xmlParser');

class PubMedService {
  constructor() {
    this._esearchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
    this._efetchUrl  = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
    this._batchSize  = 100;   // efetch hard limit
    this._delayMs    = 350;   // 350ms between batches ≈ 3 req/sec
    this._timeoutMs  = 15000;
    this._headers    = { 'User-Agent': 'Curalink/1.0 (hackathon@curalink.ai)' };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Search PubMed and return normalized publications.
   * @param {string} query
   * @param {number} count
   * @returns {Promise<{ publications: object[], totalCount: number, retrieved: number }>}
   */
  async search(query, count = 100) {
    if (!query) return this._empty();
    try {
      const { pmids, totalCount } = await this._esearch(query, count);
      if (pmids.length === 0) return { publications: [], totalCount, retrieved: 0 };

      console.log(`[PubMed] ${pmids.length} PMIDs found (DB total: ${totalCount})`);
      const publications = await this._fetchAllBatches(pmids);

      return { publications, totalCount, retrieved: publications.length };
    } catch (err) {
      console.error('[PubMed] Search failed:', err.message);
      return this._empty();
    }
  }

  // ── Private methods ────────────────────────────────────────────────────────

  /** Step A — esearch: get list of PMIDs */
  async _esearch(query, count) {
    const { data } = await axios.get(this._esearchUrl, {
      params:  { db: 'pubmed', term: query, retmax: count, retmode: 'json', sort: 'pub+date' },
      timeout: this._timeoutMs,
      headers: this._headers,
    });
    const result = data?.esearchresult;
    if (!result) throw new Error('Unexpected esearch response');
    return {
      pmids:      result.idlist ?? [],
      totalCount: parseInt(result.count ?? '0', 10),
    };
  }

  /** Step B — efetch batches: fetch XML and parse */
  async _fetchAllBatches(pmids) {
    const publications = [];
    const batches = this._chunk(pmids, this._batchSize);

    for (let i = 0; i < batches.length; i++) {
      if (i > 0) await this._sleep(this._delayMs);
      try {
        const articles = await this._efetch(batches[i]);
        publications.push(...articles);
        console.log(`[PubMed] Batch ${i + 1}/${batches.length}: ${articles.length} articles`);
      } catch (err) {
        console.error(`[PubMed] Batch ${i + 1} failed:`, err.message);
      }
    }
    return publications;
  }

  /** Fetch one batch of PMIDs and return enriched publication objects */
  async _efetch(pmids) {
    const { data } = await axios.get(this._efetchUrl, {
      params:       { db: 'pubmed', id: pmids.join(','), retmode: 'xml', rettype: 'abstract' },
      timeout:      this._timeoutMs,
      headers:      this._headers,
      responseType: 'text',
    });
    return parseArticles(data).map((a) => ({
      ...a,
      id:    `pubmed_${a.pmid}`,
      url:   `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
      score: 0,
    }));
  }

  /** Split array into chunks of size n */
  _chunk(arr, n) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += n) chunks.push(arr.slice(i, i + n));
    return chunks;
  }

  _sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
  _empty()   { return { publications: [], totalCount: 0, retrieved: 0 }; }
}

module.exports = new PubMedService();
