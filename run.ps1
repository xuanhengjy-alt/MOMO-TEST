$ErrorActionPreference = 'SilentlyContinue'

Write-Host "[1/5] Freeing port 3001..."
try {
  $pids = Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | Get-Unique
  if ($pids) { $pids | ForEach-Object { Stop-Process -Id $_ -Force } }
} catch {}

Write-Host "[2/5] Freeing port 8000..."
try {
  $pids8000 = Get-NetTCPConnection -LocalPort 8000 | Select-Object -ExpandProperty OwningProcess | Get-Unique
  if ($pids8000) { $pids8000 | ForEach-Object { Stop-Process -Id $_ -Force } }
} catch {}

Write-Host "[3/5] Starting backend (http://localhost:3001)..."
try {
  $backendPath = Join-Path $PSScriptRoot 'backend'
  if (Test-Path (Join-Path $backendPath 'package.json')) {
    Start-Process -WindowStyle Minimized -WorkingDirectory $backendPath cmd.exe -ArgumentList '/c','set PORT=3001 && set NODE_ENV=development && npm run dev'
  }
} catch {}

Write-Host "[4/5] Starting frontend static server (http://localhost:8000)..."
try {
  if (Test-Path (Join-Path $PSScriptRoot 'serve-frontend.js')) {
    Start-Process -WindowStyle Minimized -WorkingDirectory $PSScriptRoot node -ArgumentList 'serve-frontend.js'
  } else {
    Start-Process -WindowStyle Minimized -WorkingDirectory $PSScriptRoot python -ArgumentList '-m','http.server','8000'
  }
} catch {}

Start-Sleep -Seconds 2

Write-Host "[5/5] Opening browser: http://localhost:8000/"
Start-Process 'http://localhost:8000/'

Write-Host "Done. If the page fails to load, ensure Node/Python is installed and check port 3000/8000 usage."


