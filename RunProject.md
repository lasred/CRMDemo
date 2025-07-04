# CRM System - Run Project Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Configuration

### Backend Configuration

1. Make sure MongoDB is running on your system
2. Update the `.env` file in the backend directory if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm-database
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

## Running the Project

### Start MongoDB

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
# MongoDB should start automatically if installed as a service
```

### Start Backend Server

```bash
cd backend
npm start
```

The backend will run on http://localhost:5000

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will run on http://localhost:3000

## Default Login

You can register a new account or use these test credentials after creating a user:
- Navigate to http://localhost:3000/register
- Create a new account with your email and password

## Features

- **Dashboard**: Overview of contacts, companies, deals, and tasks
- **Contact Management**: Add, edit, delete, and search contacts
- **Company Management**: Manage company information and relationships
- **Deal Pipeline**: Visual pipeline for tracking sales opportunities
- **Task Management**: Create and manage tasks with priority levels
- **Reports & Analytics**: Revenue trends, conversion rates, and performance metrics
- **Activity Timeline**: Track all activities and interactions
- **User Authentication**: Secure JWT-based authentication

## API Endpoints

The backend provides the following main endpoints:

- `/api/auth` - Authentication (login/register)
- `/api/contacts` - Contact CRUD operations
- `/api/companies` - Company CRUD operations
- `/api/deals` - Deal/opportunity management
- `/api/tasks` - Task management
- `/api/activities` - Activity tracking
- `/api/dashboard` - Dashboard statistics
- `/api/users` - User management

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check if the MongoDB URI in `.env` is correct
- Make sure port 27017 is not blocked

### NPM Install Issues
If you encounter npm permission errors:
```bash
sudo npm cache clean --force
```

### Port Already in Use
If port 5000 or 3000 is already in use:
- Backend: Change the PORT in `.env`
- Frontend: The React dev server will prompt you to use a different port

### CORS Issues
The backend is configured to accept requests from http://localhost:3000. If you're running the frontend on a different port, update the CORS settings in `backend/server.js`.

# Project Details

## Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Morgan** for HTTP request logging

### Frontend
- **React** with TypeScript
- **Material-UI (MUI)** for UI components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API calls
- **Chart.js** with react-chartjs-2 for analytics
- **React Hook Form** for form handling
- **date-fns** for date formatting

## Implementation Process

### Todo List Approach

1. **Project Structure Setup** ✅
   - Created separate backend and frontend directories
   - Initialized npm packages
   - Set up TypeScript configuration

2. **Backend Development** ✅
   - Created Express server with middleware
   - Implemented MongoDB models (User, Contact, Company, Deal, Task, Activity)
   - Built authentication system with JWT
   - Created RESTful API endpoints for all resources
   - Added activity logging for audit trails

3. **Frontend Development** ✅
   - Set up React with TypeScript
   - Configured Redux store with slices for each feature
   - Implemented routing with protected routes
   - Created reusable components

4. **Key Features Implemented** ✅
   - User authentication (login/register)
   - Dashboard with real-time statistics
   - Contact management with CRUD operations
   - Company management
   - Deal pipeline visualization
   - Task management system
   - Activity timeline
   - Reports and analytics with charts
   - Search and filtering capabilities

5. **UI/UX Design** ✅
   - Material Design principles
   - Responsive layout
   - Data tables with pagination
   - Form validation
   - Loading states and error handling

## Architecture Decisions

1. **Separation of Concerns**: Clear separation between frontend and backend
2. **RESTful API**: Standard REST conventions for API design
3. **State Management**: Redux Toolkit for predictable state updates
4. **Type Safety**: TypeScript on the frontend for better developer experience
5. **Modular Structure**: Organized code into models, routes, controllers, and components

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Input validation on both frontend and backend
- CORS configuration

## Future Enhancements

- Email integration for notifications
- File upload for attachments
- Advanced reporting with export functionality
- Real-time updates with WebSockets
- Mobile application
- Calendar integration
- Bulk operations
- Custom fields and workflows