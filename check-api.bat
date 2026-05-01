@echo off
echo ========================================
echo   API Connection Checker
echo ========================================
echo.

echo Checking Python AI Service...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python AI Service is running
) else (
    echo [WARN] Python AI Service is not running
    echo        Start with: cd backend\ai-service ^&^& python app.py
)
echo.

echo Checking Backend API...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend API is running
) else (
    echo [WARN] Backend API is not running  
    echo        Start with: cd backend ^&^& npm run dev
)
echo.

echo Checking Environment Variables...
findstr "REMOVE_BG_API_KEY" backend\.env >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Remove.bg API key found
) else (
    echo [WARN] Remove.bg API key not found
)

findstr "AI_SERVICE_URL" backend\.env >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] AI Service URL configured
) else (
    echo [WARN] AI Service URL not configured
)
echo.

echo Checking Python Installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python is installed
    python --version
) else (
    echo [ERROR] Python is not installed
)
echo.

echo Checking Python Dependencies...
python -c "import rembg" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] rembg is installed
) else (
    echo [WARN] rembg is not installed
    echo        Install with: pip install -r backend\ai-service\requirements.txt
)

python -c "import fastapi" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] fastapi is installed
) else (
    echo [WARN] fastapi is not installed
)
echo.

echo ========================================
echo   Summary
echo ========================================
echo.
echo To start all services:
echo   1. Python AI:  cd backend\ai-service ^&^& python app.py
echo   2. Backend:    cd backend ^&^& npm run dev
echo   3. Frontend:   cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
