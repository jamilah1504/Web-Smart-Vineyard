const { Sequelize } = require('sequelize');
require('dotenv').config();

// Menggunakan format satu objek agar lebih aman
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'sensor',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false, // Ubah ke console.log untuk melihat query SQL
  timezone: '+07:00'
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi database MySQL berhasil.');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error);
  }
};

module.exports = { sequelize, connectDB };