function buildUserPrompt({ patientName, disease, userQuery, location, conversationHistory, publications, trials, retrievalStats }) {
  let prompt = '';

  // 1. PATIENT CONTEXT
  prompt += `## PATIENT CONTEXT\n`;
  if (patientName) prompt += `Patient Name: ${patientName}\n`;
  prompt += `Disease/Condition: ${disease}\n`;
  prompt += `Query: ${userQuery}\n`;
  if (location) prompt += `Location: ${location}\n`;
  prompt += `\n`;

  // 2. CONVERSATION HISTORY
  prompt += `## CONVERSATION HISTORY\n`;
  if (!conversationHistory || conversationHistory.length === 0) {
    prompt += `This is the first message in this session.\n`;
  } else {
    for (const msg of conversationHistory.slice(-5)) { // Use last N turns depending on context, let's say all
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
      if (abstract.length > 500) {
        abstract = abstract.substring(0, 500) + '...';
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
      if (eligibility.length > 400) {
        eligibility = eligibility.substring(0, 400) + '...';
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
  
  // 7. Location note
  if (location) {
    prompt += `Note: Patient is in ${location}. Prioritize geographically relevant trials.\n`;
  }

  // 8. Follow-up note
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `Note: This is a follow-up question. Use conversation history to maintain context.\n`;
  }
  prompt += `\n`;

  // 9. REQUIRED OUTPUT FORMAT
  prompt += `## REQUIRED OUTPUT FORMAT\n`;
  prompt += `Return ONLY this JSON object. No text before or after. No markdown fences.\n`;
  prompt += `{
  "conditionOverview": "2-3 sentence overview of ${disease} relevant to this query. Cite sources.",
  "keyInsights": [
    {
      "insight": "Specific finding, fully cited",
      "citations": ["P1", "P2"],
      "confidence": "high|moderate|low",
      "explanation": "Why this confidence level"
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
  "sourcesUsed": ["P1", "P3", "T2"]
}`;

  return prompt;
}

module.exports = { buildUserPrompt };
