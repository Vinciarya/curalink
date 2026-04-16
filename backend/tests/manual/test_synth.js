require('dotenv').config();
const { synthesize } = require('./src/services/groqService');
const mockPubs = [{
  title: 'Deep brain stimulation in Parkinson disease: 2023 meta-analysis',
  authors: ['Smith J', 'Jones M'],
  year: 2023,
  source: 'PubMed',
  abstract: 'A meta-analysis of 15 RCTs found DBS significantly improved UPDRS motor scores (mean improvement 28.5 points, p<0.001) compared to best medical therapy in Parkinson disease patients.',
  url: 'https://pubmed.ncbi.nlm.nih.gov/12345',
  score: 85.2
}];
synthesize({
  disease: "Parkinson's disease",
  userQuery: 'Is deep brain stimulation effective?',
  publications: mockPubs,
  trials: [],
  conversationHistory: [],
  retrievalStats: { pubmed: 1, openalex: 0, trials: 0, total: 1 }
}).then(r => {
  console.log('Groq synthesis OK:');
  console.log('  conditionOverview:', r.conditionOverview?.slice(0, 100) + '...');
  console.log('  keyInsights count:', r.keyInsights?.length);
  console.log('  sourcesUsed:', r.sourcesUsed);
  console.log('  Has citation in keyInsights:', JSON.stringify(r.keyInsights).includes('[P'));
  console.log(JSON.stringify(r.keyInsights, null, 2));
  console.log('  model used:', r._meta?.model);
});
