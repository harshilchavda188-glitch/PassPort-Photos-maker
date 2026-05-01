@echo off
echo ========================================
echo  Test Remove.bg API Key
echo ========================================
echo.

cd backend\ai-service

echo Running API key test...
echo.

python test_api_key.py

echo.
pause
