const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');

// 🌟 PERBAIKAN: Limit dibesarkan ke 50MB. 
// express.raw untuk menangkap dari Kamera, express.json untuk dari Web.
router.post('/detect', 
    express.raw({ type: 'image/jpeg', limit: '50mb' }), 
    express.json({ limit: '50mb' }), 
    diagnosisController.diagnoseLeaf
);
router.get('/latest/:perangkat_id', diagnosisController.getLatestDiagnosis);
router.get('/history/:perangkat_id', diagnosisController.getDiagnosisHistory);

module.exports = router;