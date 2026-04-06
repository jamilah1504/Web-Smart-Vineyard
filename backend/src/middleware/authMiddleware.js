// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ambil data user, kecualikan password_hash
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password_hash'] }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'User tidak ditemukan' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

exports.optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findByPk(decoded.id);
        } catch (error) {
            console.log('Token tidak valid, melanjutkan sebagai anonim.');
        }
    }
    next();
};

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Token missing" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid token" });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Akses ditolak. Role tidak diizinkan.' });
        }
        next();
    };
};

// Mengganti isAdmin menjadi isOwner
exports.isOwner = (req, res, next) => {
  if (req.user && req.user.role === "Owner") {
    next();
  } else {
    res.status(403).json({ message: "Akses ditolak. Hanya untuk Owner." });
  }
};