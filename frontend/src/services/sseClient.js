const getChatPayload = ({ disease, query, location, sessionId, userId }) => {
  const payload = { disease, query, userId };

  if (location) payload.location = location;
  if (sessionId) payload.sessionId = sessionId;

  return payload;
};

const parseSseChunk = (chunk) => {
  const lines = chunk.split('\n');
  let eventName = 'message';
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith('event: ')) {
      eventName = line.slice(7).trim();
      continue;
    }

    if (line.startsWith('data: ')) {
      dataLines.push(line.slice(6));
    }
  }

  if (!dataLines.length) return null;

  try {
    return {
      eventName,
      data: JSON.parse(dataLines.join('\n'))
    };
  } catch {
    return null;
  }
};

export const streamChat = async ({ disease, query, location, sessionId, userId }, callbacks) => {
  const {
    onInit,
    onExpanded,
    onResults,
    onToken,
    onComplete,
    onError,
    onStatusChange
  } = callbacks;

  try {
    onStatusChange('connecting');

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getChatPayload({ disease, query, location, sessionId, userId }))
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;

      try {
        const errorPayload = await response.json();
        message = errorPayload.error || message;
      } catch {
        // Keep the fallback HTTP status message.
      }

      throw new Error(message);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/event-stream')) {
      const data = await response.json();

      if (data.sessionId) onInit({ sessionId: data.sessionId });
      if (data.retrievalStats) {
        onResults({
          publications: data.publications || [],
          trials: data.trials || [],
          stats: data.retrievalStats
        });
      }
      if (data.response) onComplete(data.response);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        const parsed = parseSseChunk(chunk);
        if (!parsed) continue;

        handleEvent(parsed.eventName, parsed.data, {
          onInit,
          onExpanded,
          onResults,
          onToken,
          onComplete,
          onError,
          onStatusChange
        });
      }
    }
  } catch (err) {
    onError(err.message);
  }
};

const handleEvent = (eventName, event, callbacks) => {
  const { onInit, onExpanded, onResults, onToken, onComplete, onError, onStatusChange } = callbacks;

  switch (eventName) {
    case 'init':
      onInit({ sessionId: event.sessionId });
      onStatusChange('connecting');
      break;

    case 'expanded':
      onExpanded({ keyTerms: event.expanded?.keyTerms || [] });
      onStatusChange('searching');
      break;

    case 'results':
      onResults({
        publications: event.publications || [],
        trials: event.trials || [],
        stats: event.retrievalStats
      });
      onStatusChange('synthesizing');
      break;

    case 'token':
      onToken(event.text || '');
      break;

    case 'complete':
      onComplete(event.response);
      onStatusChange('complete');
      break;

    case 'error':
      onError(event.error || 'Pipeline failed during execution.');
      break;

    default:
      console.warn('[SSE] Unknown event type:', eventName);
  }
};
