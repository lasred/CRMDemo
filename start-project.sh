#!/bin/bash

echo "🚀 CRM Project Startup Script"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed: $(node --version)${NC}"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not installed or not in PATH${NC}"
    echo "You have two options:"
    echo "1. Install MongoDB locally (https://docs.mongodb.com/manual/installation/)"
    echo "2. Use MongoDB Atlas (cloud) - Free tier available"
    echo ""
    echo "For MongoDB Atlas:"
    echo "- Create account at https://www.mongodb.com/cloud/atlas"
    echo "- Create a free cluster"
    echo "- Get connection string and update backend/.env file"
    echo ""
    read -p "Do you want to continue without local MongoDB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to start backend
start_backend() {
    echo -e "${YELLOW}Starting Backend Server...${NC}"
    cd backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing backend dependencies..."
        echo "This might fail due to npm permissions. If it does, run:"
        echo "sudo npm install"
        npm install
    fi
    
    echo -e "${GREEN}Starting backend on http://localhost:5000${NC}"
    npm start
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}Starting Frontend Server...${NC}"
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        echo "This might fail due to npm permissions. If it does, run:"
        echo "sudo npm install"
        npm install
    fi
    
    echo -e "${GREEN}Starting frontend on http://localhost:3000${NC}"
    npm start
}

# Create two terminal tabs/windows recommendation
echo ""
echo "📋 Instructions:"
echo "1. Open two terminal windows/tabs"
echo "2. In first terminal, run: cd backend && npm install && npm start"
echo "3. In second terminal, run: cd frontend && npm install && npm start"
echo ""
echo "If npm install fails due to permissions, use sudo:"
echo "   sudo npm install"
echo ""
echo "Default ports:"
echo "- Backend: http://localhost:5000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Press any key to see alternative options..."
read -n 1

echo ""
echo "🔧 Alternative Setup Options:"
echo ""
echo "Option 1: Fix npm permissions (recommended)"
echo "   sudo chown -R $(whoami) ~/.npm"
echo ""
echo "Option 2: Use MongoDB Atlas (cloud database)"
echo "   1. Sign up at https://www.mongodb.com/cloud/atlas"
echo "   2. Create a free cluster"
echo "   3. Update MONGODB_URI in backend/.env"
echo ""
echo "Option 3: Manual installation with sudo"
echo "   cd backend && sudo npm install"
echo "   cd frontend && sudo npm install"