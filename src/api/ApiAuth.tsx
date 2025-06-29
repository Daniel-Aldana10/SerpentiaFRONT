import type {AuthRequest, RegisterRequest} from '../types/types';
import axiosInstance from './ApiAxios';
import type { AxiosRequestConfig, AxiosError } from 'axios';

// Interceptor para agregar el token (si existe) en las solicitudes
axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('authToken');

  // Rutas que no deben incluir el token
  const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

  if (token && !isAuthRoute) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error: AxiosError) => {
  return Promise.reject(error);
});

// Función para registrar un nuevo usuario
const registerUser = async (userData: RegisterRequest): Promise<any> => {
  try {
    const response = await axiosInstance.post('auth/register', userData);
    console.log('Usuario registrado exitosamente:', response.data);
    return response.data; // Retorna el resultado, puedes usarlo si es necesario
  } catch (error: any) {
    console.error('Error al registrar usuario:', error.response?.data);
    throw error; // Lanza el error para poder manejarlo donde llames esta función
  }
};

// Función para autenticar al usuario (login)
const loginUser = async (credentials: AuthRequest): Promise<string> => {
  try {
    
    console.log(credentials.username + " contra " + credentials.password)
    console.log(import.meta.env.VITE_API_URL);
    const response = await axiosInstance.post('/auth/login', credentials);
    console.log('Login exitoso. Token:', response.data.token);
    // Almacenar el token en localStorage (o cookies si prefieres)
    console.log(response.data.token);
    localStorage.setItem('authToken', response.data.token);
    return response.data.token as string; // Devuelve solo el token
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error.response?.data);
    throw error; // Lanza el error para manejarlo en otro lugar
  }
};

// Función para obtener el token de autenticación (si es necesario en otro lugar)
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Exportar las funciones para poder usarlas en otros archivos
export { registerUser, loginUser, getAuthToken };
