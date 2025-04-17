import axios from 'axios';
import cache from './apiCache';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add caching for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cachedResponse = cache.get(cacheKey);
      
      if (cachedResponse) {
        // Cancel the request and return cached response
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        source.cancel(cachedResponse);
      }
      
      // Store the cache key for later use
      config._cacheKey = cacheKey;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration and caching
api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get' && response.config._cacheKey) {
      cache.set(response.config._cacheKey, response);
    }
    return response;
  },
  (error) => {
    // Return cached response if request was cancelled due to caching
    if (axios.isCancel(error)) {
      return Promise.resolve(error.message);
    }
    
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // Handle authentication errors
    if (response && response.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login?session=expired';
    }
    
    // Handle general server errors
    if (response && response.status >= 500) {
      console.error('Server error:', error);
    }
    
    return Promise.reject(error);
  }
);

export const invalidateCache = () => {
  cache.clear();
};

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
  updateProfile: (id, data) => {
    console.log('API Request: updateProfile', id, typeof data);
    
    // Check if data is FormData and ensure proper headers
    const headers = data instanceof FormData ? {
      'Content-Type': 'multipart/form-data' 
    } : {};
    
    return api.put(`/users/${id}/profile`, data, { headers });
  },
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

// Update your notification API endpoints:

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  create: (data) => api.post('/notifications', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Add to your existing exports
export const messageApi = {
  send: (ticketId, recipientId, content) => 
    api.post('/messages', { ticketId, recipientId, content }),
  getConversation: (ticketId, userId) => 
    api.get(`/messages/ticket/${ticketId}/user/${userId}`),
  markAsRead: (messageId) => 
    api.put(`/messages/${messageId}/read`),
  markAllAsRead: (ticketId, senderId) => 
    api.put(`/messages/ticket/${ticketId}/user/${senderId}/read-all`),
  getUserConversations: () => 
    api.get('/messages/conversations'),
  getById: (messageId) => 
    api.get(`/messages/${messageId}`),
  getRecentMessages: (limit = 5) => 
    api.get(`/messages/recent?limit=${limit}`)
};

export default api;