const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { LogDiagnosisAI, Notification, PerangkatIoT } = require('../models');
const { messaging } = require('../config/firebase');

/**
 * @desc    Proses Deteksi via Roboflow + Simpan Gambar Fisik + Notifikasi Otomatis
 */
exports.diagnoseLeaf = async (req, res) => {
    try {
        let { perangkat_id, image_base64 } = req.body;

        // 1. Validasi Input
        if (!perangkat_id || !image_base64) {
            return res.status(400).json({ status: 'error', message: 'Data tidak lengkap.' });
        }

        // 2. Pembersihan String Base64
        if (image_base64.includes(",")) {
            image_base64 = image_base64.split(",")[1];
        }
        const cleanBase64 = image_base64.replace(/(\r\n|\n|\r)/gm, "").replace(/\s/g, '');

        // 3. Simpan Gambar ke Folder Server
        const fileName = `diag_${perangkat_id}_${Date.now()}.jpg`;
        const dirPath = path.join(__dirname, '../../public/uploads/diagnosis');
        const filePath = path.join(dirPath, fileName);
        const imageUrl = `/public/uploads/diagnosis/${fileName}`;

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(filePath, cleanBase64, 'base64');

        // 4. Kirim ke Roboflow API
        const response = await axios({
            method: "POST",
            url: "https://serverless.roboflow.com/daun_anggur-8kryf/1",
            params: { api_key: "XLaeFaRtaO2lzuZIrgrY" },
            data: cleanBase64, 
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const predictions = response.data.predictions || [];
        let labelPenyakit = "Sehat";
        let confidenceScore = 0;

        if (predictions && predictions.length > 0) {
            labelPenyakit = predictions[0].class;
            confidenceScore = predictions[0].confidence;
        }

        // 5. Simpan ke Database MySQL
        const logAI = await LogDiagnosisAI.create({
            perangkat_id,
            image_url: imageUrl, 
            hasil_diagnosis: labelPenyakit,
            confidence_score: confidenceScore,
            saran_tindakan: getSaran(labelPenyakit)
        });

        // --- 6. LOGIKA NOTIFIKASI PENYAKIT SERIUS ---
        const daftarPenyakitSerius = ["Isariopsis", "Black Rot", "Esca"];
        
        if (daftarPenyakitSerius.includes(labelPenyakit) && confidenceScore > 0.6) {
            const perangkat = await PerangkatIoT.findByPk(perangkat_id);
            const namaNode = perangkat ? perangkat.nama_node : `Node ${perangkat_id}`;
            
            const pesanNotif = `⚠️ BAHAYA: Terdeteksi ${labelPenyakit} pada ${namaNode}. Akurasi: ${(confidenceScore * 100).toFixed(1)}%. Segera lakukan tindakan!`;

            // A. Simpan Notifikasi ke Database (Dashboard Web)
            await Notification.create({
                perangkat_id,
                pesan: pesanNotif,
                tipe: 'danger'
            });

            // B. Kirim Push Notification via Firebase (HP Owner)
            const payload = {
                notification: {
                    title: `Penyakit Terdeteksi! (${labelPenyakit})`,
                    body: pesanNotif
                },
                topic: 'pemilik_kebun' // Pastikan owner subscribe ke topic ini
            };

            messaging.send(payload)
                .then(() => console.log("🔔 Notif AI terkirim ke Firebase"))
                .catch(err => console.error("❌ Gagal kirim Firebase:", err));
        }

        res.status(200).json({ 
            status: 'success', 
            diagnosis: labelPenyakit, 
            confidence: (confidenceScore * 100).toFixed(2) + "%",
            image_url: imageUrl,
            data: logAI 
        });

    } catch (error) {
        console.error("❌ AI Diagnosis Error:", error.message);
        res.status(500).json({ status: 'error', message: "Gagal memproses AI" });
    }
};

// --- Fungsi Pendukung ---
function getSaran(label) {
    const daftarSaran = {
        "Klorosis": "Penyebab: Kurang hara/pH tanah tidak stabil. Saran: Berikan pupuk mikro dan cek pH tanah.",
        "Isariopsis": "Penyebab: Jamur. Saran: Segera semprotkan fungisida kontak dan kurangi kelembapan.",
        "Sehat": "Tanaman dalam kondisi prima! Pertahankan perawatan rutin.",
        "Black Rot": "Penyebab: Infeksi jamur. Saran: Buang daun terinfeksi dan gunakan fungisida sistemik.",
        "Esca": "Penyebab: Jamur pada batang. Saran: Lakukan pemangkasan pada bagian yang sakit."
    };
    return daftarSaran[label] || "Lakukan observasi visual lebih lanjut.";
}

// 1. Ambil Hasil Diagnosis Terakhir
exports.getLatestDiagnosis = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        const data = await LogDiagnosisAI.findOne({
            where: { perangkat_id },
            order: [['createdAt', 'DESC']]
        });

        if (!data) {
            return res.status(404).json({ status: 'error', message: 'Belum ada riwayat diagnosis.' });
        }

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// 2. Ambil Semua Riwayat Diagnosis (Untuk Tabel/Grafik)
exports.getDiagnosisHistory = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        const history = await LogDiagnosisAI.findAll({
            where: { perangkat_id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.status(200).json({ status: 'success', data: history });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};