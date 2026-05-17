const { LogTandon, PerangkatIoT, Notification } = require('../models');
const sendTelegram = require('../utils/telegram');

// 1. Fungsi untuk Mencatat Ketinggian Air & Proteksi Hardware
exports.recordWaterLevel = async (req, res) => {
    try {
        const { perangkat_id, ketinggian_air, jenis_tandon } = req.body;
        const TINGGI_MAX = 42.0;
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
            // Cek apakah saat ini sedang manual karena error sebelumnya
            const perangkat = await PerangkatIoT.findByPk(perangkat_id);
            if (perangkat.mode_kerja === 'manual' && perangkat.status_pompa_air === false) {
                await PerangkatIoT.update(
                    { mode_kerja: 'auto' }, 
                    { where: { id: perangkat_id } }
                );
                sendTelegram(`✅ *INFO*: Air terisi (${persentase.toFixed(1)}%). Sistem kembali ke Mode AUTO.`);
            }
        }

        return res.status(201).json({ status: 'success' });
    } catch (error) {
        // ... error handling
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
        const { perangkat_id, pompa_type, status } = req.body;

        const updateData = {
            // 🌟 SETIAP KLIK TOMBOL, UBAH MODE JADI MANUAL 🌟
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

        res.status(200).json({ status: 'success', message: 'Mode manual aktif & status diubah' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};