import type {AuthRequest, RegisterRequest} from '../types/types';
import axiosInstance from './ApiAxios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getCurrentUsername } from './ApiLobby';

// Interceptor para agregar el token (si existe) en las solicitudes
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('authToken');

  const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

  if (token && !isAuthRoute) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error: AxiosError) => {
  return Promise.reject(error);
});

const registerUser = async (userData: RegisterRequest): Promise<any> => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    
    return response.data; 
  } catch (error: any) {
    console.error('Error al registrar usuario:', error.response?.data);
    throw error; 
  }
};


const loginUser = async (credentials: AuthRequest): Promise<string> => {
  try {
    
    const response = await axiosInstance.post('/auth/login', credentials);

    // Almacenar el token en localStorage 
    localStorage.setItem('authToken', response.data.token);
    getCurrentUsername();
    return response.data.token as string; 
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error.response?.data);
    throw error; 
  }
};


const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export { registerUser, loginUser, getAuthToken };
