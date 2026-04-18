export default function ResearchGaps({ text }) {
  return (
    <div className="p-5 rounded-2xl border border-border my-6 bg-[#FFFFFF]">
      <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-primary">Research Gaps</div>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
        {text}
      </div>
    </div>
  );
}
