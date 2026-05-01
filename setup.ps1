# AI Passport Photo Maker Pro - Quick Setup Script
# Run this in PowerShell to set up the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Passport Photo Maker Pro - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Step 1: Install Frontend Dependencies
Write-Host "Step 1: Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\frontend"
npm install
Write-Host "✅ Frontend dependencies installed!" -ForegroundColor Green
Write-Host ""

# Step 2: Install Backend Dependencies
Write-Host "Step 2: Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\backend"
npm install
Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green
Write-Host ""

# Step 3: Setup Environment Files
Write-Host "Step 3: Setting up Environment Files..." -ForegroundColor Yellow

# Frontend .env
if (!(Test-Path "$projectRoot\frontend\.env")) {
    Copy-Item "$projectRoot\frontend\.env.example" "$projectRoot\frontend\.env"
    Write-Host "✅ Frontend .env created" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env already exists" -ForegroundColor Green
}

# Backend .env
if (!(Test-Path "$projectRoot\backend\.env")) {
    Copy-Item "$projectRoot\backend\.env.example" "$projectRoot\backend\.env"
    Write-Host "✅ Backend .env created" -ForegroundColor Green
} else {
    Write-Host "✅ Backend .env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend\.env with your MongoDB URI and API keys"
Write-Host "2. Open TWO terminals:"
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Visit: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "For detailed setup instructions, see:" -ForegroundColor Gray
Write-Host "  - QUICKSTART.md" -ForegroundColor Gray
Write-Host "  - ERROR_SOLUTIONS.md" -ForegroundColor Gray
Write-Host ""
