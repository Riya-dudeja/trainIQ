@echo off
REM TrainIQ Backend Setup Script for Windows - Smart Installation

echo 🚀 TrainIQ Smart Backend Setup
echo ================================

REM Check if Python 3 is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv pose_env
if errorlevel 1 (
    echo ❌ Failed to create virtual environment
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call pose_env\Scripts\activate
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

REM Upgrade pip first
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Run smart installer
echo 🧠 Running smart installation...
python smart_install.py

echo.
echo ================================
echo ✅ Setup process completed!
echo.
echo 🚀 To start the server:
echo    1. Activate environment: pose_env\Scripts\activate
echo    2. Run server: python pose_server.py
echo    3. If pose detection fails: python pose_server_fallback.py
echo.
echo 🌐 Server will be available at http://localhost:5000
echo 🖥️ Frontend: http://localhost:3000/gym-api-python
echo.
pause