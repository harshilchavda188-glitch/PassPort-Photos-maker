# AI Passport Photo Maker Pro - Test & Fix All Errors
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Project Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\DELL\Desktop\testing\website\b\3"
$errors = @()

# Test 1: Check Node.js
Write-Host "Test 1: Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Install from https://nodejs.org/" -ForegroundColor Red
    $errors += "Node.js missing"
}

# Test 2: Check Frontend Dependencies
Write-Host ""
Write-Host "Test 2: Checking Frontend Dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\frontend"
if (Test-Path "node_modules") {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend dependencies missing. Running npm install..." -ForegroundColor Red
    npm install
}

# Test 3: Check Backend Dependencies
Write-Host ""
Write-Host "Test 3: Checking Backend Dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\backend"
if (Test-Path "node_modules") {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend dependencies missing. Running npm install..." -ForegroundColor Red
    npm install
}

# Test 4: Check Frontend .env
Write-Host ""
Write-Host "Test 4: Checking Frontend .env..." -ForegroundColor Yellow
Set-Location "$projectRoot\frontend"
if (Test-Path ".env") {
    Write-Host "✅ Frontend .env exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend .env missing. Creating..." -ForegroundColor Red
    Copy-Item .env.example .env
    Write-Host "✅ Frontend .env created" -ForegroundColor Green
}

# Test 5: Check Backend .env
Write-Host ""
Write-Host "Test 5: Checking Backend .env..." -ForegroundColor Yellow
Set-Location "$projectRoot\backend"
if (Test-Path ".env") {
    Write-Host "✅ Backend .env exists" -ForegroundColor Green
    
    # Check MongoDB URI
    $envContent = Get-Content .env -Raw
    if ($envContent -match "MONGODB_URI=mongodb://localhost") {
        Write-Host "✅ MongoDB: Using local database" -ForegroundColor Green
    } elseif ($envContent -match "MONGODB_URI=mongodb\+srv") {
        Write-Host "✅ MongoDB: Using MongoDB Atlas" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB URI needs to be configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Backend .env missing. Creating..." -ForegroundColor Red
    Copy-Item .env.example .env
    Write-Host "✅ Backend .env created" -ForegroundColor Green
}

# Test 6: Check MongoDB Connection
Write-Host ""
Write-Host "Test 6: Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = mongosh --eval "db.version()" --quiet 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is running: version $mongoTest" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB not detected locally" -ForegroundColor Yellow
        Write-Host "   Install from: https://www.mongodb.com/try/download/community" -ForegroundColor Gray
        Write-Host "   OR use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  MongoDB shell not found" -ForegroundColor Yellow
    Write-Host "   Install MongoDB or use MongoDB Atlas" -ForegroundColor Gray
}

# Test 7: Check Package.json
Write-Host ""
Write-Host "Test 7: Checking package.json files..." -ForegroundColor Yellow
Set-Location "$projectRoot\frontend"
$frontendPkg = Get-Content package.json | ConvertFrom-Json
if ($frontendPkg.dependencies.'@imgly/background-removal') {
    Write-Host "✅ @imgly/background-removal: Installed (FREE)" -ForegroundColor Green
} else {
    Write-Host "❌ @imgly/background-removal: Missing" -ForegroundColor Red
}

if ($frontendPkg.dependencies.'face-api.js') {
    Write-Host "✅ face-api.js: Installed (FREE)" -ForegroundColor Green
} else {
    Write-Host "❌ face-api.js: Missing" -ForegroundColor Red
}

Set-Location "$projectRoot\backend"
$backendPkg = Get-Content package.json | ConvertFrom-Json
if ($backendPkg.dependencies.express) {
    Write-Host "✅ Express.js: Installed" -ForegroundColor Green
}
if ($backendPkg.dependencies.mongoose) {
    Write-Host "✅ Mongoose: Installed" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Start Backend (Terminal 1):" -ForegroundColor Cyan
    Write-Host "   cd c:\Users\DELL\Desktop\testing\website\b\3\backend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Start Frontend (Terminal 2):" -ForegroundColor Cyan
    Write-Host "   cd c:\Users\DELL\Desktop\testing\website\b\3\frontend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Open Browser:" -ForegroundColor Cyan
    Write-Host "   http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Your 100% FREE AI Passport Photo Maker is ready! 🚀" -ForegroundColor Green
} else {
    Write-Host "❌ $($errors.Count) error(s) found:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "See FIX_ALL_ERRORS.md for solutions" -ForegroundColor Yellow
}

Write-Host ""
Pause
