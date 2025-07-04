const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple in-memory database
const db = {
  users: [],
  contacts: [],
  companies: [],
  deals: [],
  tasks: []
};

// Helper to parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Simple router
const routes = {
  'POST /api/auth/register': async (req, res, body) => {
    const user = {
      _id: Date.now().toString(),
      ...body,
      token: 'demo-token-' + Date.now()
    };
    db.users.push(user);
    res.writeHead(201, corsHeaders);
    res.end(JSON.stringify(user));
  },
  
  'POST /api/auth/login': async (req, res, body) => {
    const user = db.users.find(u => u.email === body.email);
    if (user) {
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({ ...user, token: 'demo-token-' + Date.now() }));
    } else {
      res.writeHead(401, corsHeaders);
      res.end(JSON.stringify({ message: 'Invalid credentials' }));
    }
  },
  
  'GET /api/dashboard/stats': async (req, res) => {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      overview: {
        totalContacts: db.contacts.length,
        totalCompanies: db.companies.length,
        totalDeals: db.deals.length,
        pendingTasks: db.tasks.filter(t => t.status !== 'completed').length,
        totalRevenue: db.deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0)
      },
      dealsByStage: [
        { _id: 'qualification', count: 2, totalValue: 50000 },
        { _id: 'proposal', count: 3, totalValue: 150000 },
        { _id: 'negotiation', count: 1, totalValue: 75000 }
      ],
      monthlyRevenue: [
        { _id: { year: 2024, month: 1 }, revenue: 45000, count: 3 },
        { _id: { year: 2024, month: 2 }, revenue: 67000, count: 5 }
      ],
      recentActivities: [],
      upcomingTasks: [],
      recentDeals: []
    }));
  },
  
  'GET /api/contacts': async (req, res) => {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      contacts: db.contacts,
      totalPages: 1,
      currentPage: 1,
      total: db.contacts.length
    }));
  },
  
  'POST /api/contacts': async (req, res, body) => {
    const contact = {
      _id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.contacts.push(contact);
    res.writeHead(201, corsHeaders);
    res.end(JSON.stringify(contact));
  }
};

// Create server
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }
  
  const body = await parseBody(req);
  const routeKey = `${req.method} ${req.url.split('?')[0]}`;
  
  // Check if route exists
  if (routes[routeKey]) {
    return routes[routeKey](req, res, body);
  }
  
  // Handle all GET requests to list endpoints
  if (req.method === 'GET' && req.url.startsWith('/api/')) {
    res.writeHead(200, corsHeaders);
    
    // Deals endpoint
    if (req.url.includes('/api/deals')) {
      if (req.url.includes('pipeline')) {
        return res.end(JSON.stringify([
          { _id: 'qualification', deals: [], count: 0, totalValue: 0 },
          { _id: 'needs_analysis', deals: [], count: 0, totalValue: 0 },
          { _id: 'proposal', deals: [], count: 0, totalValue: 0 },
          { _id: 'negotiation', deals: [], count: 0, totalValue: 0 },
          { _id: 'closed_won', deals: [], count: 0, totalValue: 0 },
          { _id: 'closed_lost', deals: [], count: 0, totalValue: 0 }
        ]));
      }
      return res.end(JSON.stringify({
        deals: db.deals,
        totalPages: 1,
        currentPage: 1,
        total: db.deals.length,
        stageStats: []
      }));
    }
    
    // Companies endpoint
    if (req.url.includes('/api/companies')) {
      return res.end(JSON.stringify({
        companies: db.companies,
        totalPages: 1,
        currentPage: 1,
        total: db.companies.length
      }));
    }
    
    // Tasks endpoint
    if (req.url.includes('/api/tasks')) {
      return res.end(JSON.stringify({
        tasks: db.tasks,
        totalPages: 1,
        currentPage: 1,
        total: db.tasks.length
      }));
    }
    
    // Activities endpoint
    if (req.url.includes('/api/activities')) {
      return res.end(JSON.stringify({
        activities: [],
        totalPages: 1,
        currentPage: 1,
        total: 0
      }));
    }
    
    // Users endpoint
    if (req.url.includes('/api/users/me')) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const user = db.users[0] || { _id: '1', name: 'Demo User', email: 'demo@example.com', role: 'user' };
        return res.end(JSON.stringify(user));
      }
      res.writeHead(401, corsHeaders);
      return res.end(JSON.stringify({ message: 'Unauthorized' }));
    }
    
    // Default response for other endpoints
    return res.end(JSON.stringify({ data: [], message: 'Demo endpoint' }));
  }
  
  // Default endpoints for other resources
  if (req.url.startsWith('/api/')) {
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify({ data: [], message: 'Demo endpoint' }));
  }
  
  // 404
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({ message: 'Not found' }));
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`
🚀 Demo CRM Backend Server Running!
===================================
Server URL: http://localhost:${PORT}
API Base: http://localhost:${PORT}/api

This is a simplified demo server with in-memory storage.
Data will be lost when the server restarts.

Available endpoints:
- POST /api/auth/register
- POST /api/auth/login  
- GET /api/dashboard/stats
- GET /api/contacts
- POST /api/contacts

Press Ctrl+C to stop the server.
`);
});