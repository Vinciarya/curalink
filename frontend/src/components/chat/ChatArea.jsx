import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import MessageBubble from './MessageBubble';
import StatusBar from './StatusBar';
import SearchTermTags from './SearchTermTags';
import InputForm from './InputForm';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function ChatArea() {
  const { messages, isStreaming, streamingText, searchTerms, pipelineStatus, isPatientFormOpen } = useChatStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText, pipelineStatus, searchTerms]);

  return (
    <div className="flex-1 flex flex-col relative h-full min-w-0" style={{ backgroundColor: 'transparent' }}>
      {/* Header Bar */}
      {!isPatientFormOpen && (
        <header className="h-[60px] border-b flex items-center justify-between px-6 shrink-0" style={{ borderColor: 'var(--bg-border)', backgroundColor: 'transparent' }}>
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-9 w-9" />
            <h1 className="text-xl font-serif tracking-wide" style={{ color: 'var(--text-primary)' }}>Research Session</h1>
          </div>
        </header>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-32 flex flex-col gap-6" style={{ scrollBehavior: 'smooth' }}>
        {messages.map((msg, index) => (
          <MessageBubble key={msg.id || index} message={msg} />
        ))}
        
        {isStreaming && (
          <div className="flex flex-col mb-4 max-w-3xl mx-auto w-full">
            <StatusBar />
            <SearchTermTags terms={searchTerms} />
            
            {(streamingText) && (
              <div className="mt-6 font-light leading-relaxed text-[15px]" style={{ color: 'var(--text-primary)' }}>
                {streamingText}
                <span className="inline-block w-2 h-4 ml-1 mb-[-2px] animate-pulse bg-current" style={{ color: 'var(--accent-primary)' }}></span>
              </div>
            )}
            
            {pipelineStatus === 'searching' && !streamingText && (
               <div className="skeleton h-24 w-full mt-4"></div>
            )}
          </div>
        )}
      </div>

      {/* Put form at the bottom absolute or inside flex */}
      <div className="mt-auto">
        <InputForm />
      </div>
    </div>
  )
}
