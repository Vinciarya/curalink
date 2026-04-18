const http = require('http');

const data = JSON.stringify({
  patientName: "John Doe",
  disease: "Stage IV Lung Adenocarcinoma",
  query: "combination therapies",
  location: "New York"
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let rawData = '';
  res.on('data', (chunk) => {
    rawData += chunk;
  });
  res.on('end', () => {
    const lines = rawData.split('\n');
    lines.forEach(line => {
      if (line.startsWith('data: ')) {
        try {
          const payload = JSON.parse(line.substring(6));
          if (payload.response) {
            console.log(JSON.stringify(payload.response, null, 2));
          }
        } catch (e) {}
      }
    });
  });
});

req.on('error', (e) => {
  console.error(`Problem: ${e.message}`);
});
req.write(data);
req.end();
