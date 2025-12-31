import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

export const userApi = {
  getAll: () => api.get('/api/users'),
  getPending: () => api.get('/api/users/pending'),
  approve: (id) => api.put(`/api/users/${id}/approve`),
  reject: (id) => api.put(`/api/users/${id}/reject`),
  disable: (id) => api.put(`/api/users/${id}/disable`),
  enable: (id) => api.put(`/api/users/${id}/enable`),
  updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
};

export const adminApi = {
  createUser: (data) => api.post('/api/admin/create-user', data),
  editUser: (id, data) => api.put(`/api/admin/edit-user/${id}`, data),
};

export const profileApi = {
  get: () => api.get('/api/profile'),
  update: (data) => api.put('/api/profile', data),
};

export const eventApi = {
  getAll: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
  getRegistrations: (id) => api.get(`/api/events/${id}/registrations`),
};

export const registrationApi = {
  register: (eventId, data) => api.post(`/api/events/${eventId}/register`, data),
  cancel: (id) => api.delete(`/api/registrations/${id}`),
  getMy: () => api.get('/api/registrations/my'),
};

export const attendanceApi = {
  getSessionAttendance: (sessionId) => api.get(`/api/sessions/${sessionId}/attendance`),
  mark: (data) => api.post('/api/attendance', data),
  remove: (id) => api.delete(`/api/attendance/${id}`),
};

export default api;
