const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] }
        });
        res.status(200).json({ status: 'success', data: users });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.status(200).json({ status: 'success', data: user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { nama_lengkap, email, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await User.create({ nama_lengkap, email, password_hash, role });
        
        // Hapus password_hash dari response
        const userResponse = newUser.toJSON();
        delete userResponse.password_hash;

        res.status(201).json({ status: 'success', data: userResponse });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const { nama_lengkap, email, role, password } = req.body;
        
        user.nama_lengkap = nama_lengkap || user.nama_lengkap;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ status: 'success', message: 'User berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        await user.destroy();
        res.status(200).json({ status: 'success', message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getStaffOnly = async (req, res) => {
    try {
        const staff = await User.findAll({
            where: { role: 'Staff' },
            attributes: { exclude: ['password_hash'] }
        });
        res.status(200).json({ status: 'success', data: staff });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};