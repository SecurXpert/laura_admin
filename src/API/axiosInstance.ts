// src/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://lauratek.in:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally → logout / redirect
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Redirect to login page
      window.location.href = window.location.pathname.startsWith('/subadmin') ? '/subadmin-login' : '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;