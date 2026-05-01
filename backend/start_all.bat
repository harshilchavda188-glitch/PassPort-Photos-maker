@echo off
echo Starting Passport Photo Pro Services...
start "FastAPI_8000" cmd /c "cd ai-service && python -m uvicorn app:app --host 0.0.0.0 --port 8000"
timeout /t 2
start "Flask_5003" cmd /c "cd ai-service && python passport_bg_remover_fixed.py"
timeout /t 2
npm run dev
