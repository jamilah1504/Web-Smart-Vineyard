const express = require('express');
const router = express.Router();
const trendController = require('../controllers/trendController');
const { protect } = require('../middleware/authMiddleware'); // Pastikan ini ada jika butuh token

router.get('/:perangkat_id', protect, trendController.getSevenDayTrends);

module.exports = router;