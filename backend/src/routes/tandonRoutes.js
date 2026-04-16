const express = require('express');
const router = express.Router();
const { getLatestWaterLevel, controlPump } = require('../controllers/tandonController'); 
const { protect } = require('../middleware/authMiddleware');

router.get('/baca-air-tandon/:perangkat_id', getLatestWaterLevel);
router.post('/control-pump', protect, controlPump);

module.exports = router;