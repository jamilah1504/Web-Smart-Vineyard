import axios from 'axios';

const API_URL = "http://localhost:5000/api/controls";

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
  const response = await axios.get(`http://localhost:5000/api/perangkat`, getAuthHeaders());
  return response.data;
};

export const updatePumpStatus = async (id, data) => {
  // PUT request dengan data dan headers
  const response = await axios.put(`${API_URL}/pump/${id}`, data, getAuthHeaders());
  return response.data;
};