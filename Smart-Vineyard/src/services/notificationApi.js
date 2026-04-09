import axios from 'axios';

export const getMyNotifications = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('https://d34f3d5l-5000.asse.devtunnels.ms/api/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};