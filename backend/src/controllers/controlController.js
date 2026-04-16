const { PerangkatIoT } = require('../models');

// 1. Update Status Pompa & Mode Kerja
exports.updatePumpStatus = async (req, res) => {
  const { id } = req.params; // MAC Address
  const { status_pompa_air, status_pompa_pupuk, mode_kerja } = req.body;

  try {
    const [updated] = await PerangkatIoT.update(
      { status_pompa_air, status_pompa_pupuk, mode_kerja },
      { where: { id: id } }
    );

    if (updated) {
      res.json({ status: 'success', message: 'Kontrol berhasil diperbarui' });
    } else {
      res.status(404).json({ status: 'error', message: 'Perangkat tidak ditemukan' });
    }
  } catch (err) {
    console.error("❌ Error updatePumpStatus:", err.message);
    res.status(500).json({ status: 'error', error: err.message });
  }
};

// 2. Ambil Status Pompa Terkini
exports.getPumpStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await PerangkatIoT.findByPk(id);
        
        if (!device) {
            return res.status(404).json({ status: 'error', message: 'Device tidak ditemukan' });
        }

        res.json({ 
            status: 'success',
            data: {
                status_pompa_air: device.status_pompa_air,
                status_pompa_pupuk: device.status_pompa_pupuk,
                mode_kerja: device.mode_kerja 
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
};