const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Endpoint: GET /api/dashboard/summary/:perangkat_id
router.get('/summary/:perangkat_id', dashboardController.getDashboardSummary);

module.exports = router;