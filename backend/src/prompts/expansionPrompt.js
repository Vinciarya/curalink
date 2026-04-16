function buildExpansionPrompt({ disease, query, location }) {
  const system = `You are a medical query expansion engine. 
Your only job is to expand user queries into better search terms for PubMed, 
OpenAlex, and ClinicalTrials.gov. 
Return ONLY JSON. No explanation. No markdown.`;

  const user = `Expand the following medical query:
Disease: ${disease}
Query: ${query}
${location ? `Location: ${location}\n` : ''}

Example: disease="Parkinson's disease", query="deep brain stimulation"
→ pubmedQuery: "(deep brain stimulation[MeSH] OR DBS[Title/Abstract]) AND (Parkinson disease[MeSH])"
→ openalexQuery: "deep brain stimulation neurostimulation Parkinson disease treatment"
→ trialsCondition: "Parkinson Disease"
→ trialsIntervention: "deep brain stimulation"

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
