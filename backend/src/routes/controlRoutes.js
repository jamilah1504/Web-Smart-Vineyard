// routes/controlRoutes.js
const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController');
const tandonController = require('../controllers/tandonController');

// Route Kendali Pompa
router.put('/pump/:id', controlController.updatePumpStatus);
router.get('/pump-status/:id', controlController.getPumpStatus);

// Route Sensor Ultrasonik (Tandon)
router.post('/tandon/log', tandonController.recordWaterLevel);
router.get('/tandon/latest/:perangkat_id', tandonController.getLatestWaterLevel);

module.exports = router;