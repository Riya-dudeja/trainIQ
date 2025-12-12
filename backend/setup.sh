#!/bin/bash
# TrainIQ Backend Setup Script

echo "🚀 Setting up TrainIQ Pose Detection Backend..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

echo "✅ Python 3 found"


# Create virtual environment (venv311)
echo "📦 Creating virtual environment..."
python3 -m venv venv311

# Activate virtual environment
echo "🔄 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv311/Scripts/activate
else
    source venv311/bin/activate
fi

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📥 Installing required packages..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the server:"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "   venv311\\Scripts\\activate"
    else
        echo "   source venv311/bin/activate"
fi
echo "   python pose_server.py"
echo ""
echo "🌐 Server will be available at http://localhost:5000"