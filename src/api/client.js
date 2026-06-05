import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  || 'https://equilibrio-ideal-api-production.up.railway.app';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eq_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eq_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
