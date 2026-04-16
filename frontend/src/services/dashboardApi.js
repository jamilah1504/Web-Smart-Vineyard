import axios from 'axios';

const BASE_URL = "https://d34f3d5l-5000.asse.devtunnels.ms/api/dashboard";

export const getDashboardSummary = async (perangkatId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/summary/${perangkatId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};