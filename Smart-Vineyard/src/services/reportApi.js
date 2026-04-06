import axios from 'axios';

const API_URL = "http://localhost:5000/api/reports";

export const downloadReport = async (params, format = 'excel') => {
  // 1. Ambil token menggunakan key yang benar: 'sv_access_token'
  const token = localStorage.getItem('sv_access_token'); 
  
  // Debugging log untuk memastikan di console browser token terbaca
  console.log("Menarik token dari Local Storage:", token ? "Token ditemukan" : "Token TIDAK ditemukan");

  if (!token) {
    // Pesan ini akan muncul jika sv_access_token kosong/null
    throw new Error("Sesi habis, silakan login kembali.");
  }

  const endpoint = format === 'excel' ? '/export-excel' : '/export-pdf';

  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      params: params,
      headers: { 
        // 2. Sertakan token ke Header Authorization
        'Authorization': `Bearer ${token}` 
      },
      responseType: 'blob' // Wajib untuk file biner (Excel/PDF)
    });

    // 3. Logika Proses Download File
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileURL = window.URL.createObjectURL(blob);
    const fileLink = document.createElement('a');
    
    fileLink.href = fileURL;
    
    // Penamaan file yang lebih rapi
    const timestamp = new Date().toISOString().split('T')[0];
    const cleanTypeName = params.type.replace(/\s+/g, '_');
    fileLink.setAttribute('download', `Laporan_${cleanTypeName}_${timestamp}.xlsx`);
    
    document.body.appendChild(fileLink);
    fileLink.click();
    
    // Cleanup memory
    fileLink.remove();
    window.URL.revokeObjectURL(fileURL);
    
    return { status: 'success' };
  } catch (error) {
    // Tangani error jika Unauthorized (401) dari Backend
    if (error.response && error.response.status === 401) {
      throw new Error("Token tidak valid atau kadaluarsa. Silakan login ulang.");
    }
    
    console.error("Detail Error Download:", error);
    throw new Error("Gagal mengunduh laporan. Pastikan koneksi server stabil.");
  }
};