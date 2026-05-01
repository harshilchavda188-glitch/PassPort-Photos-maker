@echo off
echo Starting Flask Background Removal Service...
echo.

cd backend\ai-service

echo Installing dependencies...
pip install -r requirements_flask.txt

echo.
echo Starting Flask service on http://localhost:5003
echo.

python passport_bg_remover.py

pause
