@echo off
echo ========================================
echo AI Passport Photo Maker Pro - Setup
echo ========================================
echo.

echo Step 1: Installing Frontend Dependencies...
cd frontend
call npm install
echo.
echo Frontend installation complete!
echo.

echo Step 2: Installing Backend Dependencies...
cd ..\backend
call npm install
echo.
echo Backend installation complete!
echo.

echo Step 3: Setting up Environment Files...
cd ..\frontend
if not exist .env (
    copy .env.example .env
    echo Frontend .env created
) else (
    echo Frontend .env already exists
)

cd ..\backend
if not exist .env (
    copy .env.example .env
    echo Backend .env created
) else (
    echo Backend .env already exists
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Edit backend\.env with your MongoDB URI
echo 2. Open TWO terminals:
echo.
echo    Terminal 1 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo    Terminal 2 (Frontend):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Visit: http://localhost:3000
echo.
echo For help, see:
echo   - FIX_ALL_ERRORS.md
echo   - QUICKSTART.md
echo.
pause
