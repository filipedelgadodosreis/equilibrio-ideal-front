import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    || 'https://equilibrio-ideal-api-production.up.railway.app',
  headers: { 'Content-Type': 'application/json' },
});

console.log('BASE URL:', import.meta.env.VITE_API_URL);
console.log('URL completa:', client.defaults.baseURL);

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('eq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('eq_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
