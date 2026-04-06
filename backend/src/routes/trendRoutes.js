const express = require('express');
const router = express.Router();
const trendController = require('../controllers/trendController');

router.get('/forecast-7days', trendController.getSevenDayTrends);

module.exports = router;