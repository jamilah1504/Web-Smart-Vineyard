const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController');

// Route Kendali Pompa (Manual/Auto Switch)
// Pastikan nama fungsi di sini SAMA dengan di controller
router.put('/pump/:id', controlController.updatePumpStatus);
router.get('/pump-status/:id', controlController.getPumpStatus);

module.exports = router;