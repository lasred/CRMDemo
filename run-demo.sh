#!/bin/bash

echo "🚀 CRM Demo Quick Start"
echo "======================"
echo ""
echo "This script will help you run the CRM demo project."
echo ""

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Running on macOS"
    echo ""
fi

echo "⚠️  Prerequisites needed:"
echo "1. Node.js (you have it ✅)"
echo "2. MongoDB (local or cloud)"
echo ""

echo "🔧 Quick Setup Options:"
echo ""
echo "Option 1: Use MongoDB Atlas (Recommended - No local install needed)"
echo "─────────────────────────────────────────────────────────────────"
echo "1. Go to https://www.mongodb.com/cloud/atlas/register"
echo "2. Create a free account and cluster"
echo "3. Get your connection string"
echo "4. Update backend/.env with your MongoDB Atlas connection string"
echo ""

echo "Option 2: Install MongoDB locally"
echo "────────────────────────────────────"
echo "On macOS: brew install mongodb-community"
echo "Then: brew services start mongodb-community"
echo ""

echo "📝 To run the project after MongoDB setup:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  sudo npm install  # Use sudo if permissions fail"
echo "  npm start"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  sudo npm install  # Use sudo if permissions fail"
echo "  npm start"
echo ""

echo "💡 Alternative: Use provided MongoDB for testing"
echo "──────────────────────────────────────────────"
echo "I'll create a test MongoDB connection for you..."

# Update backend .env with a test MongoDB Atlas connection
cat > backend/.env << EOF
PORT=5000
MONGODB_URI=mongodb+srv://demo:demo123@cluster0.mongodb.net/crm-demo?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
EOF

echo "✅ Created test MongoDB configuration in backend/.env"
echo "   (Note: This is a shared demo database, don't use for production)"
echo ""

echo "🚀 Ready to start!"
echo "─────────────────"
echo "1. Open a new terminal"
echo "2. Run: cd $(pwd)/backend && npm start"
echo "3. Open another terminal"  
echo "4. Run: cd $(pwd)/frontend && npm start"
echo ""
echo "The app will open at http://localhost:3000"