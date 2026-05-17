// src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.registerUser = async (req, res) => {
    try {
        const { nama_lengkap, email, password, role } = req.body;

        if (!nama_lengkap || !email || !password) {
            return res.status(400).json({ message: 'Harap lengkapi semua field' });
        }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Pastikan role yang diinput valid, jika tidak set ke 'Staff'
        const validRoles = ['Owner', 'Agronomis', 'Staff'];
        const userRole = validRoles.includes(role) ? role : 'Staff';

        const user = await User.create({
            nama_lengkap,
            email,
            password_hash: hashedPassword, 
            role: userRole
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Data user tidak valid' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            res.json({
                id: user.id,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Email atau password salah' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_lengkap, email, password, role } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User tidak ditemukan.',
            });
        }

        user.nama_lengkap = nama_lengkap || user.nama_lengkap;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Data user berhasil diperbarui.',
            data: {
                id: user.id,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User tidak ditemukan.',
            });
        }

        await user.destroy();

        res.status(200).json({
            status: 'success',
            message: 'User berhasil dihapus',
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        // 👇 1. UBAH idToken MENJADI token (sesuai yang dikirim React)
        const { token } = req.body; 

        if (!token) {
            return res.status(400).json({ message: 'Token Google tidak ditemukan' });
        }

        // Verifikasi token asli dari Google
        const ticket = await client.verifyIdToken({
            idToken: token, // 👇 2. Masukkan variabel token ke sini
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload; 

        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({
                nama_lengkap: name,
                email: email,
                password_hash: null, 
                role: 'Staff' 
            });
        }

        res.status(200).json({
            status: 'success', // Tambahkan status ini agar React bisa membacanya
            id: user.id,
            nama_lengkap: user.nama_lengkap,
            email: user.email,
            role: user.role,
            token: generateToken(user.id), 
            user: { name, email } // Kirim data user untuk dashboard
        });

    } catch (error) {
        console.error("Error Google SSO:", error.message);
        res.status(401).json({ status: 'error', message: 'Token Google tidak valid atau kadaluarsa' });
    }
};