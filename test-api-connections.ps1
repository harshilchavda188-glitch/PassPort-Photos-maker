# API Connection Verification Script
# Tests all background removal services

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  API Connection Verification Tool" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorActionPreference = 'Continue'

# Colors
$success = "Green"
$error_color = "Red"
$warning = "Yellow"
$info = "Blue"

# Test counters
$passed = 0
$failed = 0
$warnings = 0

function Test-Service {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [int]$Timeout = 5
    )
    
    Write-Host "Testing: $Name ... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -TimeoutSec $Timeout -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ PASS" -ForegroundColor $success
            $script:passed++
            return $true
        } else {
            Write-Host "✗ FAIL (Status: $($response.StatusCode))" -ForegroundColor $error_color
            $script:failed++
            return $false
        }
    } catch {
        Write-Host "✗ FAIL ($($_.Exception.Message))" -ForegroundColor $error_color
        $script:failed++
        return $false
    }
}

function Test-EnvVariable {
    param(
        [string]$Name,
        [string]$Value,
        [bool]$Required = $true
    )
    
    Write-Host "Checking: $Name ... " -NoNewline
    
    if ([string]::IsNullOrWhiteSpace($Value) -or $Value -eq "your-clipdrop-api-key" -or $Value -eq "your-replicate-api-key") {
        if ($Required) {
            Write-Host "X MISSING or not configured" -ForegroundColor $error_color
            $script:failed++
            return $false
        } else {
            Write-Host "- OPTIONAL (not set)" -ForegroundColor $warning
            $script:warnings++
            return $null
        }
    } else {
        Write-Host "OK CONFIGURED" -ForegroundColor $success
        $script:passed++
        return $true
    }
}

# Load environment variables
Write-Host "Loading Environment Variables..." -ForegroundColor $info
$envPath = "backend\.env"

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✓ Loaded from backend\.env`n" -ForegroundColor $success
} else {
    Write-Host "✗ backend\.env not found!`n" -ForegroundColor $error_color
    exit 1
}

# Test 1: Environment Variables
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  1. Environment Variables" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Test-EnvVariable "AI_SERVICE_URL" $env:AI_SERVICE_URL -Required $true
Test-EnvVariable "DEFAULT_BG_TOOL" $env:DEFAULT_BG_TOOL -Required $true
Test-EnvVariable "REMOVE_BG_API_KEY" $env:REMOVE_BG_API_KEY -Required $false
Test-EnvVariable "CLIPDROP_API_KEY" $env:CLIPDROP_API_KEY -Required $false
Test-EnvVariable "REPLICATE_API_KEY" $env:REPLICATE_API_KEY -Required $false

# Test 2: Python AI Service
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  2. Python AI Service (Local)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$aiServiceUrl = $env:AI_SERVICE_URL
if ([string]::IsNullOrWhiteSpace($aiServiceUrl)) {
    $aiServiceUrl = "http://localhost:8000"
}

Test-Service "Python AI Health" "$aiServiceUrl/health"
Test-Service "Python AI Root" "$aiServiceUrl/"

# Test 3: Backend API
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  3. Backend API (Node.js)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$backendUrl = $env:BACKEND_URL
if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    $backendUrl = "http://localhost:5000"
}

Test-Service "Backend Health" "$backendUrl/api/health"
Test-Service "Available Tools" "$backendUrl/api/background-removal/tools"

# Test 4: Frontend Configuration
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  4. Frontend Configuration" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$frontendEnvPath = "frontend\.env.local"
if (Test-Path $frontendEnvPath) {
    Write-Host "Checking: frontend\.env.local ... " -NoNewline
    $content = Get-Content $frontendEnvPath -Raw
    
    if ($content -match "NEXT_PUBLIC_AI_SERVICE_URL=") {
        Write-Host "✓ EXISTS" -ForegroundColor $success
        $script:passed++
    } else {
        Write-Host "✗ MISSING AI_SERVICE_URL" -ForegroundColor $error_color
        $script:failed++
    }
    
    if ($content -match "NEXT_PUBLIC_API_URL=") {
        Write-Host "Checking: NEXT_PUBLIC_API_URL ... ✓ EXISTS" -ForegroundColor $success
        $script:passed++
    } else {
        Write-Host "Checking: NEXT_PUBLIC_API_URL ... ✗ MISSING" -ForegroundColor $error_color
        $script:failed++
    }
} else {
    Write-Host "✗ frontend\.env.local not found!" -ForegroundColor $error_color
    $script:failed++
}

# Test 5: Python Dependencies
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  5. Python Dependencies" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCmd) {
    Write-Host "Python installed: ✓ ($($pythonCmd.Version))`n" -ForegroundColor $success
    
    Write-Host "Checking required packages...`n" -ForegroundColor $info
    
    $packages = @("rembg", "fastapi", "uvicorn", "PIL", "numpy", "cv2")
    foreach ($pkg in $packages) {
        Write-Host "  Testing: $pkg ... " -NoNewline
        $result = python -c "import $pkg" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓" -ForegroundColor $success
            $script:passed++
        } else {
            Write-Host "✗ NOT INSTALLED" -ForegroundColor $error_color
            $script:failed++
        }
    }
} else {
    Write-Host "✗ Python not found in PATH" -ForegroundColor $error_color
    $script:failed++
}

# Summary
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "  ✓ Passed:   $passed" -ForegroundColor $success
Write-Host "  ✗ Failed:   $failed" -ForegroundColor $error_color
Write-Host "  ⚠ Warnings: $warnings" -ForegroundColor $warning

Write-Host "`n"

if ($failed -eq 0) {
    Write-Host "🎉 All critical tests passed! Your API connections are ready!" -ForegroundColor $success
    Write-Host "`nNext steps:" -ForegroundColor $info
    Write-Host "  1. Start Python AI: cd backend/ai-service && python app.py" -ForegroundColor White
    Write-Host "  2. Start Backend:   cd backend && npm run dev" -ForegroundColor White
    Write-Host "  3. Start Frontend:  cd frontend && npm run dev" -ForegroundColor White
} else {
    Write-Host "⚠ Some tests failed. Please fix the issues above." -ForegroundColor $error_color
    Write-Host "`nCommon fixes:" -ForegroundColor $info
    Write-Host "  - Start Python AI service: python backend/ai-service/app.py" -ForegroundColor White
    Write-Host "  - Start Backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host "  - Check API keys in backend/.env" -ForegroundColor White
    Write-Host "  - Install Python deps: pip install -r backend/ai-service/requirements.txt" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
