import { Badge } from '../ui/badge';
import { ExternalLink } from 'lucide-react';

export default function ClinicalTrialSummary({ trial }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-white flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-[9px] uppercase tracking-widest">{trial.status || 'Unknown'}</Badge>
        <span className="text-[10px] font-mono text-primary font-bold">{trial.citation}</span>
      </div>
      <h4 className="font-bold text-sm leading-snug" style={{ color: 'var(--text)' }}>{trial.title}</h4>
      <p className="text-xs leading-relaxed italic" style={{ color: 'var(--muted)' }}>{trial.relevance}</p>
      {trial.location && (
        <p className="text-[10px] font-medium text-muted uppercase tracking-tight">📍 {trial.location}</p>
      )}
    </div>
  );
}
