const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const SearchCache = require('../models/SearchCache');
const { retrieve } = require('../services/retrievalOrchestrator');
const { expand } = require('../services/queryExpander');
const { reRank } = require('../services/reRanker');
const { synthesize } = require('../services/groqService');
const { getEmbedding } = require('../services/embeddingService');

const chat = async (req, res) => {
  const { sessionId, userId, patientName, disease, query, location } = req.body;
  const startTime = Date.now();

  // Establish SSE Connection immediately
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Tell Express to send headers immediately

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // 1. Load or create session
    let session = sessionId ? await Session.findOne({ sessionId }) : null;
    if (!session) {
      if (!userId) throw new Error("userId is required for new sessions.");
      session = new Session({ sessionId: uuidv4(), userId, patientName, disease, location, messages: [] });
    }

    sendEvent('init', { sessionId: session.sessionId, message: 'Session connected. Expanding query...' });

    // 2. Get conversation history (last 4 turns from CURRENT session)
    const conversationHistory = session.getRecentHistory(4);

    // 2b. Vector Retrieval: Find similar memories from PAST sessions
    let pastMemories = [];
    try {
      const queryVector = await getEmbedding(query);
      
      // Look for the last 20 sessions from THIS user, sorted by most recent
      const allPastSessions = await Session.find({ userId: session.userId })
        .sort({ updatedAt: -1 })
        .limit(20);
      let candidateMessages = [];
      allPastSessions.forEach(s => {
        s.messages.forEach(m => {
          if (m.embedding && m.embedding.length > 0) {
            candidateMessages.push({
              content: m.content,
              role: m.role,
              embedding: m.embedding,
              sessionId: s.sessionId
            });
          }
        });
      });

      // Simple Cosine Similarity (JS-Side) for high-relevance recall
      if (candidateMessages.length > 0) {
        pastMemories = candidateMessages.map(msg => {
          const dotProduct = msg.embedding.reduce((sum, val, i) => sum + val * queryVector[i], 0);
          return { ...msg, score: dotProduct };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) // Top 3 relevant memories
        .map(m => `[From session ${m.sessionId.slice(0,4)}]: ${m.content}`);
        console.log(`[MEMORY] Found ${pastMemories.length} relevant snippets.`);
      }

      // NEW: Get the list of ALL diseases this user has ever searched
      const allUserDiseases = await Session.distinct('disease', { userId: session.userId });
      console.log(`[DEBUG] userId: ${session.userId} | Historical Diseases Found: ${allUserDiseases.length} | List: ${allUserDiseases.join(', ')}`);

      if (allUserDiseases.length > 0) {
        pastMemories.push(`[SYSTEM_HISTORY]: You have previously conducted research sessions on: ${allUserDiseases.join(', ')}.`);
      }
      
      // Tag current message with its vector for future retrieval
      session.messages.push({ role: 'user', content: query, query, embedding: queryVector });
    } catch (memError) {
      console.warn("[MEMORY] Failed to retrieve past context:", memError.message);
      session.messages.push({ role: 'user', content: query, query });
    }
    session.totalQueries += 1;

    // 4. Expand query using Groq (context-aware: merges history + disease + query)
    const expanded = await expand({ 
      disease: session.disease, 
      query, 
      location: session.location,
      conversationHistory
    });
    console.log(`[EXPANSION] Query: "${query}" -> Expanded PubMed: "${expanded.pubmedQuery}"`);
    sendEvent('expanded', { expanded, message: 'Query expanded. Searching literature and trials...' });

    // 5. Check cache and execute Search ONLY if needed
    let rawPubs = [], rawTrials = [], stats = { pubmed: 0, openalex: 0, trials: 0, total: 0 };
    
    if (expanded.needsSearch !== false) {
      const cacheKey = `${session.disease}:${expanded.pubmedQuery}`.toLowerCase().replace(/\s+/g, '_').slice(0, 100);
      const cached = await SearchCache.findOne({ cacheKey }).catch(() => null);
      if (cached) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        rawPubs = cached.publications;
        rawTrials = cached.trials;
        stats = cached.stats;
      } else {
        // 6. Retrieve from all sources in parallel
        const result = await retrieve({ disease: session.disease, query, location: session.location });
        rawPubs = result.publications;
        rawTrials = result.trials;
        stats = result.stats;
        stats.expandedQuery = expanded;

        // Save to cache (fire and forget)
        SearchCache.create({ cacheKey, query, disease: session.disease, publications: rawPubs, trials: rawTrials, stats }).catch(err =>
          console.warn('[CACHE] Failed to save:', err.message)
        );
      }
    } else {
      console.log(`[CHRONICLE] Skipping research search. Direct Chat/Memory mode active.`);
    }

    // 7. Re-rank (If we have results)
    let publications = [], trials = [];
    if (rawPubs.length > 0 || rawTrials.length > 0) {
      const ranked = reRank({
        publications: rawPubs,
        trials: rawTrials,
        disease: session.disease,
        query,
        keyTerms: expanded.keyTerms || [],
        location: session.location
      });
      publications = ranked.publications;
      trials = ranked.trials;
    }

    sendEvent('results', { 
      publications, 
      trials, 
      retrievalStats: stats,
      message: 'Sources retrieved. Generating insights...'
    });

    // 8. LLM synthesis with Streaming
    const llmResponse = await synthesize({
      patientName: session.patientName,
      disease: session.disease,
      userQuery: query,
      location: session.location,
      conversationHistory,
      pastMemories, // Pass cross-session memories
      publications,
      trials,
      retrievalStats: stats,
      onStream: (token) => sendEvent('token', { text: token })
    });

    // 9. Save assistant message with embedding
    let responseEmbedding = [];
    try {
      responseEmbedding = await getEmbedding(llmResponse.conditionOverview || "Medical Insight");
    } catch (e) {}

    session.messages.push({
      role: 'assistant',
      content: llmResponse.conditionOverview || 'Response generated.',
      publications,
      trials,
      retrievalStats: stats,
      groqMeta: llmResponse._meta,
      response: llmResponse,
      searchTerms: expanded.keyTerms || [],
      embedding: responseEmbedding
    });
    await session.save();

    const totalMs = Date.now() - startTime;

    // 10. Complete
    sendEvent('complete', {
      sessionId: session.sessionId,
      response: llmResponse,
      publications,
      trials,
      retrievalStats: {
        ...stats,
        totalPipelineMs: totalMs,
        afterRanking: { publications: publications.length, trials: trials.length }
      }
    });

    res.end();
  } catch (err) {
    console.error("[CHAT CONTROLLER ERROR]", err);
    sendEvent('error', { error: err.message || 'Pipeline failed during execution.' });
    res.end();
  }
};

module.exports = { chat };
