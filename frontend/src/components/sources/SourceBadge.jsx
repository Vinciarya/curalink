export default function SourceBadge({ source }) {
  const sourceLower = source?.toLowerCase() || '';
  let badgeClass = '';
  let label = source;

  if (sourceLower.includes('pubmed')) {
    badgeClass = 'source-badge--pubmed';
    label = 'PubMed';
  } else if (sourceLower.includes('openalex')) {
    badgeClass = 'source-badge--openalex';
    label = 'OpenAlex';
  } else if (sourceLower.includes('trial')) {
    badgeClass = 'source-badge--trials';
    label = 'ClinicalTrials';
  } else {
    badgeClass = 'border bg-transparent text-gray-400 border-gray-700';
  }

  return (
    <span className={`source-badge ${badgeClass}`}>
      {label}
    </span>
  );
}
