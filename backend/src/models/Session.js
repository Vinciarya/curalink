const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  query: String,
  searchTerms: [String],
  publications: [{
    id: String,
    title: String,
    authors: [String],
    year: Number,
    source: String,
    url: String,
    score: Number,
    abstract: String
  }],
  trials: [{
    id: String,
    nctId: String,
    title: String,
    status: String,
    locations: [String],
    contact: String,
    url: String,
    score: Number
  }],
  retrievalStats: {
    pubmed: Number,
    openalex: Number,
    trials: Number,
    total: Number,
    elapsedMs: Number
  },
  groqMeta: {
    model: String,
    tokensUsed: Number
  },
  response: { type: mongoose.Schema.Types.Mixed },
  embedding: [Number], // Local vector for cross-conversation search
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true }, // Added for cross-conversation linking
  patientName: { type: String, default: 'Anonymous' },
  disease: { type: String, required: true },
  location: String,
  messages: [MessageSchema],
  totalQueries: { type: Number, default: 0 }
}, { timestamps: true });

SessionSchema.methods.getRecentHistory = function(n = 4) {
  return this.messages.slice(-n).map(m => ({ role: m.role, content: m.content }));
};

module.exports = mongoose.model('Session', SessionSchema);
