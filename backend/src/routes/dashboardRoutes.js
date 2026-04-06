const express = require('express');
const router = express.Router();
const { getDashboardStats, getLaporanVisualization } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('Admin', 'Petugas'), getDashboardStats);
router.get('/visualization', protect, authorize('Admin', 'Petugas'), getLaporanVisualization);

module.exports = router;