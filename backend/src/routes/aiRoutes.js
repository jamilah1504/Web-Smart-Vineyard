// src/routes/diagnosisRoutes.js
const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');

router.post('/detect', diagnosisController.diagnoseLeaf);
router.get('/latest/:perangkat_id', diagnosisController.getLatestDiagnosis);
router.get('/history/:perangkat_id', diagnosisController.getDiagnosisHistory);
module.exports = router;