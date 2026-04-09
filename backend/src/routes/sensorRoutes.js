const express = require('express');
const { receiveSensorData, getLatestSensorData } = require('../controllers/sensorController');
const { protect } = require('../middleware/authMiddleware');
const sendTelegram = require('../utils/telegram');

const router = express.Router();

// Rute POST untuk ESP32 (Sengaja tidak di-protect JWT agar ESP32 mudah kirim data)
router.post('/data', receiveSensorData);

// Rute GET untuk React Dashboard (Di-protect karena hanya user login yang boleh lihat data)
router.get('/data/:perangkat_id', protect, getLatestSensorData);
router.get('/test-tele', async (req, res) => {
    try {
        await sendTelegram("🚀 *TES KONEKSI AETERA*\nBot berhasil terhubung ke server!");
        res.send("Pesan tes terkirim ke Telegram!");
    } catch (err) {
        res.status(500).send("Gagal: " + err.message);
    }
});

module.exports = router;