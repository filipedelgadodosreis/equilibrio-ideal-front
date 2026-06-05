import axios from 'axios';

const BASE_URL = 'https://equilibrio-ideal-api-production.up.railway.app/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('eq_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  console.log('[Axios] Request:', config.method?.toUpperCase(), config.url, 'Token:', !!token);
  return config;
});

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
