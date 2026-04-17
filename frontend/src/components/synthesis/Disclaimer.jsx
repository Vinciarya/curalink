export default function Disclaimer({ text }) {
  return (
    <div className="text-xs mt-6 pt-4 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--bg-border)' }}>
      <strong className="block mb-1 opacity-70">Disclaimer:</strong>
      <p className="opacity-70 leading-relaxed">{text}</p>
    </div>
  );
}
