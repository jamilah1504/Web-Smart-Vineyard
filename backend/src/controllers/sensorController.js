const { PerangkatIoT, LogSensorTanah, VarietasAnggur, Notification } = require('../models');
const { messaging } = require('../config/firebase');
const sendTelegram = require('../utils/telegram');

exports.receiveSensorData = async (req, res) => {
    try {
        // --- 1. LOG DATA MASUK (DEBUGGING) ---
        console.log("=========================================");
        console.log("📩 DATA SENSOR RS485 DARI ESP32:", JSON.stringify(req.body, null, 2));
        console.log("=========================================");

        const { 
            perangkat_id, 
            moisture_val, 
            suhu_val, 
            ec_val, 
            ph_val, 
            n_val, 
            p_val, 
            k_val 
        } = req.body;

        // --- 2. CARI PERANGKAT & VARIETAS ---
        const perangkat = await PerangkatIoT.findByPk(perangkat_id, {
            include: [{ model: VarietasAnggur }]
        });

        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: 'Perangkat tidak dikenali.' });
        }

        // --- 3. SIMPAN KE DATABASE ---
        // Kolom disesuaikan dengan model LogSensorTanah terbaru
        const newData = await LogSensorTanah.create({
            perangkat_id,
            moisture_val: moisture_val || 0,
            suhu_val: suhu_val || 0, // Pastikan kolom ini ada di model/migrasi
            ec_val: ec_val || 0,
            ph_val: ph_val || 0,
            n_val: n_val || 0,
            p_val: p_val || 0,
            k_val: k_val || 0
        });

        // Update status Online & Timestamp terakhir aktif
        perangkat.status_koneksi = 'Online';
        perangkat.updatedAt = new Date(); 

        // --- 4. LOGIKA EVALUASI (OTAK PINTAR) ---
        let pesanPeringatan = [];
        let statusKritis = false;

        if (perangkat.Varietas_Anggur) {
            const v = perangkat.Varietas_Anggur;

            // A. Evaluasi Kelembapan (Kontrol Pompa)
            if (moisture_val < v.min_moisture) {
                statusKritis = true;
                pesanPeringatan.push(`Tanah Kering (${moisture_val}%)`);
                
                if (perangkat.mode_kerja === 'auto') {
                    perangkat.status_pompa_air = true;
                }
            } else {
                if (perangkat.mode_kerja === 'auto') {
                    perangkat.status_pompa_air = false;
                }
            }

            // B. Evaluasi pH
            if (ph_val < v.min_ph || ph_val > v.max_ph) {
                statusKritis = true;
                pesanPeringatan.push(`pH Tidak Ideal (${ph_val})`);
            }
            
            // C. Evaluasi Nutrisi NPK (Opsional - Contoh Peringatan)
            if (n_val < v.min_n) {
                pesanPeringatan.push(`Nitrogen Rendah (${n_val} mg/kg)`);
            }
        }

        // --- 5. NOTIFIKASI MULTI-CHANNEL ---
        if (statusKritis) {
            const namaNode = perangkat.nama_node || `Node ${perangkat_id}`;
            const rincian = pesanPeringatan.join(', ');
            const isiNotif = `Masalah: ${rincian}. [Mode: ${perangkat.mode_kerja.toUpperCase()}]`;

            // 1. Web Notification (MySQL)
            await Notification.create({ 
                perangkat_id, 
                pesan: isiNotif, 
                tipe: 'warning' 
            });

            // 2. Firebase Push (HP)
            const fcmPayload = {
                notification: { title: `⚠️ Alert Kebun: ${namaNode}`, body: isiNotif },
                topic: 'pemilik_kebun'
            };
            messaging.send(fcmPayload).catch(e => console.error("Firebase Error:", e.message));

            // 3. Telegram Bot
            const pesanTele = 
                `🚨 *NOTIFIKASI SISTEM AETERA*\n\n` +
                `📍 *Node:* ${namaNode}\n` +
                `❗ *Status:* KRITIS\n` +
                `📝 *Detail:* ${rincian}\n` +
                `💧 *Kelembapan:* ${moisture_val}%\n` +
                `🧪 *pH Tanah:* ${ph_val}\n` +
                `⚡ *EC:* ${ec_val} us/cm\n` +
                `🌡️ *Suhu Tanah:* ${suhu_val} °C\n\n` +
                `🛠️ *Pompa:* ${perangkat.status_pompa_air ? "AKTIF ✅" : "MATI ❌"}\n` +
                `📊 _Data NPK: ${n_val}-${p_val}-${k_val}_`;
            
            sendTelegram(pesanTele).catch(e => console.error("Telegram Error:", e.message));
        }

        // Simpan semua perubahan status ke DB
        await perangkat.save();

        // --- 6. RESPONSE BALIK KE ESP32 ---
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
            order: [['timestamp', 'DESC']], 
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