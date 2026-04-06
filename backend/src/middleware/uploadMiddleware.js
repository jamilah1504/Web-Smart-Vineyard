// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Pastikan folder uploads ada
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// 2. Konfigurasi Penyimpanan
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. Filter File (UPDATE: Support Flutter Web)
const fileFilter = (req, file, cb) => {
    // Log untuk debugging
    console.log("--> Cek File:", file.originalname, "| Tipe:", file.mimetype);

    // Cek apakah tipe Mime-nya Image/Video
    const isStandardMime = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    
    // Cek Ekstensi (Backup jika Flutter kirim sebagai octet-stream)
    const ext = path.extname(file.originalname).toLowerCase();
    const isImageExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    const isVideoExt = ['.mp4', '.mov', '.avi'].includes(ext);
    
    // Jika Flutter Web mengirim 'application/octet-stream', kita loloskan ASALKAN ekstensinya benar
    const isOctetStream = file.mimetype === 'application/octet-stream';

    if (isStandardMime || (isOctetStream && (isImageExt || isVideoExt))) {
        cb(null, true);
    } else {
        cb(new Error(`Tipe file ditolak! Mime: ${file.mimetype}, Ext: ${ext}`), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit 50MB
    fileFilter: fileFilter
});

module.exports = upload;