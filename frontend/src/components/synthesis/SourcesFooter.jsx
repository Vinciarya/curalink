import CitationChip from '../ui/CitationChip';
import { useChatStore } from '../../store/chatStore';

export default function SourcesFooter({ sourceAttribution }) {
  const { highlightCitation } = useChatStore();

  return (
    <div className="mt-2 text-sm flex gap-3 items-center flex-wrap" style={{ color: 'var(--text-secondary)' }}>
      <span className="text-xs uppercase tracking-wider" style={{ fontFamily: '"DM Mono", monospace' }}>Sources Analyzed:</span>
      <div className="flex flex-wrap gap-2">
        {sourceAttribution.map(ref => (
          <CitationChip 
            key={ref} 
            citation={ref} 
            onClick={() => highlightCitation(ref)} 
          />
        ))}
      </div>
    </div>
  );
}
