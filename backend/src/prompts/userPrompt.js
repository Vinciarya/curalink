function buildUserPrompt({ patientName, disease, userQuery, location, conversationHistory, pastMemories, publications, trials, retrievalStats }) {
  let prompt = '';

  // 1. PATIENT CONTEXT
  prompt += `## PATIENT CONTEXT\n`;
  if (patientName) prompt += `Patient Name: ${patientName}\n`;
  prompt += `Disease/Condition: ${disease}\n`;
  prompt += `Query: ${userQuery}\n`;
  if (location) prompt += `Location: ${location}\n`;
  prompt += `\n`;

  // 1b. CROSS-SESSION MEMORIES (LONG-TERM CONTEXT)
  if (pastMemories && pastMemories.length > 0) {
    prompt += `## RELEVANT PAST CONVERSATIONS\n`;
    prompt += `The following snippets are from past chats with this user that might be relevant:\n`;
    pastMemories.forEach(mem => {
      prompt += `- ${mem}\n`;
    });
    prompt += `\n`;
  }

  // 2. CONVERSATION HISTORY (CURRENT SESSION)
  prompt += `## CURRENT SESSION HISTORY\n`;
  if (!conversationHistory || conversationHistory.length === 0) {
    prompt += `This is the first message in this session.\n`;
  } else {
    for (const msg of conversationHistory.slice(-5)) {
      prompt += `[${msg.role === 'user' ? 'USER' : 'ASSISTANT'}]: ${msg.content}\n`;
    }
  }
  prompt += `\n`;

  // 3. RETRIEVAL STATISTICS
  prompt += `## RETRIEVAL STATISTICS\n`;
  prompt += `PubMed Count: ${retrievalStats?.pubmed || 0}\n`;
  prompt += `OpenAlex Count: ${retrievalStats?.openalex || 0}\n`;
  prompt += `Trials Count: ${retrievalStats?.trials || 0}\n`;
  prompt += `Total Retrieved: ${retrievalStats?.total || 0}\n`;
  prompt += `\n`;

  // 4. RANKED PUBLICATIONS
  prompt += `## RANKED PUBLICATIONS\n`;
  if (!publications || publications.length === 0) {
    prompt += `No publications retrieved.\n`;
  } else {
    publications.forEach((pub, i) => {
      prompt += `[P${i + 1}] TITLE: ${pub.title || ''}\n`;
      let authors = Array.isArray(pub.authors) ? pub.authors.slice(0, 5).join(', ') : pub.authors;
      prompt += `         AUTHORS: ${authors || ''}\n`;
      prompt += `         YEAR: ${pub.year || ''}\n`;
      prompt += `         SOURCE: ${pub.source || ''}\n`;
      if (pub.score !== undefined) {
        prompt += `         RELEVANCE SCORE: ${Number(pub.score).toFixed(2)}\n`;
      }
      let abstract = pub.abstract || '';
      if (abstract.length > 350) {
        abstract = abstract.substring(0, 350) + '...';
      }
      prompt += `         ABSTRACT: ${abstract}\n`;
      prompt += `         URL: ${pub.url || ''}\n`;
      prompt += `---\n`;
    });
  }
  prompt += `\n`;

  // 5. RANKED CLINICAL TRIALS
  prompt += `## RANKED CLINICAL TRIALS\n`;
  if (!trials || trials.length === 0) {
    prompt += `No clinical trials retrieved.\n`;
  } else {
    trials.forEach((trial, i) => {
      prompt += `[T${i + 1}] TITLE: ${trial.title || ''}\n`;
      prompt += `         STATUS: ${trial.status || ''}\n`;
      prompt += `         PHASE: ${trial.phase || ''}\n`;
      let locs = Array.isArray(trial.locations) ? trial.locations.join(', ') : trial.location;
      prompt += `         LOCATION: ${locs || ''}\n`;
      let eligibility = trial.eligibility || '';
      if (eligibility.length > 250) {
        eligibility = eligibility.substring(0, 250) + '...';
      }
      prompt += `         ELIGIBILITY: ${eligibility}\n`;
      prompt += `         CONTACT: ${trial.contact || ''}\n`;
      prompt += `         URL: ${trial.url || ''}\n`;
      prompt += `---\n`;
    });
  }
  prompt += `\n`;

  // 6. YOUR TASK
  prompt += `## YOUR TASK\n`;
  prompt += `Synthesize the retrieved evidence to answer the query specifically for the disease context (${disease}).\n`;
  prompt += `CRITICAL: If 'RELEVANT PAST CONVERSATIONS' exist, prioritize this historical context to provide a personalized assistant experience. If the user asks about the past, use these memories as the primary source of truth.\n`;
  
  // 7. Location note
  if (location) {
    prompt += `Note: Patient is in ${location}. Prioritize geographically relevant trials.\n`;
  }

  // 8. Follow-up note
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `Note: This is a follow-up question. Use conversation history to maintain context.\n`;
  }

  // 8b. HYBRID REASONING INSTRUCTION
  prompt += `## IMPORTANT: RESPONSE MODE\n`;
  prompt += `If the user asks a question about your previous conversations, their history, or to summarize past sessions (Memory-focused query):\n`;
  prompt += `- USE THE 'RELEVANT PAST CONVERSATIONS' as your primary source.\n`;
  prompt += `- DO NOT say "No relevant evidence found" if the answer is in the past memories.\n`;
  prompt += `- Fill the JSON fields using the historical context (e.g., 'resourceInsights' can summarize past findings).\n`;
  prompt += `\n`;

  // 9. REQUIRED OUTPUT FORMAT
  prompt += `## REQUIRED OUTPUT FORMAT\n`;
  prompt += `Return ONLY this JSON object. No text before or after. No markdown fences.\n`;
  prompt += `{
  "conditionOverview": "2-3 sentence overview of ${disease} relevant to this query. Cite sources.",
  "researchInsights": [
    {
      "finding": "Unified research finding that combines data from both literature and trials.",
      "sourceRefs": ["P1", "T1"],
      "confidence": "high|moderate|low",
      "explanation": "Summarize how the trials and papers confirm or contradict each other for this specific finding."
    }
  ],
  "clinicalTrials": [
    {
      "title": "Trial title",
      "citation": "T1",
      "status": "RECRUITING|COMPLETED|etc",
      "relevance": "Why this trial matters for this patient",
      "location": "Trial location",
      "contact": "Contact info if available"
    }
  ],
  "researchGaps": "What the literature does NOT cover about this query. Be honest.",
  "patientGuidance": "Practical next steps for the patient, grounded in the research. Not medical advice.",
  "disclaimer": "This is research information only. Consult a qualified healthcare professional before making any medical decisions.",
  "sourceAttribution": ["P1", "P3", "T1"]
}`;

  return prompt;
}

module.exports = { buildUserPrompt };
