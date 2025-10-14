#!/usr/bin/env python3
"""
Quick Demo Startup Script for TrainIQ Python Backend
"""

import os
import sys
import subprocess
import time

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required")
        return False
    
    print("✅ Python version compatible")
    return True

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    
    packages = [
        "flask",
        "flask-cors", 
        "opencv-python",
        "numpy",
        "mediapipe==0.10.8",
        "cvzone"
    ]
    
    for package in packages:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} installed")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            return False
    
    return True

def start_backend():
    """Start the pose detection backend"""
    print("🚀 Starting TrainIQ Backend...")
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    if os.path.exists(backend_dir):
        os.chdir(backend_dir)
    
    # Try to start the pose server
    try:
        if os.path.exists('pose_server_python313.py'):
            print("📡 Starting pose_server_python313.py...")
            subprocess.run([sys.executable, 'pose_server_python313.py'])
        elif os.path.exists('pose_server.py'):
            print("📡 Starting pose_server.py...")
            subprocess.run([sys.executable, 'pose_server.py'])
        else:
            print("❌ No pose server file found")
            return False
            
    except KeyboardInterrupt:
        print("🛑 Backend stopped by user")
        return True
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return False

def main():
    """Main demo setup function"""
    print("🎯 TrainIQ Demo Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        input("Press Enter to continue anyway...")
    
    # Install requirements
    print("\\n📋 Setting up dependencies...")
    if not install_requirements():
        print("⚠️  Some packages failed to install. Demo may work with fallback mode.")
        input("Press Enter to continue...")
    
    print("\\n🎬 Ready for Demo!")
    print("=" * 40)
    print("1. Keep this terminal open")
    print("2. In another terminal, run: npm run dev")
    print("3. Go to: http://localhost:3000/gym-api")
    print("4. If backend fails, the frontend has a demo fallback mode")
    print("=" * 40)
    
    # Start backend
    start_backend()

if __name__ == "__main__":
    main()