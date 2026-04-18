const { callRaw } = require('./groqService');
const { buildExpansionPrompt } = require('../prompts/expansionPrompt');

const FAST_MODEL = 'llama-3.1-8b-instant';

function simpleFallback({ disease, query }) {
  return {
    pubmedQuery: `${query} AND ${disease}`,
    openalexQuery: `${query} ${disease}`,
    trialsCondition: disease,
    trialsIntervention: query,
    keyTerms: [query, disease],
    diseaseAliases: [disease]
  };
}

async function expand({ disease, query, location, conversationHistory }) {
  try {
    const { system, user } = buildExpansionPrompt({ disease, query, location, conversationHistory });
    const responseStr = await callRaw({
      model: FAST_MODEL,
      system: system,
      user: user,
      maxTokens: 512,
      temperature: 0.1
    });

    let cleanStr = responseStr.trim();
    if (cleanStr.startsWith('```json')) {
      cleanStr = cleanStr.substring(7);
    } else if (cleanStr.startsWith('```')) {
      cleanStr = cleanStr.substring(3);
    }
    if (cleanStr.endsWith('```')) {
      cleanStr = cleanStr.substring(0, cleanStr.length - 3);
    }
    cleanStr = cleanStr.trim();

    return JSON.parse(cleanStr);
  } catch (error) {
    console.warn(`[QueryExpander] Warning: error expanding query. using fallback. Error: ${error.message}`);
    return simpleFallback({ disease, query });
  }
}

module.exports = { expand, simpleFallback };
