const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware'); 

// Gunakan console log sementara untuk cek apakah function-nya terbaca
console.log("Check Controller:", typeof reportController.exportExcel); 
console.log("Check Middleware:", typeof auth.verifyToken);

// Pastikan nama fungsinya SAMA PERSIS dengan yang di-export controller
router.get('/export-excel', auth.verifyToken, reportController.exportExcel);

module.exports = router;