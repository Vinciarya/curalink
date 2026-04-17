import InsightCard from './InsightCard';

export default function InsightsList({ insights }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-serif text-xl mb-2 tracking-wide" style={{ color: 'var(--text-primary)' }}>Key Clinical Insights</h3>
      {insights.map((insight, index) => (
        <InsightCard key={index} insight={insight} index={index} />
      ))}
    </div>
  );
}
