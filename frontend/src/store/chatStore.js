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
  isPatientFormOpen: true, // show on first load

  // ── HISTORY ───────────────────────────────────────────────
  sessionHistory: [], // list from GET /api/sessions

  // ── ACTIONS ───────────────────────────────────────────────
  setPatientContext: (ctx) => set({ patientContext: ctx, isPatientFormOpen: false }),

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

  onComplete: (response) => set(state => ({
    isStreaming: false,
    streamingText: '',
    pipelineStatus: 'complete',
    statusMessage: '',
    messages: [...state.messages, {
      id: Date.now(),
      role: 'assistant',
      response,
      publications: state.publications,
      trials: state.trials,
      retrievalStats: state.retrievalStats,
      timestamp: new Date()
    }]
  })),

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
    messages: sessionData.messages.map(m => ({ ...m, id: m._id || Date.now() })),
    patientContext: {
      patientName: sessionData.patientName,
      disease: sessionData.disease,
      location: sessionData.location || ''
    },
    isPatientFormOpen: false
  }),

  setSessionHistory: (history) => set({ sessionHistory: history }),

  newSession: () => set({ ...initialSessionState, isPatientFormOpen: true }),
}));
