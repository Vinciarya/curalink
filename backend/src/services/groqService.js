const Groq = require('groq-sdk');
const { buildSystemPrompt } = require('../prompts/systemPrompt');
const { buildUserPrompt } = require('../prompts/userPrompt');

const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';
const EMERGENCY_MODEL = 'llama3-8b-8192';

async function synthesize(params) {
  const { onStream, ...promptParams } = params;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const systemPrompt = buildSystemPrompt();

  const callModel = async (model, compress = false) => {
    // If we're on a smaller model, we compress the data to fit the 6k token limit
    const userPrompt = buildUserPrompt({
      ...promptParams,
      publications: compress ? promptParams.publications.slice(0, 5) : promptParams.publications,
      trials: compress ? promptParams.trials.slice(0, 3) : promptParams.trials
    });

    console.log(`[GROQ] Calling ${model} (Compressed: ${compress}) with streaming...`);
    const startTime = Date.now();
    
    const stream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: model,
      temperature: 0.2,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
      stream: true
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      fullContent += delta;
      if (delta && onStream) {
        onStream(delta);
      }
    }

    const processingMs = Date.now() - startTime;
    console.log(`[GROQ] Streaming success with ${model}.`);
    
    const parsed = JSON.parse(fullContent);
    return {
      ...parsed,
      _meta: { model, tokensUsed: 0, processingMs }
    };
  };

  try {
    return await callModel(PRIMARY_MODEL, false);
  } catch (error) {
    console.warn(`[GROQ] PRIMARY_MODEL error: ${error.message}. Falling back to ${FALLBACK_MODEL}.`);
    try {
      // Small models need compressed data (fewer papers/chars)
      return await callModel(FALLBACK_MODEL, true);
    } catch (fallbackError) {
      console.warn(`[GROQ] FALLBACK_MODEL error: ${fallbackError.message}. Falling back to ${EMERGENCY_MODEL}.`);
      try {
        return await callModel(EMERGENCY_MODEL, true);
      } catch (emergencyError) {
        console.error(`[GROQ] EMERGENCY_MODEL error: ${emergencyError.message}`);
        throw new Error('All Groq models (Primary, Fallback, and Emergency) failed or reached limits.');
      }
    }
  }
}

async function callRaw({ model = EMERGENCY_MODEL, system, user, maxTokens = 512, temperature = 0.1 }) {
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
