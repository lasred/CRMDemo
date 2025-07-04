# 🚀 Quick Start Guide - CRM Demo

## ⚡ Fastest Way to Run (Copy & Paste)

### Step 1: Fix NPM Permissions (One-time fix)
```bash
sudo chown -R $(whoami) ~/.npm
```

### Step 2: Open Terminal 1 (Backend)
```bash
cd /Users/letian.sun_1_2/CRMDemo/backend
npm install
npm start
```

### Step 3: Open Terminal 2 (Frontend)
```bash
cd /Users/letian.sun_1_2/CRMDemo/frontend
npm install  
npm start
```

### Step 4: Open Browser
Navigate to http://localhost:3000

## 🎉 That's it! The app should be running.

---

## 📝 Notes:

### MongoDB Connection
I've already configured a cloud MongoDB database for you in `backend/.env`, so you don't need to install MongoDB locally.

### If NPM Install Fails
Use sudo:
```bash
sudo npm install
```

### Default Ports
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### First Time Use
1. Click "Sign Up" to create a new account
2. Use any email and password (min 6 characters)
3. Start exploring the CRM features!

### Features to Try
- **Dashboard**: Overview of your CRM data
- **Contacts**: Add and manage contacts
- **Companies**: Track company information
- **Deals**: Manage sales pipeline
- **Tasks**: Create and track tasks
- **Reports**: View analytics and charts

### Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**MongoDB Connection Error?**
The demo uses a cloud MongoDB. If it fails, you can:
1. Create your own free MongoDB Atlas account
2. Update the MONGODB_URI in backend/.env

**Can't see the app?**
Make sure both backend and frontend are running in separate terminals.

---

## 🎨 Demo Credentials

After registering, you can use these features:
- Create contacts with companies
- Add deals to your pipeline
- Assign tasks to yourself
- View reports and analytics

Enjoy exploring the CRM! 🎉