const { LogTandon, PerangkatIoT, Notification } = require('../models');
const sendTelegram = require('../utils/telegram');

// Definisikan TINGGI_MAX di luar agar bisa dipakai di semua fungsi jika dibutuhkan
const TINGGI_MAX = 35.0;

// 1. Fungsi untuk Mencatat Ketinggian Air & Proteksi Hardware
exports.recordWaterLevel = async (req, res) => {
    try {
        const { perangkat_id, ketinggian_air, jenis_tandon } = req.body;
        const persentase = (ketinggian_air / TINGGI_MAX) * 100;

        await LogTandon.create({ perangkat_id, ketinggian_air, jenis_tandon });

        // 1. LOGIKA PROTEKSI (Air < 10%)
        if (persentase < 10 && jenis_tandon === 'air') {
            await PerangkatIoT.update(
                { 
                    status_pompa_air: false, 
                    status_pompa_pupuk: false,
                    mode_kerja: 'manual' // Paksa manual agar berhenti
                }, 
                { where: { id: perangkat_id } }
            );
            
            // Kirim notifikasi Telegram
            sendTelegram(`🚨 *ALARM*: Air kritis (${persentase.toFixed(1)}%). Pompa dimatikan!`);
        } 
        
        // 2. LOGIKA RECOVERY (Otomatis kembali ke AUTO jika air sudah cukup, misal > 25%)
        else if (persentase > 25 && jenis_tandon === 'air') {
            const perangkat = await PerangkatIoT.findByPk(perangkat_id);
            // Tambahkan pengecekan aman jika perangkat tidak ditemukan
            if (perangkat && perangkat.mode_kerja === 'manual' && perangkat.status_pompa_air === false) {
                await PerangkatIoT.update(
                    { mode_kerja: 'auto' }, 
                    { where: { id: perangkat_id } }
                );
                sendTelegram(`✅ *INFO*: Air terisi (${persentase.toFixed(1)}%). Sistem kembali ke Mode AUTO.`);
            }
        }

        return res.status(201).json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

// 2. Fungsi untuk UI (Menampilkan Level Air Terakhir di Dashboard)
exports.getLatestWaterLevel = async (req, res) => {
    try {
        const { perangkat_id } = req.params;

        const logs = await LogTandon.findAll({
            where: { perangkat_id },
            order: [['timestamp', 'DESC']], // Pastikan kolom ini sesuai di DB (biasanya createdAt jika bawaan Sequelize)
            limit: 100
        });

        if (!logs || logs.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan.' });
        }

        // ✨ Modifikasi data sebelum dikirim ke frontend untuk menyertakan persentase dan tinggi maks
        const dataWithPercentage = logs.map(log => {
            // Karena data dari Sequelize berbentuk instance, kita ubah ke JSON biasa dulu
            const logJson = log.toJSON(); 
            const persentase = (logJson.ketinggian_air / TINGGI_MAX) * 100;
            
            return {
                ...logJson,
                tinggi_maks: TINGGI_MAX,
                persentase: parseFloat(persentase.toFixed(1)) // membatasi 1 angka di belakang koma (misal: 85.5)
            };
        });

        // Sekarang frontend akan menerima objek yang punya properti tinggi_maks dan persentase
        return res.status(200).json({ status: 'success', data: dataWithPercentage });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.controlPump = async (req, res) => {
    try {
        const { perangkat_id, pompa_type, status } = req.body;

        const updateData = {
            mode_kerja: 'manual' 
        };

        if (pompa_type === 'air') {
            updateData.status_pompa_air = status;
        } else if (pompa_type === 'nutrisi') {
            updateData.status_pompa_pupuk = status;
        }

        await PerangkatIoT.update(updateData, {
            where: { id: perangkat_id },
            individualHooks: true 
        });

        return res.status(200).json({ status: 'success', message: 'Mode manual aktif & status diubah' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};