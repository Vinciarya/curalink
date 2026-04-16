const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const makeRequest = (postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(postData));
    req.end();
  });
};

const run = async () => {
  console.log("--- TEST 1: Health check ---");
  const healthRes = await fetch('http://localhost:5000/health');
  console.log(await healthRes.json());
  console.log();

  console.log("--- TEST 2: Validation rejects bad input ---");
  const t2 = await makeRequest({ query: "what is the treatment" });
  console.log("Status:", t2.statusCode);
  console.log(t2.data);
  console.log();

  console.log("--- TEST 3: FULL PIPELINE ---");
  const t3 = await makeRequest({
    disease: "diabetes",
    query: "insulin therapy and blood glucose control",
    patientName: "Test Patient",
    location: "New York"
  });
  console.log("Status:", t3.statusCode);
  const sessionId = t3.data?.sessionId;
  
  if (t3.data.response) {
     console.log("Condition Overview:", t3.data.response.conditionOverview);
     console.log("Stats:", t3.data.retrievalStats);
  } else {
     console.log("Failed. Complete resp:", t3.data);
  }
  console.log();

  if (sessionId) {
    console.log("--- TEST 4: Follow-up using same session ---");
    const t4 = await makeRequest({
      sessionId,
      disease: "diabetes",
      query: "Can I take metformin with insulin?"
    });
    console.log("Status:", t4.statusCode);
    if (t4.data.response) {
       console.log("Condition Overview:", t4.data.response.conditionOverview);
    } else {
       console.log("Failed. Complete resp:", t4.data);
    }
  }
  console.log();

  console.log("--- TEST 5: Sessions endpoint ---");
  const sessionsRes = await fetch('http://localhost:5000/api/sessions');
  console.log(await sessionsRes.json());
};

run().catch(console.error);
