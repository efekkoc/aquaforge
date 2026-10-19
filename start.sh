#!/bin/bash
# AquaForge 1-Click Startup Script
# Created by Turgut Efekan Koç (efekkoc)

echo -e "\033[1;36m=====================================================\033[0m"
echo -e "\033[1;36m       ⚡ AquaForge - Minecraft Server Suite         \033[0m"
echo -e "\033[1;32m       Created by Turgut Efekan Koç (efekkoc)        \033[0m"
echo -e "\033[1;36m=====================================================\033[0m"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "\033[1;31m[ERROR] Node.js is not installed! Please install Node.js 18+ from https://nodejs.org\033[0m"
    exit 1
fi

echo -e "\033[1;33m[1/3] Verifying dependencies...\033[0m"

# Install root concurrently if missing
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

# Install server dependencies if missing
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Install client dependencies if missing
if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo -e "\033[1;32m[2/3] Starting AquaForge Backend & Web Dashboard...\033[0m"
echo -e "\033[1;35m[3/3] Opening http://localhost:5173 in browser...\033[0m"

# Open browser after a slight delay
(sleep 3 && open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null) &

# Run server and client concurrently
npm run dev
