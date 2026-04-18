import { useChatStore } from '../../store/chatStore';
import PublicationCard from '../sources/PublicationCard';
import TrialCard from '../sources/TrialCard';
import { Badge } from '../ui/badge';
import { BookOpen, Library, X } from 'lucide-react';
import { Button } from '../ui/button';

export default function SourcesPanel() {
  const { activeSourcesTab, setActiveSourcesTab, retrievalStats, publications, trials, highlightedCitation, toggleSourcesPanel } = useChatStore();

  return (
    <div className="w-[350px] shrink-0 border-l border-border bg-background h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-border bg-transparent">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[14px] font-black tracking-widest uppercase text-foreground flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Library className="w-4 h-4" />
            </div>
            Evidence Box
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSourcesPanel}
            className="h-8 w-8 rounded-lg text-muted hover:text-foreground hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {retrievalStats ? (
          <div className="flex items-center gap-3 bg-accent-soft border border-border p-3 rounded-xl">
            <div className="flex-1">
               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Retrieval Metrics</p>
               <p className="text-xl font-black text-foreground">{retrievalStats.total}</p>
            </div>
            <div className="h-8 w-px bg-border " />
            <div className="flex-1">
               <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Ranked</p>
               <p className="text-xl font-black text-foreground">{publications.length + trials.length}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex gap-1 p-1 rounded-xl bg-accent-light border border-border">
          <button
            onClick={() => setActiveSourcesTab('publications')}
            className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-wider transition-all ${
              activeSourcesTab === 'publications'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-foreground hover:bg-white/10'
            }`}
          >
            Literature
            {publications.length > 0 ? <span className="ml-1.5 opacity-50 text-[9px]">[{publications.length}]</span> : null}
          </button>
          <button
            onClick={() => setActiveSourcesTab('trials')}
            className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-wider transition-all ${
              activeSourcesTab === 'trials'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-foreground hover:bg-white/10'
            }`}
          >
            Trials
            {trials.length > 0 ? <span className="ml-1.5 opacity-50 text-[9px]">[{trials.length}]</span> : null}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {activeSourcesTab === 'publications' ? (
          publications.length > 0 ? publications.map((pub, index) => (
            <PublicationCard key={pub.id || index} publication={pub} index={index} isHighlighted={highlightedCitation === pub.citation || highlightedCitation === pub.id} />
          )) : <div className="text-center py-12 px-6 border border-dashed rounded-2xl border-white/10 bg-white/[0.02]">
                 <BookOpen className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                 <p className="text-xs text-slate-500 font-medium">No publications found for this context</p>
               </div>
        ) : (
          trials.length > 0 ? trials.map((trial, index) => (
            <TrialCard key={trial.id || index} trial={trial} index={index} isHighlighted={highlightedCitation === trial.citation || highlightedCitation === trial.id} />
          )) : <div className="text-center py-12 px-6 border border-dashed rounded-2xl border-white/10 bg-white/[0.02]">
                 <Library className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                 <p className="text-xs text-slate-500 font-medium">No clinical trials found for this context</p>
               </div>
        )}
      </div>
    </div>
  );
}

