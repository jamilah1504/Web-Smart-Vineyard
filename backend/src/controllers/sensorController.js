const { PerangkatIoT, LogSensorTanah, VarietasAnggur, Notification } = require('../models');
const { messaging } = require('../config/firebase');
const sendTelegram = require('../utils/telegram');

exports.receiveSensorData = async (req, res) => {
    try {
        console.log("📩 DATA SENSOR RS485 DARI ESP32:", JSON.stringify(req.body, null, 2));

        const { 
            perangkat_id, 
            kelembapan_val, // <-- GANTI DARI moisture_val
            suhu_val, 
            ec_val, 
            ph_val, 
            n_val, 
            p_val, 
            k_val 
        } = req.body;

        const perangkat = await PerangkatIoT.findByPk(perangkat_id, {
            include: [{ model: VarietasAnggur }]
        });

        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: 'Perangkat tidak dikenali.' });
        }

        // --- SIMPAN KE DATABASE ---
        const newData = await LogSensorTanah.create({
            perangkat_id,
            kelembapan_val: kelembapan_val || 0, // <-- GANTI
            suhu_val: suhu_val || 0,
            ec_val: ec_val || 0,
            ph_val: ph_val || 0,
            n_val: n_val || 0,
            p_val: p_val || 0,
            k_val: k_val || 0
        });

        perangkat.status_koneksi = 'Online';
        perangkat.updatedAt = new Date(); 

        let pesanPeringatan = [];
        let statusKritis = true;

        if (perangkat.Varietas_Anggur) {
            const v = perangkat.Varietas_Anggur;

            // A. Evaluasi Kelembapan (Kontrol Pompa)
            // Menggunakan min_moisture dari DB Varietas (asumsi nama kolom di DB Varietas tetap min_moisture)
            if (kelembapan_val < v.min_moisture) { 
                statusKritis = true;
                pesanPeringatan.push(`Tanah Kering (${kelembapan_val}%)`);
                
                if (perangkat.mode_kerja === 'auto') {
                    perangkat.status_pompa_air = true;
                }
            } else {
                if (perangkat.mode_kerja === 'auto') {
                    perangkat.status_pompa_air = false;
                }
            }

            if (ph_val < v.min_ph || ph_val > v.max_ph) {
                statusKritis = true;
                pesanPeringatan.push(`pH Tidak Ideal (${ph_val})`);
            }
        }

        // --- NOTIFIKASI ---
        if (statusKritis) {
            const namaNode = perangkat.nama_node || `Node ${perangkat_id}`;
            const rincian = pesanPeringatan.join(', ');
            const isiNotif = `Masalah: ${rincian}. [Mode: ${perangkat.mode_kerja.toUpperCase()}]`;

            await Notification.create({ perangkat_id, pesan: isiNotif, tipe: 'warning' });

            const pesanTele = 
                `🚨 *NOTIFIKASI SISTEM AETERA*\n\n` +
                `📍 *Node:* ${namaNode}\n` +
                `💧 *Kelembapan:* ${kelembapan_val}%\n` + // <-- GANTI
                `🧪 *pH Tanah:* ${ph_val}\n` +
                `🛠️ *Pompa:* ${perangkat.status_pompa_air ? "AKTIF ✅" : "MATI ❌"}`;
            
            sendTelegram(pesanTele).catch(e => console.error("Telegram Error:", e.message));
        }

        await perangkat.save();

        res.status(201).json({
            status: 'success',
            mode: perangkat.mode_kerja,
            perintah_pompa: perangkat.status_pompa_air ? "NYALA" : "MATI"
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
            order: [['timestamp', 'DESC']], 
            limit: 10
        });

        res.status(200).json({ status: 'success', data: latestData });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};