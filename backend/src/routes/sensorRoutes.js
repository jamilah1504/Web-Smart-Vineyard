const express = require('express');
const { 
  receiveAllData, // Ganti receiveSensorData menjadi receiveAllData
  getLatestSensorData 
} = require('../controllers/sensorController');
const { protect } = require('../middleware/authMiddleware');
const sendTelegram = require('../utils/telegram');

const router = express.Router();

/**
 * 1. RUTE PENGETESAN TELEGRAM
 * Taruh di paling atas agar Express mendeteksi ini sebagai teks statis, 
 * bukan dianggap sebagai :perangkat_id
 */
router.get('/test-tele', async (req, res) => {
    try {
        await sendTelegram("🚀 *TES KONEKSI AETERA*\nBot berhasil terhubung ke server!");
        res.send("Pesan tes terkirim ke Telegram!");
    } catch (err) {
        res.status(500).send("Gagal: " + err.message);
    }
});

/**
 * 2. RUTE UNTUK ESP32
 * Menggunakan fungsi receiveAllData (Tanah + Tandon)
 */
router.post('/data', receiveAllData);

/**
 * 3. RUTE UNTUK DASHBOARD REACT
 * Mengambil data log terbaru
 */
router.get('/data/:perangkat_id', protect, getLatestSensorData);

module.exports = router;