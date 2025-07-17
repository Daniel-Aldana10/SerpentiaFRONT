import axiosInstance from './ApiAxios';

export async function fetchUserStatistics() {
  try {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  } catch (error: any) {
    console.error('Error obteniendo estadísticas de usuario:', error);
    throw error;
  }
} 