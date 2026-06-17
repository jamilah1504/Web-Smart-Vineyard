import { getAccessToken } from '../utils/authStorage';

const BASE_URL = 'https://d34f3d5l-5000.asse.devtunnels.ms'; // Pastikan port sesuai backend Anda

export async function getLatestSensorData(perangkatId, limit = 500) {
  const token = getAccessToken();
  
  const res = await fetch(`${BASE_URL}/api/sensor/data/${perangkatId}?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal mengambil data sensor');
  }

  return await res.json();
}