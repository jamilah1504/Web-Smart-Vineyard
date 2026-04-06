const express = require('express');
const router = express.Router();
const perangkatController = require('../controllers/perangkatController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', perangkatController.getAllPerangkat);
router.post('/', authorize('Owner', 'Staff'), perangkatController.createPerangkat);

module.exports = router;