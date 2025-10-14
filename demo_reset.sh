#!/bin/bash
# Quick Demo Reset Script

echo "🔄 Resetting TrainIQ for Demo..."

# Navigate to the project
cd "c:/Users/Public/capstone/trainiq"

# Kill any running processes
echo "🛑 Stopping any running processes..."
taskkill /f /im node.exe 2>/dev/null || true
taskkill /f /im python.exe 2>/dev/null || true

echo "✅ Reset complete!"
echo ""
echo "🎯 Demo Instructions:"
echo "1. Run: npm run dev"
echo "2. Go to: http://localhost:3000/gym-api"
echo "3. The app will work in demo mode with simulated AI"
echo ""
echo "📝 Demo Script:"
echo "- Click 'Enter Full Screen'"
echo "- Select 'Bodyweight Squat'"
echo "- Perform squats (app shows stable 75-95% scores)"
echo "- Show audio feedback toggle"
echo "- Switch to 'Push-up Counter' and demo"
echo ""
echo "🎉 Your demo is ready!"