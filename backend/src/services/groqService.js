const Groq = require('groq-sdk');
const { buildSystemPrompt } = require('../prompts/systemPrompt');
const { buildUserPrompt } = require('../prompts/userPrompt');

const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'mixtral-8x7b-32768';
const FAST_MODEL = 'llama-3.1-8b-instant';

async function synthesize(params) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(params);

  const callModel = async (model) => {
    console.log(`[GROQ] Calling ${model}...`);
    const startTime = Date.now();
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: model,
      temperature: 0.2,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });
    const processingMs = Date.now() - startTime;
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    const tokensUsed = response.usage?.total_tokens || 0;
    console.log(`[GROQ] Success with ${model}. Tokens: ${tokensUsed}`);
    return {
      ...parsed,
      _meta: { model, tokensUsed, processingMs }
    };
  };

  try {
    return await callModel(PRIMARY_MODEL);
  } catch (error) {
    console.warn(`[GROQ] PRIMARY_MODEL error: ${error.message}. Falling back to FALLBACK_MODEL.`);
    try {
      return await callModel(FALLBACK_MODEL);
    } catch (fallbackError) {
      console.error(`[GROQ] FALLBACK_MODEL error: ${fallbackError.message}`);
      throw new Error('Both primary and fallback models failed.');
    }
  }
}

async function callRaw({ model = FAST_MODEL, system, user, maxTokens = 512, temperature = 0.1 }) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    model: model,
    temperature: temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content;
}

module.exports = { synthesize, callRaw };
