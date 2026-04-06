// src/middleware/upload.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Konfigurasi Cloudinary (mengambil dari .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Konfigurasi penyimpanan untuk Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'damkar-lokasi-rawan', // Ini nama folder di Cloudinary
    format: async (req, file) => 'png', // Ubah semua format jadi png
    public_id: (req, file) => new Date().toISOString() + '-' + file.originalname,
  },
});

// Inisialisasi Multer dengan penyimpanan Cloudinary
const upload = multer({ storage: storage });
module.exports = upload;