const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const { protect } = require('../middleware/authMiddleware');

// Jika di server.js sudah /api/notifications, maka di sini cukup '/'
router.get('/', protect, notificationController.getMyNotifications);

module.exports = router;