import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('homeassist_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle token expiration or unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and requireLogin is signaled, we don't necessarily clear token if it was just a guest hit
      if (error.response.data?.message?.includes('expired') || error.response.data?.message?.includes('Invalid')) {
        localStorage.removeItem('homeassist_token');
        localStorage.removeItem('homeassist_user');
      }
    }
    return Promise.reject(error);
  }
);
