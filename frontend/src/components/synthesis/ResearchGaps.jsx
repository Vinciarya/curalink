export default function ResearchGaps({ text }) {
  return (
    <div className="p-4 rounded-r-lg border border-l-3 my-4" style={{ backgroundColor: 'rgba(240, 164, 41, 0.06)', borderColor: 'rgba(240, 164, 41, 0.2)', borderLeftColor: 'var(--accent-warning)', borderLeftWidth: '3px' }}>
      <div className="mb-2 text-[11px] uppercase tracking-wider" style={{ fontFamily: '"DM Mono", monospace', color: 'var(--accent-warning)' }}>Research Gaps</div>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {text}
      </div>
    </div>
  );
}
