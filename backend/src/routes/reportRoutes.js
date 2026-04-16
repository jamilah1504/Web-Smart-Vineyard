const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware'); 

router.get('/export', auth.verifyToken, reportController.exportReport);

module.exports = router;