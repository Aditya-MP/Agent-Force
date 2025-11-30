$ErrorActionPreference = "Continue"
$maxRetries = 0
$retryCount = 0

Write-Host "🚀 Starting Agent Forces Backend..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

while ($true) {
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] Starting Node server..." -ForegroundColor Cyan
    
    # Start the Node process and capture its output
    $process = Start-Process -FilePath "node" -ArgumentList "index.js" -PassThru -NoNewWindow
    $processId = $process.Id
    
    Write-Host "✅ Backend started (PID: $processId)" -ForegroundColor Green
    Write-Host "🌐 Open: http://localhost:3001" -ForegroundColor Cyan
    
    # Wait for process to finish
    $process.WaitForExit()
    
    $exitCode = $process.ExitCode
    Write-Host "❌ Backend stopped with exit code: $exitCode" -ForegroundColor Red
    
    $retryCount++
    Write-Host "⏳ Restarting in 2 seconds... (Attempt $retryCount)" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}
