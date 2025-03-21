import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL
});

// Departments API
export const departmentApi = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
};

// Users API
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Tickets API
export const ticketApi = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  getByStatus: (status) => api.get(`/tickets/status/${status}`),
  getByPriority: (priority) => api.get(`/tickets/priority/${priority}`),
  create: (data) => api.post('/tickets', data),
  updateStatus: (id, status) => api.put(`/tickets/${id}/status`, { status }),
  claim: (id) => api.put(`/tickets/${id}/claim`),
  escalate: (id, reason) => api.put(`/tickets/${id}/escalate`, { reason }),
  reassign: (id, newAssigneeId, newDepartmentId) => 
    api.put(`/tickets/${id}/reassign`, { 
      new_assignee_id: newAssigneeId,
      new_department_id: newDepartmentId 
    }),
  delete: (id) => api.delete(`/tickets/${id}`)
};

// Comments API
export const commentApi = {
  getByTicket: (ticketId) => api.get(`/comments/ticket/${ticketId}`),
  create: (ticketId, content) => api.post(`/comments/ticket/${ticketId}`, { content }),
  delete: (commentId) => api.delete(`/comments/${commentId}`)
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;