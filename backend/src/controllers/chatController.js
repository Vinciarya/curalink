const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const SearchCache = require('../models/SearchCache');
const { retrieve } = require('../services/retrievalOrchestrator');
const { expand } = require('../services/queryExpander');
const { reRank } = require('../services/reRanker');
const { synthesize } = require('../services/groqService');

const chat = async (req, res) => {
  const { sessionId, patientName, disease, query, location } = req.body;
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
      session = new Session({ sessionId: uuidv4(), patientName, disease, location, messages: [] });
    }

    sendEvent('init', { sessionId: session.sessionId, message: 'Session connected. Expanding query...' });

    // 2. Get conversation history (last 4 turns)
    const conversationHistory = session.getRecentHistory(4);

    // 3. Add user message to session
    session.messages.push({ role: 'user', content: query, query });
    session.totalQueries += 1;

    // 4. Expand query using Groq (context-aware: merges disease + query)
    const expanded = await expand({ disease: session.disease, query, location: session.location });
    sendEvent('expanded', { expanded, message: 'Query expanded. Searching literature and trials...' });

    // 5. Check cache first
    const cacheKey = `${session.disease}:${expanded.pubmedQuery}`.toLowerCase().replace(/\s+/g, '_').slice(0, 100);
    let rawPubs, rawTrials, stats;

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
      
      // update stats with expanded query
      stats.expandedQuery = expanded;

      // Save to cache (fire and forget)
      SearchCache.create({ cacheKey, query, disease: session.disease, publications: rawPubs, trials: rawTrials, stats }).catch(err =>
        console.warn('[CACHE] Failed to save:', err.message)
      );
    }

    // 7. Re-rank
    const { publications, trials } = reRank({
      publications: rawPubs || [],
      trials: rawTrials || [],
      disease: session.disease,
      query,
      keyTerms: expanded.keyTerms || [],
      location: session.location
    });

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
      publications,
      trials,
      retrievalStats: stats,
      onStream: (token) => sendEvent('token', { text: token })
    });

    // 9. Save assistant message
    session.messages.push({
      role: 'assistant',
      content: llmResponse.conditionOverview || 'Response generated.',
      publications,
      trials,
      retrievalStats: stats,
      groqMeta: llmResponse._meta,
      response: llmResponse,
      searchTerms: expanded.keyTerms || []
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
