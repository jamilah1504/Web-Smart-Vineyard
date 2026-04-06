const express = require('express');
const { registerUser, loginUser, googleLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Rute BARU untuk Google SSO
router.post('/google', googleLogin);

module.exports = router;