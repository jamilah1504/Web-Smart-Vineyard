import { getAccessToken } from '../utils/authStorage';

const BASE_URL = "https://d34f3d5l-5000.asse.devtunnels.ms/api"; 

export const downloadReport = async (filter, format) => {
  const token = getAccessToken();
  
  // Masukkan tipe, tanggal, dan format ke dalam URL Query
  const queryParams = new URLSearchParams({
    startDate: filter.startDate,
    endDate: filter.endDate,
    type: filter.type,
    format: format // 'excel' atau 'pdf'
  }).toString();

  const url = `${BASE_URL}/reports/export?${queryParams}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Gagal mengunduh laporan');

    // Karena file berupa binary (bukan JSON), kita tangkap sebagai Blob
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // Trik membuat link download otomatis di browser
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Sesuaikan ekstensi file saat didownload
    const ext = format === 'excel' ? 'xlsx' : 'pdf';
    link.setAttribute('download', `Laporan_${filter.type.replace(/\s+/g, '_')}.${ext}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  }
};