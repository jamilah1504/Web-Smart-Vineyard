const { PerangkatIoT, LogSensorTanah, LogTandon, VarietasAnggur, Notification } = require('../models');
const sendTelegram = require('../utils/telegram');

exports.receiveAllData = async (req, res) => {
    try {
        console.log("📩 DATA MASUK DARI ESP32:", JSON.stringify(req.body, null, 2));

        const { 
            perangkat_id, 
            kelembapan_tanah,  // Sebelumnya: kelembapan_val
            suhu_tanah,        // Sebelumnya: suhu_val
            ec,                // Sebelumnya: ec_val
            ph_tanah,          // Sebelumnya: ph_val
            nitrogen,          // Sebelumnya: n_val
            fosfor,            // Sebelumnya: p_val
            kalium,            // Sebelumnya: k_val
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
        // 🌟 PERBAIKAN 2: Masukkan variabel dari ESP32 ke dalam nama kolom tabel database
        await LogSensorTanah.create({
            perangkat_id: perangkat_id,
            kelembapan_val: kelembapan_tanah || 0,
            suhu_val: suhu_tanah || 0,
            ec_val: ec || 0,
            ph_val: ph_tanah || 0,
            n_val: nitrogen || 0,
            p_val: fosfor || 0,
            k_val: kalium || 0
        });

        // --- 2. SIMPAN DATA TANDON ---
        if (ketinggian_air !== undefined && ketinggian_air !== null) {
            try {
                await LogTandon.create({ 
                    perangkat_id, 
                    ketinggian_air: parseFloat(ketinggian_air), 
                    jenis_tandon: jenis_tandon || 'air' 
                });
                console.log("✅ Data Tandon Berhasil Disimpan");
            } catch (dbError) {
                console.error("❌ Gagal Simpan Tandon:", dbError.message);
            }
        } else {
            console.log("⚠️ Data ketinggian_air tidak terdeteksi di request body");
        }

        // --- 3. LOGIKA EVALUASI & SAFETY ---
        let pesanPeringatan = [];
        let statusKritis = false;
        perangkat.status_koneksi = 'Online';

        // A. Safety Check: Air Tandon Kritis (< 10%)
        if (ketinggian_air < 10) {
            statusKritis = true;
            perangkat.status_pompa_air = false; // Matikan paksa demi keamanan hardware
            pesanPeringatan.push("Darurat! Air Tandon Kritis (<10%)");
        } 
        // B. Evaluasi Kelembapan Tanah (Hanya jika air tandon aman)
        else if (perangkat.Varietas_Anggur) {
            const v = perangkat.Varietas_Anggur;
            // 🌟 PERBAIKAN 3: Evaluasi menggunakan variabel kelembapan_tanah
            if (kelembapan_tanah < v.min_moisture) {
                statusKritis = true;
                pesanPeringatan.push(`Tanah Kering (${kelembapan_tanah}%)`);
                if (perangkat.mode_kerja === 'auto') perangkat.status_pompa_air = true;
            } else {
                if (perangkat.mode_kerja === 'auto') perangkat.status_pompa_air = false;
            }
        }

        // --- 4. KIRIM NOTIFIKASI ---
        if (statusKritis) {
            const isiNotif = pesanPeringatan.join(' & ');
            await Notification.create({ perangkat_id, pesan: isiNotif, tipe: 'warning' });
            sendTelegram(`🚨 *AETERA ALERT*\n\n📍 Node: ${perangkat_id}\n⚠️ Masalah: ${isiNotif}`).catch(e => {});
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
        const requestedLimit = parseInt(req.query.limit, 10);
        const limit = Number.isFinite(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 2000)
            : 500;

        const where = { perangkat_id };

        const [latestData, total] = await Promise.all([
            LogSensorTanah.findAll({
                where,
                order: [['timestamp', 'DESC']],
                limit,
            }),
            LogSensorTanah.count({ where }),
        ]);

        res.status(200).json({
            status: 'success',
            data: latestData,
            total,
            limit,
            returned: latestData.length,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getLatestWaterLevel = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        // 🌟 PERBAIKAN 4: Mengganti log_tandon (typo) menjadi LogTandon sesuai nama model
        const data = await LogTandon.findAll({ 
            where: { perangkat_id },
            order: [['createdAt', 'DESC']], 
            limit: 20 
        });

        res.status(200).json({ status: 'success', data: data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};