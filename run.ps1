$ErrorActionPreference = 'SilentlyContinue'

Write-Host "[1/5] Freeing port 3000..."
try {
  $pids = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Get-Unique
  if ($pids) { 
    $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "Freed port 3000"
  } else {
    Write-Host "Port 3000 is already free"
  }
} catch {
  Write-Host "Port 3000 is already free"
}

Write-Host "[2/5] Starting unified development server (http://localhost:3000)..."
try {
  Start-Process -WindowStyle Minimized -WorkingDirectory $PSScriptRoot cmd.exe -ArgumentList '/c','set PORT=3000 && set NODE_ENV=development && node local-server.js'
} catch {
  Write-Host "Failed to start server. Please run 'node local-server.js' manually."
}

Start-Sleep -Seconds 3

Write-Host "[3/5] Opening browser: http://localhost:3000/"
Start-Process 'http://localhost:3000/'

Write-Host "Done. If the page fails to load, ensure Node is installed and check port 3000 usage."


