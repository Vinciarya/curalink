Write-Output "--- TEST 1: Health check ---"
curl.exe http://localhost:5000/health
Write-Output "`n"

Write-Output "--- TEST 2: Validation rejects bad input ---"
curl.exe -s -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d '{\"query\":\"what is the treatment\"}'
Write-Output "`n"

Write-Output "--- TEST 3: FULL PIPELINE ---"
$resp = curl.exe -s -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d '{\"disease\":\"diabetes\",\"query\":\"insulin therapy and blood glucose control\",\"patientName\":\"Test Patient\",\"location\":\"New York\"}'

$sessionId = ''
try {
  $sessionId = ($resp | ConvertFrom-Json).sessionId
} catch {
  Write-Output "Failed to extract JSON from TEST 3"
}

Write-Output $resp | python -m json.tool
Write-Output "`n"

if ($sessionId) {
  Write-Output "--- TEST 4: Follow-up using same session ---"
  $payload = "{\`"sessionId\`":\`"$sessionId\`",\`"disease\`":\`"diabetes\`",\`"query\`":\`"Can I take metformin with insulin?\`"}"
  curl.exe -s -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d $payload | python -m json.tool
  Write-Output "`n"
}

Write-Output "--- TEST 5: Sessions endpoint ---"
curl.exe -s http://localhost:5000/api/sessions
Write-Output "`n"
