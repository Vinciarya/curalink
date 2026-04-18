'use strict';

const axios = require('axios');

class ClinicalTrialsService {
  constructor() {
    this._baseUrl   = 'https://clinicaltrials.gov/api/v2/studies';
    this._timeoutMs = 15000;
    this._headers   = { 'User-Agent': 'Curalink/1.0 (hackathon@curalink.ai)' };

    // Status priority for sorting — higher = more relevant to patients
    this._statusPriority = {
      RECRUITING:              100,
      ACTIVE_NOT_RECRUITING:    80,
      ENROLLING_BY_INVITATION:  70,
      NOT_YET_RECRUITING:       60,
      COMPLETED:                40,
      TERMINATED:               10,
      WITHDRAWN:                 0,
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Search ClinicalTrials.gov. Runs two parallel requests (RECRUITING + all statuses)
   * then deduplicates and sorts by status priority.
   * @param {{ condition: string, intervention?: string, location?: string, pageSize?: number }} opts
   * @returns {Promise<{ trials: object[], totalCount: number, retrieved: number }>}
   */
  async search({ condition, intervention, location, pageSize = 50 }) {
    if (!condition) {
      console.error('[Trials] No condition provided');
      return this._empty();
    }

    const base = {
      'query.cond': condition,
      pageSize:     Math.min(pageSize, 1000),
      format:       'json',
      countTotal:   true,
    };
    if (intervention) base['query.intr'] = intervention;
    if (location)     base['query.locn'] = location;

    try {
      let [recruitingRes, allRes] = await Promise.allSettled([
        this._fetch({ ...base, 'filter.overallStatus': 'RECRUITING' }),
        this._fetch(base),
      ]);

      let recruiting = recruitingRes.status === 'fulfilled' ? recruitingRes.value.studies    : [];
      let all        = allRes.status        === 'fulfilled' ? allRes.value.studies           : [];

      // FALLBACK: If we got 0 hits and we were searching with an intervention, try condition-only
      if (all.length === 0 && intervention) {
        console.log(`[Trials] zero hits for "${condition}" + "${intervention}". Retrying broad...`);
        const broadBase = { ...base };
        delete broadBase['query.intr'];
        
        const retryRes = await this._fetch(broadBase);
        all = retryRes.studies || [];
      }

      const totalCount = allRes.status        === 'fulfilled' ? (allRes.value.totalCount || all.length) : all.length;

      if (recruitingRes.status === 'rejected')
        console.error('[Trials] RECRUITING request failed:', recruitingRes.reason?.message);
      if (allRes.status === 'rejected')
        console.error('[Trials] All-status request failed:', allRes.reason?.message);

      console.log(`[Trials] Raw: recruiting=${recruiting.length}, all=${all.length}`);

      // Merge (recruiting first), normalize, deduplicate, sort
      const merged     = [...recruiting, ...all];
      const normalized = merged.map((s) => this._normalize(s)).filter(Boolean);
      const unique     = this._deduplicateByNctId(normalized);
      unique.sort((a, b) => b.statusPriority - a.statusPriority);

      console.log(`[Trials] "${condition}": ${unique.length} unique trials`);
      return { trials: unique, totalCount, retrieved: unique.length };
    } catch (err) {
      console.error('[Trials] Search failed:', err.message);
      return this._empty();
    }
  }

  // ── Private methods ────────────────────────────────────────────────────────

  async _fetch(params) {
    const { data } = await axios.get(this._baseUrl, {
      params,
      timeout: this._timeoutMs,
      headers: this._headers,
    });
    return {
      studies:    data?.studies    ?? [],
      totalCount: data?.totalCount ?? 0,
    };
  }

  _normalize(study) {
    try {
      const id  = study.protocolSection?.identificationModule  ?? {};
      const st  = study.protocolSection?.statusModule          ?? {};
      const des = study.protocolSection?.descriptionModule     ?? {};
      const el  = study.protocolSection?.eligibilityModule     ?? {};
      const des2= study.protocolSection?.designModule          ?? {};
      const cl  = study.protocolSection?.contactsLocationsModule ?? {};

      const nctId      = id.nctId     ?? null;
      const briefTitle = id.briefTitle ?? null;
      if (!nctId) return null;

      const overallStatus  = st.overallStatus ?? 'UNKNOWN';
      const statusKey      = overallStatus.toUpperCase().replace(/\s+/g, '_');
      const statusPriority = this._statusPriority[statusKey] ?? 0;

      // Phase — API returns array like ["PHASE2"]
      const phases = des2.phases ?? [];
      const phase  = (Array.isArray(phases) ? phases : [phases])
        .map((p) => p.replace('PHASE', 'Phase '))
        .join(', ') || 'N/A';

      return {
        id:             `trial_${nctId}`,
        nctId,
        title:          briefTitle,
        status:         overallStatus,
        phase,
        eligibility:    el.eligibilityCriteria ?? null,
        summary:        des.briefSummary       ?? null,
        locations:      this._buildLocations(cl.locations  ?? []),
        contact:        this._buildContact(cl.centralContacts ?? []),
        startDate:      st.startDateStruct?.date ?? null,
        statusPriority,
        source:         'ClinicalTrials.gov',
        url:            `https://clinicaltrials.gov/study/${nctId}`,
        score:          0,
      };
    } catch (err) {
      console.error('[Trials] Normalize error:', err.message);
      return null;
    }
  }

  _buildLocations(locations) {
    const arr = Array.isArray(locations) ? locations : [];
    const strings = arr.map(({ city, country } = {}) => {
      if (city && country) return `${city}, ${country}`;
      return city || country || null;
    }).filter(Boolean);
    return [...new Set(strings)];
  }

  _buildContact(centralContacts) {
    const arr = Array.isArray(centralContacts) ? centralContacts : [];
    if (arr.length === 0) return null;
    const { name = '', phone = '', email = '' } = arr[0];
    return [name, phone, email].filter(Boolean).join(' | ') || null;
  }

  _deduplicateByNctId(trials) {
    const seen = new Set();
    return trials.filter(({ nctId }) => {
      if (seen.has(nctId)) return false;
      seen.add(nctId);
      return true;
    });
  }

  _empty() { return { trials: [], totalCount: 0, retrieved: 0 }; }
}

module.exports = new ClinicalTrialsService();
