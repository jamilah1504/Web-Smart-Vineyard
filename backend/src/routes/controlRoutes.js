const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController'); 

// Rute untuk Arduino mengambil status (Tanpa token protect, agar ESP32 mudah akses)
router.get('/pump/:id', controlController.getPumpStatus);

// Rute untuk React / Web mengubah status 
router.put('/pump/:id', controlController.updatePumpStatus);

module.exports = router;