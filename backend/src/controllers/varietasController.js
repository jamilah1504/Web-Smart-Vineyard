const VarietasAnggur = require('../models/VarietasAnggur');

exports.createVarietas = async (req, res) => {
    try {
        const { nama_varietas, min_moisture, min_ph, max_ph } = req.body;

        // Validasi Sederhana
        if (min_moisture < 0 || min_moisture > 100) {
            return res.status(400).json({ status: 'error', message: 'Kelembapan harus antara 0-100%' });
        }
        if (min_ph < 0 || max_ph > 14) {
            return res.status(400).json({ status: 'error', message: 'Rentang pH tidak valid (0-14)' });
        }

        const varietas = await VarietasAnggur.create(req.body);
        res.status(201).json({ status: 'success', data: varietas });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getAllVarietas = async (req, res) => {
    try {
        const varietas = await VarietasAnggur.findAll();
        res.status(200).json({ status: 'success', data: varietas });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateVarietas = async (req, res) => {
    try {
        const varietas = await VarietasAnggur.findByPk(req.params.id);
        if (!varietas) return res.status(404).json({ message: 'Varietas tidak ditemukan' });

        await varietas.update(req.body);
        res.status(200).json({ status: 'success', data: varietas });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.deleteVarietas = async (req, res) => {
    try {
        const varietas = await VarietasAnggur.findByPk(req.params.id);
        if (!varietas) return res.status(404).json({ message: 'Varietas tidak ditemukan' });

        await varietas.destroy();
        res.status(200).json({ status: 'success', message: 'Varietas berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};