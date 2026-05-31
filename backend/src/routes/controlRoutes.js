const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController'); 

// ... route yang sudah ada ...
router.get('/pump/:id', controlController.getPumpStatus);
router.post('/pump/update/:id', controlController.updatePumpStatus);

// 🌟 ROUTE BARU UNTUK MENGAMBIL HISTORI
router.get('/pump/history/:id', controlController.getPumpHistory);

module.exports = router;