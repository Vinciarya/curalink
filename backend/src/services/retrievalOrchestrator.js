'use strict';

const pubmedService   = require('./pubmedService');
const openalexService = require('./openalexService');
const trialsService   = require('./trialsService');

class RetrievalOrchestrator {
  /**
   * Run all 3 retrieval sources in parallel.
   * A single source failure never kills the pipeline (Promise.allSettled).
   *
   * @param {{ disease: string, query: string, location?: string }} params
   * @returns {Promise<{ publications: object[], trials: object[], stats: object }>}
   */
  async retrieve({ disease, query, location }) {
    console.log(`[RETRIEVAL] Starting — query: "${query}" | disease: "${disease}" | location: "${location ?? 'any'}"`);
    const start = Date.now();

    const [pubmedRes, openalexRes, trialsRes] = await Promise.allSettled([
      pubmedService.search(`${query} AND ${disease}`, 100),
      openalexService.search(`${query} ${disease}`,  100),
      trialsService.search({ condition: disease, intervention: query, location, pageSize: 50 }),
    ]);

    const elapsed = Date.now() - start;

    // Log any source-level failures
    if (pubmedRes.status   === 'rejected') console.error('[RETRIEVAL] PubMed failed:',   pubmedRes.reason?.message);
    if (openalexRes.status === 'rejected') console.error('[RETRIEVAL] OpenAlex failed:', openalexRes.reason?.message);
    if (trialsRes.status   === 'rejected') console.error('[RETRIEVAL] Trials failed:',   trialsRes.reason?.message);

    const publications = [
      ...(pubmedRes.status   === 'fulfilled' ? pubmedRes.value.publications   : []),
      ...(openalexRes.status === 'fulfilled' ? openalexRes.value.publications : []),
    ];
    const trials = trialsRes.status === 'fulfilled' ? trialsRes.value.trials : [];

    const stats = {
      pubmed:        this._retrieved(pubmedRes),
      pubmedTotal:   this._total(pubmedRes),
      openalex:      this._retrieved(openalexRes),
      openalexTotal: this._total(openalexRes),
      trials:        this._retrieved(trialsRes,  'trials'),
      trialsTotal:   this._total(trialsRes),
      total:         publications.length + trials.length,
      elapsedMs:     elapsed,
      expandedQuery: {
        pubmedQuery:        `${query} AND ${disease}`,
        openalexQuery:      `${query} ${disease}`,
        trialsCondition:    disease,
        trialsIntervention: query,
      },
    };

    console.log(`[RETRIEVAL] Done in ${elapsed}ms | pubs: ${publications.length} | trials: ${trials.length} | total: ${stats.total}`);
    return { publications, trials, stats };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _retrieved(settled, key = 'publications') {
    return settled.status === 'fulfilled' ? (settled.value[key]?.length ?? settled.value.retrieved ?? 0) : 0;
  }

  _total(settled) {
    return settled.status === 'fulfilled' ? (settled.value.totalCount ?? 0) : 0;
  }
}

module.exports = new RetrievalOrchestrator();
