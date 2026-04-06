const { LogTandon, PerangkatIoT, Notification } = require('../models');

// 1. Fungsi untuk Mencatat Ketinggian Air & Proteksi Hardware
exports.recordWaterLevel = async (req, res) => {
    try {
        const { perangkat_id, ketinggian_air } = req.body;
        
        if (ketinggian_air < 10) {
            // Trigger di model PerangkatIoT akan otomatis membuat notifikasi "Pompa MATI"
            await PerangkatIoT.update(
                { status_pompa_air: false }, 
                { where: { id: perangkat_id }, individualHooks: true } // PENTING: individualHooks: true agar trigger jalan
            );
        }
        res.status(201).json({ status: 'success' });
    } catch (error) {
        console.error("❌ Error recordWaterLevel:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// 2. Fungsi untuk UI (Menampilkan Level Air Terakhir di Dashboard)
exports.getLatestWaterLevel = async (req, res) => {
    try {
        const { perangkat_id } = req.params;

        const data = await LogTandon.findOne({
            where: { perangkat_id },
            order: [['createdAt', 'DESC']] // Mengambil data terbaru berdasarkan waktu dibuat
        });

        if (!data) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Data tidak ditemukan untuk perangkat ini.' 
            });
        }

        res.status(200).json({ 
            status: 'success', 
            data: data 
        });

    } catch (error) {
        console.error("❌ Error getLatestWaterLevel:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};