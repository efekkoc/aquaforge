@echo off
TITLE AquaForge - Minecraft Server Suite
COLOR 0B
echo =====================================================
echo        AquaForge - Minecraft Server Suite
echo        Created by Turgut Efekan Koc (efekkoc)
echo =====================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b
)

echo [1/3] Checking dependencies...
if not exist node_modules call npm install
if not exist server\node_modules (
    cd server
    call npm install
    cd ..
)
if not exist client\node_modules (
    cd client
    call npm install
    cd ..
)

echo [2/3] Launching AquaForge Suite...
start http://localhost:5173
call npm run dev
