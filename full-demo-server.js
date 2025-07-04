const http = require('http');
const url = require('url');

// In-memory database with sample data
const db = {
  users: [],
  contacts: [],
  companies: [],
  deals: [],
  tasks: [],
  activities: [],
  currentUser: null
};

// Helper functions
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

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const getCurrentUser = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return db.users.find(u => u.token === token) || db.currentUser;
  }
  return null;
};

// Add sample data
const addSampleData = () => {
  // Sample companies
  db.companies = [
    {
      _id: generateId(),
      name: 'Acme Corporation',
      industry: 'Technology',
      type: 'prospect',
      status: 'active',
      revenue: 5000000,
      size: '201-500',
      website: 'https://acme.com',
      phone: '(555) 123-4567',
      owner: { _id: '1', name: 'Demo User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateId(),
      name: 'Global Tech Inc',
      industry: 'Software',
      type: 'customer',
      status: 'active',
      revenue: 10000000,
      size: '501-1000',
      website: 'https://globaltech.com',
      phone: '(555) 987-6543',
      owner: { _id: '1', name: 'Demo User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample contacts
  db.contacts = [
    {
      _id: generateId(),
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@acme.com',
      phone: '(555) 111-2222',
      title: 'VP of Sales',
      company: db.companies[0],
      status: 'prospect',
      source: 'website',
      owner: { _id: '1', name: 'Demo User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateId(),
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@globaltech.com',
      phone: '(555) 333-4444',
      title: 'CEO',
      company: db.companies[1],
      status: 'customer',
      source: 'referral',
      owner: { _id: '1', name: 'Demo User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample deals
  db.deals = [
    {
      _id: generateId(),
      title: 'Enterprise Software Deal',
      value: 150000,
      currency: 'USD',
      stage: 'proposal',
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      contact: db.contacts[0],
      company: db.companies[0],
      owner: { _id: '1', name: 'Demo User' },
      description: 'Large enterprise software package',
      nextStep: 'Schedule follow-up meeting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateId(),
      title: 'Annual Maintenance Contract',
      value: 50000,
      currency: 'USD',
      stage: 'negotiation',
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      contact: db.contacts[1],
      company: db.companies[1],
      owner: { _id: '1', name: 'Demo User' },
      description: 'Renewal of annual maintenance',
      nextStep: 'Final pricing discussion',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample tasks
  db.tasks = [
    {
      _id: generateId(),
      title: 'Follow up with John Smith',
      description: 'Discuss pricing options for enterprise deal',
      type: 'call',
      priority: 'high',
      status: 'todo',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: { _id: '1', name: 'Demo User' },
      relatedTo: {
        type: 'contact',
        id: db.contacts[0]
      },
      createdBy: { _id: '1', name: 'Demo User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateId(),
      title: 'Prepare proposal presentation',
      description: 'Create slides for Acme Corporation',
      type: 'other',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: { _id: '1', name: 'Demo User' },
      relatedTo: {
        type: 'deal',
        id: db.deals[0]._id
      },
      createdBy: { _id: '1', name: 'Demo User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample activities
  db.activities = [
    {
      _id: generateId(),
      type: 'deal_created',
      title: 'Deal created: Enterprise Software Deal',
      description: 'Value: $150,000',
      user: { _id: '1', name: 'Demo User' },
      relatedTo: {
        type: 'deal',
        id: db.deals[0]._id
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: generateId(),
      type: 'contact_created',
      title: 'Contact created: John Smith',
      user: { _id: '1', name: 'Demo User' },
      relatedTo: {
        type: 'contact',
        id: db.contacts[0]._id
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Initialize with sample data
addSampleData();

// Routes
const handleRequest = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;
  const body = await parseBody(req);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  // Auth routes
  if (pathname === '/api/auth/register' && method === 'POST') {
    const user = {
      _id: generateId(),
      ...body,
      token: 'demo-token-' + Date.now(),
      role: body.role || 'user',
      department: body.department || 'Sales',
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    db.currentUser = user;
    res.writeHead(201, corsHeaders);
    return res.end(JSON.stringify(user));
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    let user = db.users.find(u => u.email === body.email);
    if (!user) {
      // Auto-create user for demo
      user = {
        _id: generateId(),
        name: body.email.split('@')[0],
        email: body.email,
        token: 'demo-token-' + Date.now(),
        role: 'user',
        department: 'Sales'
      };
      db.users.push(user);
    }
    db.currentUser = user;
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify({ ...user, token: user.token }));
  }

  // Protected routes - check auth
  const currentUser = getCurrentUser(req);
  if (!currentUser && pathname.startsWith('/api/') && pathname !== '/api/auth/login' && pathname !== '/api/auth/register') {
    res.writeHead(401, corsHeaders);
    return res.end(JSON.stringify({ message: 'Unauthorized' }));
  }

  // User routes
  if (pathname === '/api/users/me' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify(currentUser));
  }

  // Dashboard stats
  if (pathname === '/api/dashboard/stats' && method === 'GET') {
    const stats = {
      overview: {
        totalContacts: db.contacts.length,
        totalCompanies: db.companies.length,
        totalDeals: db.deals.length,
        pendingTasks: db.tasks.filter(t => t.status !== 'completed').length,
        totalRevenue: db.deals
          .filter(d => d.stage === 'closed_won')
          .reduce((sum, d) => sum + d.value, 0)
      },
      dealsByStage: [
        { _id: 'qualification', count: db.deals.filter(d => d.stage === 'qualification').length, totalValue: db.deals.filter(d => d.stage === 'qualification').reduce((sum, d) => sum + d.value, 0) },
        { _id: 'needs_analysis', count: db.deals.filter(d => d.stage === 'needs_analysis').length, totalValue: db.deals.filter(d => d.stage === 'needs_analysis').reduce((sum, d) => sum + d.value, 0) },
        { _id: 'proposal', count: db.deals.filter(d => d.stage === 'proposal').length, totalValue: db.deals.filter(d => d.stage === 'proposal').reduce((sum, d) => sum + d.value, 0) },
        { _id: 'negotiation', count: db.deals.filter(d => d.stage === 'negotiation').length, totalValue: db.deals.filter(d => d.stage === 'negotiation').reduce((sum, d) => sum + d.value, 0) },
        { _id: 'closed_won', count: db.deals.filter(d => d.stage === 'closed_won').length, totalValue: db.deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0) },
        { _id: 'closed_lost', count: db.deals.filter(d => d.stage === 'closed_lost').length, totalValue: db.deals.filter(d => d.stage === 'closed_lost').reduce((sum, d) => sum + d.value, 0) }
      ],
      monthlyRevenue: [
        { _id: { year: 2024, month: 1 }, revenue: 45000, count: 3 },
        { _id: { year: 2024, month: 2 }, revenue: 67000, count: 5 },
        { _id: { year: 2024, month: 3 }, revenue: 89000, count: 7 }
      ],
      recentActivities: db.activities.slice(-10),
      upcomingTasks: db.tasks.filter(t => t.status !== 'completed').slice(0, 5),
      recentDeals: db.deals.slice(-5)
    };
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify(stats));
  }

  // Analytics
  if (pathname === '/api/dashboard/analytics' && method === 'GET') {
    const analytics = {
      metrics: {
        newContacts: db.contacts.length,
        newCompanies: db.companies.length,
        newDeals: db.deals.length,
        closedDeals: db.deals.filter(d => d.stage === 'closed_won').length,
        revenue: db.deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0),
        conversionRate: 25,
        avgDealSize: 75000
      },
      taskCompletion: [
        { _id: 'completed', count: db.tasks.filter(t => t.status === 'completed').length },
        { _id: 'in_progress', count: db.tasks.filter(t => t.status === 'in_progress').length },
        { _id: 'todo', count: db.tasks.filter(t => t.status === 'todo').length }
      ],
      topPerformers: [
        { _id: '1', user: { name: 'Demo User' }, totalRevenue: 250000, dealCount: 3 }
      ]
    };
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify(analytics));
  }

  // Contacts CRUD
  if (pathname === '/api/contacts') {
    if (method === 'GET') {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const start = (page - 1) * limit;
      const contacts = db.contacts.slice(start, start + limit);
      
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({
        contacts,
        totalPages: Math.ceil(db.contacts.length / limit),
        currentPage: page,
        total: db.contacts.length
      }));
    }
    
    if (method === 'POST') {
      const contact = {
        _id: generateId(),
        ...body,
        owner: currentUser,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.contacts.push(contact);
      
      // Add activity
      db.activities.push({
        _id: generateId(),
        type: 'contact_created',
        title: `Contact created: ${contact.firstName} ${contact.lastName}`,
        user: currentUser,
        relatedTo: { type: 'contact', id: contact._id },
        createdAt: new Date().toISOString()
      });
      
      res.writeHead(201, corsHeaders);
      return res.end(JSON.stringify(contact));
    }
  }

  // Single contact operations
  if (pathname.match(/^\/api\/contacts\/[\w-]+$/)) {
    const id = pathname.split('/').pop();
    const contactIndex = db.contacts.findIndex(c => c._id === id);
    
    if (method === 'GET') {
      const contact = db.contacts[contactIndex];
      if (!contact) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Contact not found' }));
      }
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify(contact));
    }
    
    if (method === 'PUT') {
      if (contactIndex === -1) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Contact not found' }));
      }
      db.contacts[contactIndex] = {
        ...db.contacts[contactIndex],
        ...body,
        updatedAt: new Date().toISOString()
      };
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify(db.contacts[contactIndex]));
    }
    
    if (method === 'DELETE') {
      if (contactIndex === -1) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Contact not found' }));
      }
      db.contacts.splice(contactIndex, 1);
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({ message: 'Contact deleted' }));
    }
  }

  // Contact activities
  if (pathname.match(/^\/api\/contacts\/[\w-]+\/activities$/)) {
    const id = pathname.split('/')[3];
    const activities = db.activities.filter(a => a.relatedTo?.id === id);
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify(activities));
  }

  // Companies CRUD
  if (pathname === '/api/companies') {
    if (method === 'GET') {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const start = (page - 1) * limit;
      const companies = db.companies.slice(start, start + limit);
      
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({
        companies,
        totalPages: Math.ceil(db.companies.length / limit),
        currentPage: page,
        total: db.companies.length
      }));
    }
    
    if (method === 'POST') {
      const company = {
        _id: generateId(),
        ...body,
        owner: currentUser,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.companies.push(company);
      
      db.activities.push({
        _id: generateId(),
        type: 'company_created',
        title: `Company created: ${company.name}`,
        user: currentUser,
        relatedTo: { type: 'company', id: company._id },
        createdAt: new Date().toISOString()
      });
      
      res.writeHead(201, corsHeaders);
      return res.end(JSON.stringify(company));
    }
  }

  // Deals CRUD
  if (pathname === '/api/deals') {
    if (method === 'GET') {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const start = (page - 1) * limit;
      const deals = db.deals.slice(start, start + limit);
      
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({
        deals,
        totalPages: Math.ceil(db.deals.length / limit),
        currentPage: page,
        total: db.deals.length,
        stageStats: []
      }));
    }
    
    if (method === 'POST') {
      const deal = {
        _id: generateId(),
        ...body,
        owner: currentUser,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.deals.push(deal);
      
      db.activities.push({
        _id: generateId(),
        type: 'deal_created',
        title: `Deal created: ${deal.title}`,
        description: `Value: $${deal.value.toLocaleString()}`,
        user: currentUser,
        relatedTo: { type: 'deal', id: deal._id },
        createdAt: new Date().toISOString()
      });
      
      res.writeHead(201, corsHeaders);
      return res.end(JSON.stringify(deal));
    }
  }

  // Deal pipeline
  if (pathname === '/api/deals/pipeline' && method === 'GET') {
    const pipeline = [
      'qualification',
      'needs_analysis', 
      'proposal',
      'negotiation',
      'closed_won',
      'closed_lost'
    ].map(stage => ({
      _id: stage,
      deals: db.deals.filter(d => d.stage === stage),
      count: db.deals.filter(d => d.stage === stage).length,
      totalValue: db.deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.value, 0)
    }));
    
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify(pipeline));
  }

  // Single deal operations
  if (pathname.match(/^\/api\/deals\/[\w-]+$/)) {
    const id = pathname.split('/').pop();
    const dealIndex = db.deals.findIndex(d => d._id === id);
    
    if (method === 'GET') {
      const deal = db.deals[dealIndex];
      if (!deal) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Deal not found' }));
      }
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify(deal));
    }
    
    if (method === 'PUT') {
      if (dealIndex === -1) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Deal not found' }));
      }
      
      const oldDeal = db.deals[dealIndex];
      db.deals[dealIndex] = {
        ...oldDeal,
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      // Add activity if stage changed
      if (oldDeal.stage !== body.stage) {
        db.activities.push({
          _id: generateId(),
          type: 'deal_updated',
          title: `Deal stage changed: ${oldDeal.stage} → ${body.stage}`,
          description: oldDeal.title,
          user: currentUser,
          relatedTo: { type: 'deal', id: oldDeal._id },
          createdAt: new Date().toISOString()
        });
      }
      
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify(db.deals[dealIndex]));
    }
    
    if (method === 'DELETE') {
      if (dealIndex === -1) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Deal not found' }));
      }
      db.deals.splice(dealIndex, 1);
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({ message: 'Deal deleted' }));
    }
  }

  // Tasks CRUD
  if (pathname === '/api/tasks') {
    if (method === 'GET') {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const start = (page - 1) * limit;
      const tasks = db.tasks.slice(start, start + limit);
      
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({
        tasks,
        totalPages: Math.ceil(db.tasks.length / limit),
        currentPage: page,
        total: db.tasks.length
      }));
    }
    
    if (method === 'POST') {
      const task = {
        _id: generateId(),
        ...body,
        assignedTo: body.assignedTo || currentUser,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.tasks.push(task);
      
      db.activities.push({
        _id: generateId(),
        type: 'task_created',
        title: `Task created: ${task.title}`,
        user: currentUser,
        relatedTo: { type: 'task', id: task._id },
        createdAt: new Date().toISOString()
      });
      
      res.writeHead(201, corsHeaders);
      return res.end(JSON.stringify(task));
    }
  }

  // My tasks
  if (pathname === '/api/tasks/my-tasks' && method === 'GET') {
    const myTasks = db.tasks.filter(t => 
      t.assignedTo._id === currentUser._id && 
      ['todo', 'in_progress'].includes(t.status)
    );
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify(myTasks));
  }

  // Single task operations
  if (pathname.match(/^\/api\/tasks\/[\w-]+$/)) {
    const id = pathname.split('/').pop();
    const taskIndex = db.tasks.findIndex(t => t._id === id);
    
    if (method === 'GET') {
      const task = db.tasks[taskIndex];
      if (!task) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Task not found' }));
      }
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify(task));
    }
    
    if (method === 'PUT') {
      if (taskIndex === -1) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Task not found' }));
      }
      
      const oldTask = db.tasks[taskIndex];
      db.tasks[taskIndex] = {
        ...oldTask,
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      // Add activity if task completed
      if (oldTask.status !== 'completed' && body.status === 'completed') {
        db.tasks[taskIndex].completedAt = new Date().toISOString();
        db.activities.push({
          _id: generateId(),
          type: 'task_completed',
          title: `Task completed: ${oldTask.title}`,
          user: currentUser,
          relatedTo: { type: 'task', id: oldTask._id },
          createdAt: new Date().toISOString()
        });
      }
      
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify(db.tasks[taskIndex]));
    }
    
    if (method === 'DELETE') {
      if (taskIndex === -1) {
        res.writeHead(404, corsHeaders);
        return res.end(JSON.stringify({ message: 'Task not found' }));
      }
      db.tasks.splice(taskIndex, 1);
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({ message: 'Task deleted' }));
    }
  }

  // Activities
  if (pathname === '/api/activities') {
    if (method === 'GET') {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const start = (page - 1) * limit;
      const activities = db.activities.slice(start, start + limit);
      
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({
        activities,
        totalPages: Math.ceil(db.activities.length / limit),
        currentPage: page,
        total: db.activities.length
      }));
    }
    
    if (method === 'POST') {
      const activity = {
        _id: generateId(),
        ...body,
        user: currentUser,
        createdAt: new Date().toISOString()
      };
      db.activities.push(activity);
      res.writeHead(201, corsHeaders);
      return res.end(JSON.stringify(activity));
    }
  }

  // Activity timeline
  if (pathname === '/api/activities/timeline' && method === 'GET') {
    const grouped = db.activities.reduce((acc, activity) => {
      const date = new Date(activity.createdAt).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(activity);
      return acc;
    }, {});
    
    res.writeHead(200, corsHeaders);
    return res.end(JSON.stringify(grouped));
  }

  // Default 404
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({ message: 'Not found' }));
};

// Create server
const server = http.createServer(handleRequest);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`
🚀 Full-Featured CRM Demo Server Running!
========================================
Server URL: http://localhost:${PORT}
API Base: http://localhost:${PORT}/api

✨ This server includes:
- Complete CRUD operations for all entities
- Sample data (contacts, companies, deals, tasks)
- Activity tracking
- Dashboard analytics
- Deal pipeline management
- Task management

📝 Sample Data Loaded:
- 2 Companies (Acme Corporation, Global Tech Inc)
- 2 Contacts (John Smith, Sarah Johnson)
- 2 Deals ($150k and $50k)
- 2 Tasks (Follow up call, Prepare proposal)
- Activity history

🔐 Authentication:
- Register with any email/password
- Login automatically creates account if needed
- Token-based authentication

Press Ctrl+C to stop the server.
`);
});