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
1. Analyze the 'User Question' in the context of the 'Disease of Interest' and 'Patient Context'.
2. If 'needsSearch' is true, you MUST expand the query into a scientific search string that ALWAYS includes the Disease of Interest.
   - Example: If Query is "Deep Brain Stimulation" and Disease is "Parkinson's", search "Deep Brain Stimulation + Parkinson's disease".
3. **CRITICAL for ClinicalTrials.gov**: The 'trialsCondition' must be kept BROAD to ensure hits. 
   - Example: If the disease is "Advanced Non-Small Cell Lung Cancer (NSCLC) – Adenocarcinoma subtype", set 'trialsCondition' to "Non-Small Cell Lung Cancer".
   - Never include long descriptive phrases or specific subtypes like "Adenocarcinoma" in the 'trialsCondition' field if it makes the term too narrow.
4. If the user is asking about history or meta-questions, set "needsSearch" to false.
5. Ensure 'pubmedQuery' uses proper scientific terminology (e.g., "Parkinson Disease" instead of just "Parkinson's").

Return ONLY a JSON object matching this exact schema:
{
  "needsSearch": true|false,
  "pubmedQuery": "Optimized string like 'Treatment X' AND 'Disease Y'",
  "openalexQuery": "Semantic string merging Query + Disease",
  "trialsCondition": "Exact Disease of Interest",
  "trialsIntervention": "The core treatment/query mentioned",
  "keyTerms": ["list", "of", "merged", "terms"],
  "diseaseAliases": ["alias1", "alias2"]
}`;

  return { system, user };
}

module.exports = { buildExpansionPrompt };
