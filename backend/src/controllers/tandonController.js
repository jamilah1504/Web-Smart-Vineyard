// ========================================================================
// 📁 controllers/tandonController.js — VERSI PERBAIKAN
// Semua notif Telegram kini melewati cooldown 5 menit via helper terpusat
// ========================================================================

const { LogTandon, PerangkatIoT } = require('../models');
const { sendNotificationWithCooldown } = require('../utils/notificationHelper');

const TINGGI_MAX = 34.87;

// 1. Mencatat Ketinggian Air & Proteksi Hardware
exports.recordWaterLevel = async (req, res) => {
    try {
        const { perangkat_id, ketinggian_air, jenis_tandon } = req.body;
        const persentase = (ketinggian_air / TINGGI_MAX) * 100;

        await LogTandon.create({ perangkat_id, ketinggian_air, jenis_tandon });

        // LOGIKA PROTEKSI: Air < 10% → matikan pompa, paksa manual
        if (persentase < 10 && jenis_tandon === 'air') {
            await PerangkatIoT.update(
                { status_pompa_air: false, status_pompa_pupuk: false, mode_kerja: 'manual' },
                { where: { id: perangkat_id } }
            );

            // ✅ PERBAIKAN: pakai cooldown, tidak spam lagi
            await sendNotificationWithCooldown({
                perangkat_id,
                pesanDB:       `🚨 ALARM: Air kritis (${persentase.toFixed(1)}%). Pompa dimatikan otomatis oleh sistem!`,
                pesanTelegram: `🚨 *ALARM*: Air kritis (${persentase.toFixed(1)}%). Pompa dimatikan!`
            });
        }

        // LOGIKA RECOVERY: Air > 25% & sempat manual → kembalikan ke auto
        else if (persentase > 25 && jenis_tandon === 'air') {
            const perangkat = await PerangkatIoT.findByPk(perangkat_id);

            if (perangkat && perangkat.mode_kerja === 'manual' && perangkat.status_pompa_air === false) {
                await PerangkatIoT.update({ mode_kerja: 'auto' }, { where: { id: perangkat_id } });

                // ✅ PERBAIKAN: pakai cooldown
                await sendNotificationWithCooldown({
                    perangkat_id,
                    pesanDB:       `✅ INFO: Air terisi (${persentase.toFixed(1)}%). Sistem kembali ke Mode AUTO.`,
                    pesanTelegram: `✅ *INFO*: Air terisi (${persentase.toFixed(1)}%). Sistem kembali ke Mode AUTO.`
                });
            }
        }

        return res.status(201).json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

// 2. Menampilkan Level Air Terakhir di Dashboard
exports.getLatestWaterLevel = async (req, res) => {
    try {
        const { perangkat_id } = req.params;

        const logs = await LogTandon.findAll({
            where: { perangkat_id },
            order: [['timestamp', 'DESC']],
            limit: 100
        });

        if (!logs || logs.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan.' });
        }

        const dataWithPercentage = logs.map(log => {
            const logJson    = log.toJSON();
            const persentase = (logJson.ketinggian_air / TINGGI_MAX) * 100;
            return {
                ...logJson,
                tinggi_maks: TINGGI_MAX,
                persentase:  parseFloat(persentase.toFixed(1))
            };
        });

        return res.status(200).json({ status: 'success', data: dataWithPercentage });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

// 3. Kontrol Pompa Manual
exports.controlPump = async (req, res) => {
    try {
        const { perangkat_id, pompa_type, status } = req.body;

        const updateData = { mode_kerja: 'manual' };

        if (pompa_type === 'air')     updateData.status_pompa_air   = status;
        else if (pompa_type === 'nutrisi') updateData.status_pompa_pupuk = status;

        await PerangkatIoT.update(updateData, {
            where: { id: perangkat_id },
            individualHooks: true
        });

        return res.status(200).json({ status: 'success', message: 'Mode manual aktif & status diubah' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};