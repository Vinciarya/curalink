import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { ArrowUpRight, Send } from 'lucide-react';
import PatientForm from '../ui/PatientForm';
import { streamChat } from '../../services/sseClient';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export default function InputForm() {
  const { isPatientFormOpen, patientContext, setStatus, startStream, onInit, onExpanded, onResults, onToken, onComplete, onError, addUserMessage, pipelineStatus } = useChatStore();
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || pipelineStatus !== 'idle' && pipelineStatus !== 'complete' && pipelineStatus !== 'error') return;
    executeSearch(query);
    setQuery('');
  };

  const executeSearch = (searchQuery) => {
    addUserMessage(searchQuery);
    startStream();

    const { patientContext: currentContext, sessionId: currentSessionId } = useChatStore.getState();

    streamChat({
      disease: currentContext.disease,
      query: searchQuery,
      location: currentContext.location,
      sessionId: currentSessionId
    }, {
      onInit,
      onExpanded,
      onResults,
      onToken,
      onComplete,
      onError,
      onStatusChange: setStatus
    });
  };

  useEffect(() => {
    const handleStartResearch = (e) => {
      executeSearch(e.detail.query);
    };

    window.addEventListener('curalink:start-research', handleStartResearch);
    return () => window.removeEventListener('curalink:start-research', handleStartResearch);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFollowUpSubmit(e);
    }
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  if (isPatientFormOpen) {
    return (
      <div className="w-full flex-shrink-0 p-6 flex items-center justify-center">
        <PatientForm />
      </div>
    );
  }

  const isProcessing = pipelineStatus !== 'idle' && pipelineStatus !== 'complete' && pipelineStatus !== 'error';

  return (
    <div className="relative z-10 w-full border-t border-[var(--bg-border)] bg-[rgba(12,16,22,0.86)] px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        {patientContext.disease ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Context</Badge>
            <Badge>{patientContext.disease}</Badge>
            {patientContext.location ? <Badge variant="secondary">{patientContext.location}</Badge> : null}
          </div>
        ) : null}

        <form onSubmit={handleFollowUpSubmit} className="relative flex w-full items-end overflow-hidden rounded-2xl border border-[var(--bg-border)] bg-[linear-gradient(180deg,rgba(16,22,30,0.95),rgba(10,14,20,0.95))] transition-colors">
          <textarea
            ref={textareaRef}
            className="flex-1 max-h-[120px] resize-none bg-transparent px-5 py-4 outline-none"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Ask a follow-up question..."
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isProcessing}
          />
          <div className="flex items-center gap-2 p-2">
            <Button
              type="submit"
              disabled={!query.trim() || isProcessing}
              size="lg"
              className="h-11 w-11 rounded-xl p-0"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between px-1 text-xs text-[var(--text-muted)]">
          <span>Shift + Enter for a new line</span>
          <span className="inline-flex items-center gap-1">
            Evidence-grounded answer
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}
