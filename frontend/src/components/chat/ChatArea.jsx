import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import MessageBubble from './MessageBubble';
import StatusBar from './StatusBar';
import SearchTermTags from './SearchTermTags';
import InputForm from './InputForm';
import AnswerWorkspace from '../layout/AnswerWorkspace';
import { PlusCircle, Search, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { SidebarTrigger } from '../ui/sidebar';

export default function ChatArea() {
  const { messages, isStreaming, streamingText, searchTerms, pipelineStatus, isPatientFormOpen, newSession } = useChatStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText, pipelineStatus, searchTerms]);

  return (
    <div className="flex-1 flex flex-col relative h-full min-w-0 bg-background">
      {/* Header Bar */}
      {!isPatientFormOpen && (
        <header className="h-[70px] border-b border-border flex items-center justify-between px-8 shrink-0 bg-white/50 z-20">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2 hover:bg-black/5 text-muted hover:text-foreground" />
            <div className="h-6 w-px bg-border mx-1" />
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-foreground">Research Session</h1>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Active Protocol</span>
                <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-black">Encrypted</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={newSession}
            variant="outline" 
            className="rounded-xl border-border bg-white hover:bg-accent-light text-foreground font-bold transition-all gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            New Research
          </Button>
        </header>
      )}

      {/* Messages / Results Area */}
      <div 
        ref={scrollRef} 
        className={`flex-1 overflow-y-auto px-6 pt-6 pb-32 flex flex-col ${isPatientFormOpen ? 'justify-center items-center' : ''}`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {isPatientFormOpen ? (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
             <InputForm />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">
            {messages.length > 0 && !isStreaming && (
              <div className="animate-in fade-in duration-1000">
                <AnswerWorkspace />
              </div>
            )}

            {messages.map((msg, index) => (
              <MessageBubble key={msg.id || index} message={msg} />
            ))}
            
            {isStreaming && (
              <div className="flex flex-col mb-4 w-full animate-in fade-in duration-300">
                <StatusBar />
                <SearchTermTags terms={searchTerms} />
                
                {(streamingText) && (
                  <div className="mt-8 p-8 rounded-3xl bg-accent-soft border border-border">
                    <div className="flex items-center gap-2.5 mb-6 text-primary">
                       <Sparkles className="w-5 h-5 animate-pulse" />
                       <span className="text-sm font-black uppercase tracking-widest">Synthesis in Progress</span>
                    </div>
                    <div className="font-sans text-[16px] font-medium leading-relaxed text-foreground whitespace-pre-wrap">
                      {streamingText}
                      <span className="inline-block w-2 h-5 ml-1 mb-[-4px] animate-pulse bg-primary"></span>
                    </div>
                  </div>
                )}
                
                {pipelineStatus === 'searching' && !streamingText && (
                   <div className="mt-8 space-y-4">
                      <div className="h-4 w-3/4 skeleton"></div>
                      <div className="h-4 w-1/2 skeleton text-teal-500/20"></div>
                      <div className="h-4 w-full skeleton text-teal-500/10"></div>
                   </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Input Area (Only for follow-ups) */}
      {!isPatientFormOpen && (
        <div className="absolute inset-x-0 bottom-0 p-6 bg-background">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto">
            <InputForm />
          </div>
        </div>
      )}
    </div>
  )
}

