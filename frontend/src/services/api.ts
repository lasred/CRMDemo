import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const contactsAPI = {
  getAll: (params?: any) => api.get('/contacts', { params }),
  getOne: (id: string) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post('/contacts', data),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  getActivities: (id: string) => api.get(`/contacts/${id}/activities`),
};

export const companiesAPI = {
  getAll: (params?: any) => api.get('/companies', { params }),
  getOne: (id: string) => api.get(`/companies/${id}`),
  create: (data: any) => api.post('/companies', data),
  update: (id: string, data: any) => api.put(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
  getContacts: (id: string) => api.get(`/companies/${id}/contacts`),
  getDeals: (id: string) => api.get(`/companies/${id}/deals`),
  getActivities: (id: string) => api.get(`/companies/${id}/activities`),
};

export const dealsAPI = {
  getAll: (params?: any) => api.get('/deals', { params }),
  getPipeline: () => api.get('/deals/pipeline'),
  getOne: (id: string) => api.get(`/deals/${id}`),
  create: (data: any) => api.post('/deals', data),
  update: (id: string, data: any) => api.put(`/deals/${id}`, data),
  delete: (id: string) => api.delete(`/deals/${id}`),
  getActivities: (id: string) => api.get(`/deals/${id}/activities`),
};

export const tasksAPI = {
  getAll: (params?: any) => api.get('/tasks', { params }),
  getMyTasks: (params?: any) => api.get('/tasks/my-tasks', { params }),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const activitiesAPI = {
  getAll: (params?: any) => api.get('/activities', { params }),
  getTimeline: () => api.get('/activities/timeline'),
  create: (data: any) => api.post('/activities', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: (period: string) => api.get('/dashboard/analytics', { params: { period } }),
};

export default api;