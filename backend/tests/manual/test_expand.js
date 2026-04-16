require('dotenv').config();
const { expand } = require('./src/services/queryExpander');
expand({ disease: "Parkinson's disease", query: 'deep brain stimulation', location: 'Toronto' })
  .then(result => {
    console.log('Query expansion OK:');
    console.log('  pubmedQuery:', result.pubmedQuery);
    console.log('  trialsCondition:', result.trialsCondition);
    console.log('  keyTerms:', result.keyTerms);
    console.log('  Expected: query contains disease context =', result.pubmedQuery.toLowerCase().includes('parkinson'));
  });
