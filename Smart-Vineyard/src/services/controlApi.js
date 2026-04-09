import axios from 'axios';

const API_URL = "https://d34f3d5l-5000.asse.devtunnels.ms/api/controls";

// Fungsi untuk ambil config header otomatis
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // CEK: apakah saat login kamu simpan dengan nama 'token'?
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