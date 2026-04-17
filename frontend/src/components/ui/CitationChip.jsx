import { useChatStore } from '../../store/chatStore';

export default function CitationChip({ citation, onClick }) {
  const highlightedCitation = useChatStore(s => s.highlightedCitation);
  const isActive = highlightedCitation === citation;

  return (
    <button
      onClick={onClick}
      className={`citation-chip ${isActive ? 'citation-chip--active' : ''}`}
      title={`View source ${citation}`}
      aria-label={`View source ${citation}`}
    >
      {citation}
    </button>
  );
}
