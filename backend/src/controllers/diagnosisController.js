const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { LogDiagnosisAI, Notification, PerangkatIoT } = require('../models');
const { messaging } = require('../config/firebase');
const sendTelegram = require('../utils/telegram');

exports.diagnoseLeaf = async (req, res) => {
    try {
        let { perangkat_id, image_base64 } = req.body;

        // 1. Validasi Input Dasar
        if (!perangkat_id || !image_base64) {
            return res.status(400).json({ status: 'error', message: 'Data/Gambar tidak lengkap.' });
        }

        // 2. Pembersihan String Base64 (Menangani prefix dari browser)
        let base64Data = image_base64;
        if (image_base64.includes(",")) {
            base64Data = image_base64.split(",")[1];
        }

        // 3. Validasi: Apakah ini benar-benar data gambar?
        const buffer = Buffer.from(base64Data, 'base64');
        if (buffer.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Format gambar rusak.' });
        }

        // 4. Simpan Gambar secara Fisik
        const fileName = `diag_${perangkat_id}_${Date.now()}.jpg`;
        const dirPath = path.join(__dirname, '../../public/uploads/diagnosis');
        const filePath = path.join(dirPath, fileName);
        const imageUrl = `/public/uploads/diagnosis/${fileName}`;

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(filePath, buffer);

        // 5. Integrasi ke Roboflow
        // Kita gunakan format base64 yang sudah bersih untuk dikirim ke Roboflow
        const response = await axios({
            method: "POST",
            url: "https://serverless.roboflow.com/daun_anggur-8kryf/1",
            params: { api_key: "XLaeFaRtaO2lzuZIrgrY" },
            data: base64Data, 
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const predictions = response.data.predictions || [];
        
        // VALIDASI: Apakah Roboflow mengenali objek?
        if (predictions.length === 0) {
            return res.status(200).json({
                status: 'success',
                diagnosis: 'Tidak Terdeteksi',
                confidence: "0%",
                message: 'AI tidak menemukan objek daun anggur yang jelas.',
                image_url: imageUrl
            });
        }

        const labelPenyakit = predictions[0].class;
        const confidenceScore = predictions[0].confidence;

        // 6. Simpan Hasil ke Database
        const logAI = await LogDiagnosisAI.create({
            perangkat_id,
            image_url: imageUrl, 
            hasil_diagnosis: labelPenyakit,
            confidence_score: confidenceScore,
            saran_tindakan: getSaran(labelPenyakit)
        });

        // 7. Logika Notifikasi Multi-Channel
        if (["Isariopsis", "Black Rot", "Esca"].includes(labelPenyakit) && confidenceScore > 0.6) {
            await triggerAlerts(perangkat_id, labelPenyakit, confidenceScore);
        }

        // 8. Kirim Response Balik ke Frontend
        res.status(200).json({ 
            status: 'success', 
            diagnosis: labelPenyakit, 
            confidence: (confidenceScore * 100).toFixed(2) + "%",
            image_url: imageUrl,
            data: logAI // Data ini akan digunakan Frontend untuk update state
        });

    } catch (error) {
        console.error("❌ AI Diagnosis Error:", error.message);
        res.status(500).json({ status: 'error', message: "Gagal memproses AI: " + error.message });
    }
};

// Fungsi pembantu agar kode lebih bersih
async function triggerAlerts(perangkat_id, label, confidence) {
    const perangkat = await PerangkatIoT.findByPk(perangkat_id);
    const namaNode = perangkat ? perangkat.nama_node : perangkat_id;
    const pesan = `⚠️ Deteksi ${label} di ${namaNode} (${(confidence * 100).toFixed(1)}%)`;

    // Web Notification
    await Notification.create({ perangkat_id, pesan, tipe: 'danger' });
    
    // Telegram
    sendTelegram(`🌿 *AI ALERT*\n\nTerdeteksi: *${label}*\nLokasi: ${namaNode}`).catch(() => {});
}

function getSaran(label) {
    const daftarSaran = {
        "Klorosis": "Kurang hara/pH tanah tidak stabil. Berikan pupuk mikro.",
        "Isariopsis": "Jamur. Semprot fungisida kontak dan kurangi kelembapan.",
        "Sehat": "Tanaman prima! Lanjutkan perawatan rutin.",
        "Black Rot": "Infeksi jamur. Buang daun terinfeksi, gunakan fungisida sistemik.",
        "Esca": "Jamur batang. Lakukan pemangkasan pada bagian sakit."
    };
    return daftarSaran[label] || "Lakukan observasi visual lebih lanjut.";
}

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