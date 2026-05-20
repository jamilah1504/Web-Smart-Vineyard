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

// ===== BARU: API Tandon Terintegrasi =====

// 4. Ambil Status Perangkat Lengkap
export const getDeviceStatus = async (perangkatId) => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/tandon-system/status/${perangkatId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// 5. Ambil Riwayat Level Air untuk Chart Real-time
export const getWaterLevelHistory = async (perangkatId, minutes = 60) => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/tandon-system/history/${perangkatId}`, {
    params: { minutes },
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// 6. BARU: Manual Control Pompa (Frontend -> Backend)
export const controlPump = async (perangkatId, pompaType, status) => {
  const token = getAccessToken();
  const response = await axios.post(
    `${BASE_URL}/tandon-system/control-pump`,
    {
      perangkat_id: perangkatId,
      pompa_type: pompaType, // 'air' atau 'nutrisi'
      status: status // true (on) atau false (off)
    },
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.data;
};

export const updateDeviceState = async (id, data) => {
  const token = getAccessToken();
  const response = await axios.post(
    `${BASE_URL}/controls/pump/update/${id}`, 
    data, 
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

// 7. Record Level Air dari Sensor IoT (dari device, tanpa auth)
export const recordWaterLevel = async (perangkatId, ketinggianAir, jenisTandon = 'air') => {
  const response = await axios.post(`${BASE_URL}/tandon-system/record`, {
    perangkat_id: perangkatId,
    ketinggian_air: ketinggianAir,
    jenis_tandon: jenisTandon
  });
  return response.data;
};