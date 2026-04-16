const { LogTandon, PerangkatIoT, Notification } = require('../models');
const sendTelegram = require('../utils/telegram');

// 1. Fungsi untuk Mencatat Ketinggian Air & Proteksi Hardware
exports.recordWaterLevel = async (req, res) => {
    try {
        const { perangkat_id, ketinggian_air, jenis_tandon } = req.body;

        // Validasi input sederhana
        if (!perangkat_id || ketinggian_air === undefined) {
            return res.status(400).json({ status: 'error', message: 'Data tidak lengkap.' });
        }

        // Simpan log tandon terlebih dahulu
        await LogTandon.create({ perangkat_id, ketinggian_air, jenis_tandon });

        // LOGIKA PROTEKSI KRITIS (< 10%)
        if (ketinggian_air < 10 && jenis_tandon === 'air') {
            // 1. Update Perangkat (Matikan Pompa)
            // individualHooks: true digunakan jika Anda memiliki 'afterUpdate' hook di model
            await PerangkatIoT.update(
                { status_pompa_air: false }, 
                { where: { id: perangkat_id }, individualHooks: true }
            );

            // 2. Kirim ke Telegram (Async, tidak perlu ditunggu jika ingin respon cepat)
            const pesanTelegram = `🚨 *DARURAT TANDON*\n\nID Perangkat: *${perangkat_id}*\nAir di tandon kritis: *${ketinggian_air}%*.\nPompa telah dimatikan otomatis untuk keamanan.`;
            sendTelegram(pesanTelegram).catch(err => console.error("❌ Gagal kirim Telegram:", err));

            // 3. Simpan ke Notification DB (untuk dashboard web)
            await Notification.create({
                perangkat_id,
                pesan: `Darurat! Air kritis (${ketinggian_air}%). Pompa dimatikan otomatis.`,
                tipe: 'critical'
            });

            console.log(`⚠️ Safety Triggered untuk ${perangkat_id}: Air ${ketinggian_air}%`);
        }

        // Kirim respon HANYA SEKALI di akhir proses try
        return res.status(201).json({ 
            status: 'success', 
            message: 'Data berhasil dicatat' 
        });

    } catch (error) {
        console.error("❌ Error recordWaterLevel:", error);
        // Pastikan tidak mengirim respon jika sudah terkirim (headers sent)
        if (!res.headersSent) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

// 2. Fungsi untuk UI (Menampilkan Level Air Terakhir di Dashboard)
exports.getLatestWaterLevel = async (req, res) => {
    try {
        const { perangkat_id } = req.params;

        const data = await LogTandon.findAll({
            where: { perangkat_id },
            order: [['timestamp', 'DESC']], // Sesuai kolom di PHPMyAdmin kamu
            limit: 10
        });

        if (!data || data.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan.' });
        }

        return res.status(200).json({ status: 'success', data });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.controlPump = async (req, res) => {
    try {
        // Tangkap data yang dikirim dari tombol React
        const { perangkat_id, pompa_type, status } = req.body;

        // Validasi sederhana
        if (!perangkat_id || !pompa_type || status === undefined) {
            return res.status(400).json({ status: 'error', message: 'Data perintah tidak lengkap' });
        }

        // Tentukan kolom mana yang mau diupdate (air atau nutrisi/solenoid)
        const updateData = {};
        if (pompa_type === 'air') {
            updateData.status_pompa_air = status;
        } else if (pompa_type === 'nutrisi') {
            updateData.status_pompa_pupuk = status; // Sesuaikan dengan nama kolom di database kamu
        } else {
            return res.status(400).json({ status: 'error', message: 'Jenis pompa tidak dikenali' });
        }

        // Update ke tabel Perangkat_IoT
        const [updatedRows] = await PerangkatIoT.update(updateData, {
            where: { id: perangkat_id },
            individualHooks: true // Penting: Agar fitur Notifikasi otomatis kamu berjalan!
        });

        if (updatedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Perangkat tidak ditemukan di database' });
        }

        res.status(200).json({ 
            status: 'success', 
            message: `Pompa ${pompa_type} berhasil diubah.` 
        });

    } catch (error) {
        console.error("❌ Error controlPump:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};