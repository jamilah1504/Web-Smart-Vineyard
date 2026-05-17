const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController'); 

// Jalur GET untuk ESP32 menarik instruksi dan threshold dinamis
router.get('/pump/:id', controlController.getPumpStatus);

// Jalur POST untuk Website mengubah status aktuator
router.post('/pump/update/:id', controlController.updatePumpStatus);

module.exports = router;