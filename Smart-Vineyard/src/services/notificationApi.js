import axios from 'axios';

// Gunakan URL Backend kamu
const API_URL = "https://d34f3d5l-5000.asse.devtunnels.ms/api/notifications";

export const getMyNotifications = async () => {
    try {
        // 1. Ambil token yang tersimpan saat login
        // Pastikan nama kuncinya sama dengan yang kamu pakai di LoginPage (misal: 'token' atau 'access_token')
        const token = localStorage.getItem('sv_access_token'); 

        // 2. Kirim request dengan Header Authorization
        const response = await axios.get(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tunnel-Skip-Anti-Phishing-Page': 'true' // Agar tidak dicegat Dev Tunnels
            }
        });

        return response.data;
    } catch (error) {
        // Teruskan error agar bisa ditangkap oleh NotificationsPage.jsx
        throw error;
    }
};