import axios from 'axios';

// In local development, requests go to the relative path '/api', which
// Vite's dev server proxy (see vite.config.js: server.proxy['/api']) forwards
// to your local backend at http://localhost:5000. This means the frontend
// always talks to whichever backend you're actually running locally — no
// CORS issues, no stale-deployment issues, and no need to touch this file
// again when you eventually deploy (see note below).
const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('civic_token');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;