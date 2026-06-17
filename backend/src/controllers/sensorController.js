// ========================================================================
// 📁 controllers/sensorController.js — VERSI PERBAIKAN
// Semua notif Telegram kini melewati cooldown 5 menit via helper terpusat
// ========================================================================

const { PerangkatIoT, LogSensorTanah, LogTandon, VarietasAnggur } = require('../models');
const { sendNotificationWithCooldown } = require('../utils/notificationHelper');

exports.receiveAllData = async (req, res) => {
    try {
        console.log("📩 DATA MASUK DARI ESP32:", JSON.stringify(req.body, null, 2));

        const {
            perangkat_id,
            kelembapan_tanah,
            suhu_tanah,
            ec,
            ph_tanah,
            nitrogen,
            fosfor,
            kalium,
            ketinggian_air,
            jenis_tandon
        } = req.body;

        const perangkat = await PerangkatIoT.findByPk(perangkat_id, {
            include: [{ model: VarietasAnggur }]
        });

        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: 'Perangkat tidak dikenali.' });
        }

        // --- 1. SIMPAN DATA SENSOR TANAH ---
        await LogSensorTanah.create({
            perangkat_id,
            kelembapan_val: kelembapan_tanah || 0,
            suhu_val:       suhu_tanah       || 0,
            ec_val:         ec               || 0,
            ph_val:         ph_tanah         || 0,
            n_val:          nitrogen         || 0,
            p_val:          fosfor           || 0,
            k_val:          kalium           || 0
        });

        // --- 2. SIMPAN DATA TANDON ---
        if (ketinggian_air !== undefined && ketinggian_air !== null) {
            try {
                await LogTandon.create({
                    perangkat_id,
                    ketinggian_air: parseFloat(ketinggian_air),
                    jenis_tandon:   jenis_tandon || 'air'
                });
                console.log("✅ Data Tandon Berhasil Disimpan");
            } catch (dbError) {
                console.error("❌ Gagal Simpan Tandon:", dbError.message);
            }
        } else {
            console.log("⚠️ Data ketinggian_air tidak terdeteksi di request body");
        }

        // --- 3. LOGIKA EVALUASI & SAFETY ---
        perangkat.status_koneksi = 'Online';

        // A. Safety Check: Air Tandon Kritis (< 10 cm)
        if (ketinggian_air < 10) {
            perangkat.status_pompa_air = false;

            // ✅ PERBAIKAN: pakai cooldown, tidak spam lagi
            await sendNotificationWithCooldown({
                perangkat_id,
                pesanDB:       `🚨 ALARM: Air Tandon Kritis (${ketinggian_air} cm). Pompa dimatikan otomatis!`,
                pesanTelegram: `🚨 *AETERA ALERT*\n\n📍 Node: ${perangkat_id}\n⚠️ Masalah: *Darurat! Air Tandon Kritis (<10 cm)*`
            });

        }
        // B. Evaluasi Kelembapan Tanah (hanya jika air tandon aman)
        else if (perangkat.Varietas_Anggur) {
            const v           = perangkat.Varietas_Anggur;
            const minMoisture = v.min_moisture || 40.0;

            if (kelembapan_tanah < minMoisture) {
                if (perangkat.mode_kerja === 'auto') perangkat.status_pompa_air = true;

                // ✅ PERBAIKAN: pakai cooldown, tidak spam lagi
                await sendNotificationWithCooldown({
                    perangkat_id,
                    pesanDB:       `⚠️ ALERT: Tanah Kering (${kelembapan_tanah}%). Kelembapan di bawah batas minimum (${minMoisture}%).`,
                    pesanTelegram: `🚨 *AETERA ALERT*\n\n📍 Node: ${perangkat_id}\n⚠️ Masalah: *Tanah Kering (${kelembapan_tanah}%)*\nBatas minimum: ${minMoisture}%`
                });

            } else {
                if (perangkat.mode_kerja === 'auto') perangkat.status_pompa_air = false;
            }
        }

        await perangkat.save();

        res.status(201).json({
            status: 'success',
            perintah_pompa: perangkat.status_pompa_air ? "NYALA" : "MATI"
        });

    } catch (error) {
        console.error("❌ Error receiveAllData:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getLatestSensorData = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        const latestData = await LogSensorTanah.findAll({
            where: { perangkat_id },
            order: [['timestamp', 'DESC']],
            limit: 100
        });
        res.status(200).json({ status: 'success', data: latestData });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getLatestWaterLevel = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        const data = await LogTandon.findAll({
            where: { perangkat_id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};