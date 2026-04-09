import axios from 'axios';
import { getAccessToken } from '../utils/authStorage';

const API_URL = "https://d34f3d5l-5000.asse.devtunnels.ms/api/controls";

// Fungsi untuk ambil config header otomatis
const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const getAllDevices = async () => {
  // Route ini biasanya ada di perangkatRoutes.js
  const response = await axios.get(`https://d34f3d5l-5000.asse.devtunnels.ms/api/perangkat`, getAuthHeaders());
  return response.data;
};

export const updatePumpStatus = async (id, data) => {
  // PUT request dengan data dan headers
  const response = await axios.put(`${API_URL}/pump/${id}`, data, getAuthHeaders());
  return response.data;
};

// Get latest water level data for a specific device
export const getLatestWaterLevel = async (perangkatId) => {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/tandon/latest/${perangkatId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal mengambil data level tandon');
  }

  return await res.json();
};