import { useChatStore } from '../../store/chatStore';
import PublicationCard from '../sources/PublicationCard';
import TrialCard from '../sources/TrialCard';
import { Badge } from '../ui/badge';
import { BookOpen } from 'lucide-react';

export default function SourcesPanel() {
  const { activeSourcesTab, setActiveSourcesTab, retrievalStats, publications, trials, highlightedCitation } = useChatStore();

  return (
    <div className="w-[320px] shrink-0 border-l border-white/5 bg-black/40 backdrop-blur-xl h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-6 px-1">
        <h2 className="text-[17px] font-semibold tracking-wide text-slate-100 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          Evidence Box
        </h2>
        <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
          Ranked literature & trials for context.
        </p>
      </div>

      {retrievalStats ? (
        <div className="mb-6 px-1">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-md">
            <Badge variant="secondary" className="text-[10px] bg-white/10 text-slate-300 hover:bg-white/20 border-0">{retrievalStats.total} candidates</Badge>
            <Badge className="text-[10px] bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-0">{publications.length + trials.length} ranked</Badge>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2 mb-6 px-1 bg-black/20 p-1.5 rounded-xl border border-white/5">
        <button
          onClick={() => setActiveSourcesTab('publications')}
          className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${
            activeSourcesTab === 'publications'
              ? 'bg-white/10 text-slate-100 shadow-sm border border-white/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          Publications
          {publications.length > 0 ? <span className="ml-1 opacity-70">({publications.length})</span> : null}
        </button>
        <button
          onClick={() => setActiveSourcesTab('trials')}
          className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${
            activeSourcesTab === 'trials'
              ? 'bg-white/10 text-slate-100 shadow-sm border border-white/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          Trials
          {trials.length > 0 ? <span className="ml-1 opacity-70">({trials.length})</span> : null}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {activeSourcesTab === 'publications' ? (
          publications.length > 0 ? publications.map((pub, index) => (
            <PublicationCard key={pub.id || index} publication={pub} index={index} isHighlighted={highlightedCitation === pub.citation || highlightedCitation === pub.id} />
          )) : <div className="text-center text-[13px] text-slate-500 p-6 border border-dashed rounded-xl border-white/10 bg-white/5">No publications linked</div>
        ) : (
          trials.length > 0 ? trials.map((trial, index) => (
            <TrialCard key={trial.id || index} trial={trial} index={index} isHighlighted={highlightedCitation === trial.citation || highlightedCitation === trial.id} />
          )) : <div className="text-center text-[13px] text-slate-500 p-6 border border-dashed rounded-xl border-white/10 bg-white/5">No clinical trials linked</div>
        )}
      </div>
    </div>
  );
}
