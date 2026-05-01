# Test Remove.bg API Integration
# Run this script after adding your API key to backend/.env

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Remove.bg API Integration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/background-removal/status" -Method GET -ErrorAction Stop
    Write-Host "✓ Backend is running!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend is not running or endpoint not found" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the backend server is running on port 5000" -ForegroundColor Yellow
    exit
}

Write-Host ""

# Test 2: Check API key configuration
Write-Host "Test 2: Checking API key configuration..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/background-removal/status" -Method GET
    
    if ($response.success -eq $true) {
        if ($response.data.total -gt 0) {
            Write-Host "✓ API key is configured!" -ForegroundColor Green
            Write-Host "  Total credits: $($response.data.total)" -ForegroundColor Gray
            Write-Host "  Remaining: $($response.data.remaining)" -ForegroundColor Gray
        } else {
            Write-Host "⚠ API key not configured or invalid" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "To fix this:" -ForegroundColor Cyan
            Write-Host "1. Go to https://www.remove.bg/api" -ForegroundColor Gray
            Write-Host "2. Sign up and get your API key" -ForegroundColor Gray
            Write-Host "3. Add it to backend/.env file:" -ForegroundColor Gray
            Write-Host "   REMOVE_BG_API_KEY=your-api-key-here" -ForegroundColor White
            Write-Host "4. Restart the backend server" -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ API returned error: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed to check API status" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. If API key is not configured, follow the instructions above" -ForegroundColor Gray
Write-Host "2. Open your browser: http://localhost:3000/editor" -ForegroundColor Gray
Write-Host "3. Upload a photo and test background removal" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed setup guide, see: REMOVE_BG_API_SETUP.md" -ForegroundColor White
Write-Host ""
