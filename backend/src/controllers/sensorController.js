const { PerangkatIoT, LogSensorTanah, VarietasAnggur, Notification } = require('../models');
const { messaging } = require('../config/firebase');

exports.receiveSensorData = async (req, res) => {
    try {
        // --- 1. LOG DATA MASUK (DEBUGGING) ---
        console.log("=========================================");
        console.log("📩 DATA DARI ESP32:", JSON.stringify(req.body, null, 2));
        console.log("=========================================");

        const { perangkat_id, n_val, p_val, k_val, ph_val, moisture_val } = req.body;

        // --- 2. CARI PERANGKAT & VARIETAS ---
        const perangkat = await PerangkatIoT.findByPk(perangkat_id, {
            include: [{ model: VarietasAnggur }]
        });

        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: 'Perangkat tidak dikenali.' });
        }

        // --- 3. SIMPAN LOG SENSOR KE DATABASE ---
        const newData = await LogSensorTanah.create({
            perangkat_id,
            n_val: n_val || 0,
            p_val: p_val || 0,
            k_val: k_val || 0,
            ph_val: ph_val || 0,
            moisture_val: moisture_val || 0
        });

        // Update status perangkat jadi Online setiap kali kirim data
        perangkat.status_koneksi = 'Online';

        // --- 4. LOGIKA EVALUASI (OTAK PINTAR) ---
        let pesanPeringatan = [];
        let statusKritis = false;

        if (perangkat.Varietas_Anggur) {
            const v = perangkat.Varietas_Anggur;

            // Cek Kelembapan
            if (moisture_val < v.min_moisture) {
                statusKritis = true;
                pesanPeringatan.push(`Tanah Kering (${moisture_val}%)`);
                
                // LOGIKA POMPA: Hanya berubah jika MODE AUTO
                if (perangkat.mode_kerja === 'auto') {
                    perangkat.status_pompa_air = true;
                }
            } else {
                // Jika sudah cukup lembap dan mode auto, matikan pompa
                if (perangkat.mode_kerja === 'auto') {
                    perangkat.status_pompa_air = false;
                }
            }

            // Cek pH (Hanya untuk peringatan, tidak kontrol pompa)
            if (ph_val < v.min_ph || ph_val > v.max_ph) {
                statusKritis = true;
                pesanPeringatan.push(`pH Tidak Ideal (${ph_val})`);
            }

            // --- 5. KIRIM NOTIFIKASI JIKA ADA MASALAH ---
            if (statusKritis) {
                const judulNotif = `⚠️ Alert: ${perangkat.nama_node}`;
                const isiNotif = `Masalah: ${pesanPeringatan.join(', ')}. [Mode: ${perangkat.mode_kerja.toUpperCase()}]`;

                // A. Simpan ke Tabel Notification (Untuk Web)
                await Notification.create({
                    perangkat_id,
                    pesan: isiNotif,
                    tipe: 'warning'
                });

                // B. Kirim ke Firebase (Push Notification HP)
                const payload = {
                    notification: { title: judulNotif, body: isiNotif },
                    topic: 'pemilik_kebun'
                };
                messaging.send(payload).catch(err => console.error("Firebase Error:", err));
            }
        }

        // Simpan semua perubahan status (pompa & koneksi) ke database
        await perangkat.save();

        // --- 6. BALAS KE ESP32 ---
        res.status(201).json({
            status: 'success',
            mode: perangkat.mode_kerja,
            perintah_pompa: perangkat.status_pompa_air ? "NYALA" : "MATI",
            pesan: pesanPeringatan.length > 0 ? pesanPeringatan.join(', ') : "Kondisi Ideal"
        });

    } catch (error) {
        console.error("❌ Error receiveSensorData:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getLatestSensorData = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        
        const latestData = await LogSensorTanah.findAll({
            where: { perangkat_id },
            order: [['timestamp', 'DESC']], // Pastikan kolom namanya 'timestamp' sesuai modelmu
            limit: 10
        });

        res.status(200).json({
            status: 'success',
            data: latestData
        });
    } catch (error) {
        console.error("❌ Error getLatestSensorData:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};