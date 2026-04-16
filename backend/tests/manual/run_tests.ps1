$proc = Start-Process node "server.js" -PassThru

# Give the server a few seconds to start up and connect to MongoDB
Start-Sleep -Seconds 5

Write-Output "--- TEST 1: Health check ---"
curl.exe http://localhost:5000/health
Write-Output "`n"

Write-Output "--- TEST 2: Validation rejects bad input ---"
curl.exe -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d '{"query":"what is the treatment"}'
Write-Output "`n"

Write-Output "--- TEST 3: FULL PIPELINE ---"
$resp = curl.exe -s -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d '{"disease":"diabetes","query":"insulin therapy and blood glucose control","patientName":"Test Patient","location":"New York"}'

# Extract session ID for next test
$sessionId = ($resp | ConvertFrom-Json).sessionId

Write-Output $resp | python -m json.tool
Write-Output "`n"

Write-Output "--- TEST 4: Follow-up using same session ---"
$payload = '{"sessionId":"' + $sessionId + '","disease":"diabetes","query":"Can I take metformin with insulin?"}'
curl.exe -s -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d $payload | python -m json.tool
Write-Output "`n"

Write-Output "--- TEST 5: Sessions endpoint ---"
curl.exe http://localhost:5000/api/sessions
Write-Output "`n"

Stop-Process -Id $proc.Id -Force
