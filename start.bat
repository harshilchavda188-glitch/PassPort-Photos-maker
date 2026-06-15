@echo off
title PassPort Photos Maker
echo ========================================
echo   PassPort Photos Maker
echo ========================================
echo.

echo [Backend] Starting backend server (port 5000)...
start "Backend" cmd /c "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 >nul

echo [Frontend] Starting frontend server (port 3000)...
start "Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 >nul

echo.
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================
echo.
echo Close this window to stop all services.
echo.
pause
