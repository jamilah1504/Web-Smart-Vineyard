const PerangkatIoT = require('../models/PerangkatIoT');

exports.updatePumpStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_pompa_air, status_pompa_pupuk, mode_kerja } = req.body;

        const updateData = {};
        if (status_pompa_air !== undefined) updateData.status_pompa_air = status_pompa_air;
        if (status_pompa_pupuk !== undefined) updateData.status_pompa_pupuk = status_pompa_pupuk;
        if (mode_kerja) updateData.mode_kerja = mode_kerja;

        await PerangkatIoT.update(updateData, { where: { id } });

        res.json({ 
            status: 'success', 
            message: 'Kendali pompa (Air/Pupuk) berhasil diperbarui',
            updated: updateData 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getPumpStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await PerangkatIoT.findByPk(id);
        
        res.json({ 
            status_pompa_air: device.status_pompa_air,
            status_pompa_pupuk: device.status_pompa_pupuk,
            mode_kerja: device.mode_kerja 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};