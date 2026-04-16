const http = require('http');

console.log("Starting SSE Stream Test...");
const startTime = Date.now();

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const postData = JSON.stringify({
  disease: "diabetes",
  query: "insulin therapy and blood glucose control",
  patientName: "Test Patient",
  location: "New York"
});

const req = http.request(options, (res) => {
  console.log(`[HTTP] Status: ${res.statusCode}`);
  console.log(`[HTTP] Content-Type: ${res.headers['content-type']}`);
  console.log("-------------------------------------------------");

  let buffer = '';

  res.on('data', (chunk) => {
    buffer += chunk.toString();
    
    // Process full SSE payloads split by \n\n
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n\n')) !== -1) {
      const eventText = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 2);
      
      const lines = eventText.split('\n');
      let eventType = 'message';
      let data = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.substring(7);
        } else if (line.startsWith('data: ')) {
          data = line.substring(6);
        }
      }

      const elapsedMs = Date.now() - startTime;
      const formattedTime = `+${elapsedMs}ms`.padEnd(8, ' ');

      if (eventType === 'token') {
        // Stream token chunks continuously on the same line to visually represent ChatGPT-style formatting
        process.stdout.write(JSON.parse(data).text);
      } else if (eventType === 'results') {
        const parsed = JSON.parse(data);
        console.log(`\n\n[${formattedTime}] 📡 [EVENT: ${eventType}] Received ${parsed.publications.length} publications and ${parsed.trials.length} trials.`);
        console.log(`[${formattedTime}] 🤖 [MODEL STREAMING STARTING...]\n`);
      } else if (eventType === 'complete') {
        console.log(`\n\n[${formattedTime}] ✅ [EVENT: ${eventType}] Pipeline finished!`);
      } else {
        const parsed = data ? JSON.parse(data) : {};
        const msg = parsed.message ? parsed.message : '';
        console.log(`\n[${formattedTime}] 🔔 [EVENT: ${eventType}] ${msg}`);
      }
    }
  });

  res.on('end', () => {
    console.log(`\n[+${Date.now() - startTime}ms] [HTTP] Stream connection closed.`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
