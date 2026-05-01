@echo off
echo ========================================
echo  Restart All Services - Passport Photo Maker
echo ========================================
echo.

echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
echo Done!
echo.

echo [2/4] Stopping all Python processes...
taskkill /F /IM python.exe /T >nul 2>&1
echo Done!
echo.

echo [3/4] Waiting 3 seconds for ports to free up...
timeout /t 3 /nobreak >nul
echo Done!
echo.

echo [4/4] Starting services...
echo.

echo Starting Backend (Port 5002)...
start "Backend - Port 5002" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting Flask Service (Port 5003)...
start "Flask Service - Port 5003" cmd /k "cd /d %~dp0backend\ai-service && python passport_bg_remover.py"
timeout /t 2 /nobreak >nul

echo Starting Frontend (Port 3000)...
start "Frontend - Port 3000" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  All services started!
echo ========================================
echo.
echo Services:
echo   - Backend:     http://localhost:5002
echo   - Flask:       http://localhost:5003
echo   - Frontend:    http://localhost:3000
echo.
echo Wait 10 seconds, then open:
echo   http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
