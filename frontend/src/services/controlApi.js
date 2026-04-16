import axios from 'axios';
import { getAccessToken } from '../utils/authStorage';

// Gunakan base URL utama saja agar fleksibel
const BASE_URL = "https://d34f3d5l-5000.asse.devtunnels.ms/api";

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// 1. Ambil Semua Perangkat
export const getAllDevices = async () => {
  const response = await axios.get(`${BASE_URL}/perangkat`, getAuthHeaders());
  return response.data;
};

// 2. Update Pompa (Lewat router control)
export const updatePumpStatus = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/controls/pump/${id}`, data, getAuthHeaders());
  return response.data;
};

// 3. AMBIL DATA TANDON (Lewat router sensor agar tidak tertukar lagi!)
export const getLatestWaterLevel = async (perangkatId) => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/tandon-system/baca-air-tandon/${perangkatId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};