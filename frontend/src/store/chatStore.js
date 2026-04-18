import { create } from 'zustand';

const initialSessionState = {
  messages: [],
  sessionId: null,
  publications: [],
  trials: [],
  retrievalStats: null,
  streamingText: '',
  isStreaming: false,
  pipelineStatus: 'idle', // idle | connecting | searching | ranking | synthesizing | complete | error
  statusMessage: '',
  searchTerms: [],
  highlightedCitation: null, // 'P1', 'T2', etc.
  isSourcesPanelOpen: false,
  activeSourcesTab: 'publications', // 'publications' | 'trials'
};

export const useChatStore = create((set) => ({
  // ── SESSION STATE ─────────────────────────────────────────
  ...initialSessionState,

  // ── PATIENT CONTEXT ───────────────────────────────────────
  patientContext: { patientName: '', disease: '', location: '' },
  userId: (() => {
    const saved = localStorage.getItem('curalink_user_id');
    if (saved) return saved;
    const fresh = `user_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('curalink_user_id', fresh);
    return fresh;
  })(),
  isPatientFormOpen: true, // show on first load

  // ── HISTORY ───────────────────────────────────────────────
  sessionHistory: [], // list from GET /api/sessions

  // ── ACTIONS ───────────────────────────────────────────────
  setPatientContext: (ctx) => {
    const userId = localStorage.getItem('curalink_user_id') || `user_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('curalink_user_id', userId);
    set({ patientContext: ctx, isPatientFormOpen: false, userId });
  },

  startStream: () => set({
    isStreaming: true,
    streamingText: '',
    pipelineStatus: 'connecting',
    statusMessage: '',
    publications: [],
    trials: [],
    retrievalStats: null,
    searchTerms: []
  }),

  onInit: ({ sessionId }) => set({ sessionId }),

  onExpanded: ({ keyTerms }) => set({
    searchTerms: keyTerms,
    pipelineStatus: 'searching'
  }),

  onResults: ({ publications, trials, stats }) => set({
    publications,
    trials,
    retrievalStats: stats,
    isSourcesPanelOpen: true,
    pipelineStatus: 'synthesizing'
  }),

  onToken: (token) => set(state => ({
    streamingText: state.streamingText + token
  })),

  onComplete: (data) => set(state => {
    let finalResponse = data;
    if (typeof data === 'string') {
      try {
        finalResponse = JSON.parse(data);
      } catch (e) {
        finalResponse = data;
      }
    }
    
    return {
      isStreaming: false,
      streamingText: '',
      pipelineStatus: 'complete',
      statusMessage: '',
      messages: [...state.messages, {
        id: Date.now(),
        role: 'assistant',
        response: finalResponse,
        publications: state.publications,
        trials: state.trials,
        retrievalStats: state.retrievalStats,
        timestamp: new Date()
      }]
    };
  }),


  addUserMessage: (query) => set(state => ({
    messages: [...state.messages, {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date()
    }]
  })),

  onError: (message) => set(state => ({
    isStreaming: false,
    pipelineStatus: 'error',
    statusMessage: message || '',
    streamingText: '',
    messages: state.messages
  })),

  setStatus: (status) => set({ pipelineStatus: status }),

  highlightCitation: (citationId) => {
    set({ highlightedCitation: citationId, isSourcesPanelOpen: true });
    // Auto-switch tab based on citation prefix
    if (citationId?.startsWith('T')) set({ activeSourcesTab: 'trials' });
    else set({ activeSourcesTab: 'publications' });
    // Clear highlight after 2s
    setTimeout(() => set({ highlightedCitation: null }), 2000);
  },

  toggleSourcesPanel: () => set(state => ({
    isSourcesPanelOpen: !state.isSourcesPanelOpen
  })),

  setActiveSourcesTab: (tab) => set({ activeSourcesTab: tab }),

  loadSession: (sessionData) => set({
    sessionId: sessionData.sessionId,
    messages: sessionData.messages.map(m => {
      let parsedResponse = m.response;
      if (typeof m.response === 'string') {
        try { parsedResponse = JSON.parse(m.response); } catch(e) {}
      }
      return { 
        ...m, 
        id: m._id || Date.now(),
        response: parsedResponse
      };
    }),

    searchTerms: sessionData.messages.filter(m => m.role === 'assistant').pop()?.searchTerms || [],

    patientContext: {
      patientName: sessionData.patientName,
      disease: sessionData.disease,
      location: sessionData.location || ''
    },
    isPatientFormOpen: false
  }),

  reopenPatientForm: () => set({ isPatientFormOpen: true }),

  setSessionHistory: (history) => set({ sessionHistory: history }),

  newSession: () => set(state => ({ ...initialSessionState, isPatientFormOpen: true, userId: state.userId })),
}));
