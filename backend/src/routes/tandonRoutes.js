const express = require('express');
const router = express.Router();
const { getLatestWaterLevel } = require('../controllers/tandonController');
const { protect } = require('../middleware/authMiddleware');

// Ganti rute di src/routes/tandonRoutes.js jadi begini:
router.get('/baca-air-tandon/:perangkat_id', protect, getLatestWaterLevel);

module.exports = router;