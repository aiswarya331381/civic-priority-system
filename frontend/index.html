import axios from 'axios';

// Local dev (`npm run dev`): VITE_API_URL is unset, so this falls back to
// the relative '/api' path, which Vite's dev server proxy (see
// vite.config.js: server.proxy['/api']) forwards to your local backend at
// http://localhost:5000.
//
// Deployed (Vercel, Netlify, etc.): there is no dev proxy in a static
// production build, so a relative '/api' path resolves against your own
// frontend domain — which has no backend behind it, causing exactly the
// "405 Method Not Allowed" you're seeing (the static host rejects POST).
// Setting VITE_API_URL as an environment variable in your hosting
// platform's project settings points requests at your real backend
// instead.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
