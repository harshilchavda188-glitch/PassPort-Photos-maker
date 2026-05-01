@echo off
echo ====================================
echo  Port Conflict Resolver
echo ====================================
echo.

echo This script will help you free up ports used by PhotoAI Pro
echo.

echo Common ports used:
echo - Port 3000: Next.js Frontend
echo - Port 5000/5002: Node.js Backend
echo - Port 8000: Python FastAI Service
echo - Port 5003: Flask Background Removal Service
echo.

echo Which port do you want to free up?
echo 1. Port 3000 (Frontend)
echo 2. Port 5002 (Backend)
echo 3. Port 8000 (FastAI Service)
echo 4. Port 5003 (Flask Service)
echo 5. Check all ports
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Checking port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        echo Found process PID: %%a
        taskkill /PID %%a /F
    )
) else if "%choice%"=="2" (
    echo.
    echo Checking port 5002...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002 ^| findstr LISTENING') do (
        echo Found process PID: %%a
        taskkill /PID %%a /F
    )
) else if "%choice%"=="3" (
    echo.
    echo Checking port 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
        echo Found process PID: %%a
        taskkill /PID %%a /F
    )
) else if "%choice%"=="4" (
    echo.
    echo Checking port 5003...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5003 ^| findstr LISTENING') do (
        echo Found process PID: %%a
        taskkill /PID %%a /F
    )
) else if "%choice%"=="5" (
    echo.
    echo Checking all PhotoAI Pro ports...
    echo.
    echo Port 3000:
    netstat -ano | findstr :3000 | findstr LISTENING
    echo.
    echo Port 5002:
    netstat -ano | findstr :5002 | findstr LISTENING
    echo.
    echo Port 8000:
    netstat -ano | findstr :8000 | findstr LISTENING
    echo.
    echo Port 5003:
    netstat -ano | findstr :5003 | findstr LISTENING
) else (
    echo Invalid choice!
)

echo.
pause
