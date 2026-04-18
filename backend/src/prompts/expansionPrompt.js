function buildExpansionPrompt({ disease, query, location, conversationHistory = [] }) {
  const system = `You are a medical query expansion engine. 
Your only job is to expand user queries into better search terms for PubMed, 
OpenAlex, and ClinicalTrials.gov. 
Return ONLY JSON. No explanation. No markdown.`;

  let user = '';
  
  if (conversationHistory.length > 0) {
    user += `## CONVERSATION HISTORY\n`;
    conversationHistory.forEach(msg => {
      user += `[${msg.role.toUpperCase()}]: ${msg.content}\n`;
    });
    user += `\n`;
  }

  user += `## NEW USER QUERY
Patient Context: ${disease}
${location ? `Location: ${location}\n` : ''}
User Question: ${query}

## INSTRUCTIONS
1. Analyze the 'User Question' in the context of the 'CONVERSATION HISTORY' and 'Patient Context'.
2. If the question contains pronouns (e.g. "it", "they", "this treatment") or is a follow-up, resolve them using history.
3. Generate optimized search terms for scientific databases.

Return ONLY a JSON object matching this exact schema:
{
  "pubmedQuery": "optimized PubMed query with MeSH terms and disease context",
  "openalexQuery": "natural language query for OpenAlex semantic search",
  "trialsCondition": "exact condition term for ClinicalTrials.gov",
  "trialsIntervention": "intervention/treatment term for ClinicalTrials.gov",
  "keyTerms": ["term1", "term2", "term3", "term4", "term5"],
  "diseaseAliases": ["alias1", "alias2"]
}`;

  return { system, user };
}

module.exports = { buildExpansionPrompt };
