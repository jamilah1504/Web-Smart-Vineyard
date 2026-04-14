import { getAccessToken } from '../utils/authStorage';

const BASE_URL = 'https://d34f3d5l-5000.asse.devtunnels.ms'; // Pastikan port sesuai backend Anda

export async function getLatestSensorData(perangkatId) {
  const token = getAccessToken(); // Ambil token Satpam dari storage
  
  const res = await fetch(`${BASE_URL}/api/sensor/data/${perangkatId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Bawa kunci tokennya
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal mengambil data sensor');
  }

  return await res.json();
}