import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});


axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default axiosInstance; 