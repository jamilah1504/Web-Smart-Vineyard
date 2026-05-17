const express = require('express');
const { 
  receiveAllData, // Ganti receiveSensorData menjadi receiveAllData
  getLatestSensorData,
  getLatestWaterLevel
} = require('../controllers/sensorController');
const { protect } = require('../middleware/authMiddleware');
const sendTelegram = require('../utils/telegram');

const router = express.Router();

router.get('/test-tele', async (req, res) => {
    try {
        await sendTelegram("🚀 *TES KONEKSI AETERA*\nBot berhasil terhubung ke server!");
        res.send("Pesan tes terkirim ke Telegram!");
    } catch (err) {
        res.status(500).send("Gagal: " + err.message);
    }
});

router.get('/tandon/monitoring/:perangkat_id', getLatestWaterLevel); 

router.get('/data/:perangkat_id', protect, getLatestSensorData);

router.post('/data', receiveAllData);

module.exports = router;