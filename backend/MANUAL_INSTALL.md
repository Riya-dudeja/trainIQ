# 🛠️ Manual Installation Guide

If the automatic setup fails, follow these manual steps:

## 🐍 Check Python Version

```bash
python --version
```

**Requirements:**
- ✅ Python 3.8-3.10: Most compatible
- ⚠️ Python 3.11+: May have MediaPipe issues  
- ❌ Python 3.7 or below: Not supported

## 📦 Manual Installation Steps

### Step 1: Create Virtual Environment
```bash
cd backend
python -m venv pose_env
```

### Step 2: Activate Environment
**Windows:**
```bash
pose_env\Scripts\activate
```

**Mac/Linux:**
```bash
source pose_env/bin/activate
```

### Step 3: Upgrade pip
```bash
python -m pip install --upgrade pip
```

### Step 4: Install Core Packages
```bash
pip install opencv-python
pip install numpy
pip install flask
pip install flask-cors
```

### Step 5: Try Different MediaPipe Versions

**Option A: Latest (Python 3.9+)**
```bash
pip install mediapipe
```

**Option B: Compatible (Python 3.8-3.10)**
```bash
pip install "mediapipe>=0.8.0,<0.9.0"
```

**Option C: Specific Version**
```bash
pip install mediapipe==0.8.11
```

### Step 6: Install cvzone
```bash
pip install cvzone
```

## 🧪 Test Installation

```bash
python -c "import cv2; print('OpenCV:', cv2.__version__)"
python -c "import mediapipe; print('MediaPipe: OK')"
python -c "from cvzone.PoseModule import PoseDetector; print('cvzone: OK')"
```

## 🚨 If MediaPipe Still Fails

### Option 1: Use Fallback Server
```bash
python pose_server_fallback.py
```

### Option 2: Alternative MediaPipe Installation
```bash
# Clear pip cache
pip cache purge

# Try pre-release version
pip install --pre mediapipe

# Or try specific wheel (Windows 64-bit, Python 3.8)
pip install https://files.pythonhosted.org/packages/py3/m/mediapipe/mediapipe-0.8.11-cp38-cp38-win_amd64.whl
```

### Option 3: Use Different Python Version
Consider using **Python 3.9** which has the best MediaPipe compatibility:

1. Install Python 3.9 from https://python.org
2. Create new virtual environment with Python 3.9
3. Retry installation

## 🔧 Common Issues

### Issue: "No module named 'mediapipe'"
**Solutions:**
1. Make sure virtual environment is activated
2. Try different MediaPipe version
3. Use fallback server

### Issue: "DLL load failed" (Windows)
**Solutions:**
1. Install Visual C++ Redistributable
2. Try different OpenCV version: `pip install opencv-python==4.5.5.64`
3. Restart computer after installation

### Issue: Camera not working
**Solutions:**
1. Check camera permissions
2. Close other applications using camera
3. Try different camera index in code

## 📞 Getting Help

If you're still having issues:

1. **Check Python version**: `python --version`
2. **List installed packages**: `pip list`
3. **Check error messages carefully**
4. **Try the fallback server first**: `python pose_server_fallback.py`

## 🎯 Quick Start (Minimal)

If everything fails, use this minimal approach:

```bash
# Just install basics
pip install opencv-python flask flask-cors numpy

# Use fallback server (no pose detection)
python pose_server_fallback.py
```

This will give you a basic camera feed without pose detection, but at least the system will work!