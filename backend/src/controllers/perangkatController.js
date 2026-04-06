const PerangkatIoT = require('../models/PerangkatIoT');
const User = require('../models/User');
const VarietasAnggur = require('../models/VarietasAnggur');
const { Op } = require('sequelize');

exports.createPerangkat = async (req, res) => {
    try {
        // req.body berisi: id (MAC Address), user_id, varietas_id, nama_node, lokasi_blok
        const perangkat = await PerangkatIoT.create({ ...req.body, status_koneksi: 'Offline' });
        res.status(201).json({ status: 'success', data: perangkat });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getAllPerangkat = async (req, res) => {
    try {
        // Include relasi agar tahu milik siapa dan ditanam anggur apa
        const perangkat = await PerangkatIoT.findAll({
            include: [
                { model: User, attributes: ['nama_lengkap'] },
                { model: VarietasAnggur, attributes: ['nama_varietas'] }
            ]
        });
        res.status(200).json({ status: 'success', data: perangkat });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.checkDeviceStatus = async (req, res) => {
    try {
        // Anggap perangkat offline jika tidak kirim data dalam 5 menit terakhir
        const limitTime = new Date(Date.now() - 5 * 60 * 1000);

        // Cari semua perangkat Online yang terakhir update-nya sudah lama
        // (Pastikan tabel Perangkat_IoT punya kolom 'updatedAt')
        const [updatedRows] = await PerangkatIoT.update(
            { status_koneksi: 'Offline' },
            { 
                where: { 
                    status_koneksi: 'Online',
                    updatedAt: { [Op.lt]: limitTime } 
                } 
            }
        );

        res.json({ status: 'success', message: `${updatedRows} perangkat diatur ke Offline.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};