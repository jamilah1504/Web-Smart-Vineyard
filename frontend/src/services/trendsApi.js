import axios from 'axios';
import { getAccessToken } from '../utils/authStorage';

const BASE_URL = "https://d34f3d5l-5000.asse.devtunnels.ms/api"; 

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const getWeatherTrends = async (perangkatId = "ESP32-MAC-A001") => {
  try {
    // Memanggil rute yang baru saja kita atur di trendRoutes.js
    const response = await axios.get(`${BASE_URL}/trends/${perangkatId}`, getAuthHeaders());
    
    return response.data; 
  } catch (error) {
    console.error("🔴 Error mengambil tren cuaca BMKG:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Gagal mengambil data tren cuaca');
  }
};