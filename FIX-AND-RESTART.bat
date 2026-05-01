@echo off
echo ========================================
echo  COMPLETE PROJECT FIX & RESTART
echo ========================================
echo.

echo [Step 1/5] Stopping ALL old processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1
echo ✅ All processes stopped
echo.

echo [Step 2/5] Waiting 5 seconds for ports to free up...
timeout /t 5 /nobreak >nul
echo ✅ Ports cleared
echo.

echo [Step 3/5] Clearing Next.js cache...
cd /d "%~dp0frontend"
if exist .next (
    rmdir /s /q .next
    echo ✅ Cache cleared
) else (
    echo ✅ No cache to clear
)
echo.

echo [Step 4/5] Starting Backend (Port 5002)...
cd /d "%~dp0backend"
start "Backend - Port 5002" cmd /k "npm run dev"
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul
echo ✅ Backend started
echo.

echo [Step 5/5] Starting Flask Service (Port 5003)...
cd /d "%~dp0backend\ai-service"
start "Flask Service - Port 5003" cmd /k "python passport_bg_remover.py"
timeout /t 3 /nobreak >nul
echo ✅ Flask service started
echo.

echo Starting Frontend (Port 3000)...
cd /d "%~dp0frontend"
start "Frontend - Port 3000" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo ✅ Frontend started
echo.

echo ========================================
echo  ALL SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Services:
echo   ✅ Backend:     http://localhost:5002
echo   ✅ Flask:       http://localhost:5003
echo   ✅ Frontend:    http://localhost:3000
echo.
echo Wait 15 seconds for everything to initialize...
echo Then open: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
