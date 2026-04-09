const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { LogDiagnosisAI, Notification, PerangkatIoT } = require('../models');
const sendTelegram = require('../utils/telegram');

exports.diagnoseLeaf = async (req, res) => {
    try {
        // --- 1. VALIDASI REQ.BODY (Mencegah Undefined) ---
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error("❌ Error: Body request kosong!");
            return res.status(400).json({ status: 'error', message: 'Server tidak menerima data (Body Empty).' });
        }

        let { perangkat_id, image_base64 } = req.body;

        if (!perangkat_id || !image_base64) {
            return res.status(400).json({ status: 'error', message: 'ID Perangkat atau Gambar tidak ditemukan.' });
        }

        // --- 2. VALIDASI FOREIGN KEY (Cek apakah ID ada di DB) ---
        const perangkat = await PerangkatIoT.findByPk(perangkat_id);
        if (!perangkat) {
            console.error(`❌ Error: Perangkat ID ${perangkat_id} tidak terdaftar di DB!`);
            return res.status(404).json({ 
                status: 'error', 
                message: `Foreign Key Error: ID ${perangkat_id} tidak terdaftar. Pastikan sudah input di tabel perangkat_iot.` 
            });
        }

        // --- 3. PROSES GAMBAR BASE64 ---
        let base64Data = image_base64;
        if (image_base64.includes(",")) {
            base64Data = image_base64.split(",")[1];
        }

        const buffer = Buffer.from(base64Data, 'base64');
        if (buffer.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Format gambar rusak.' });
        }

        // --- 4. SIMPAN GAMBAR FISIK ---
        const fileName = `diag_${perangkat_id}_${Date.now()}.jpg`;
        const dirPath = path.join(__dirname, '../../public/uploads/diagnosis');
        const filePath = path.join(dirPath, fileName);
        const imageUrl = `/public/uploads/diagnosis/${fileName}`;

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(filePath, buffer);

        // --- 5. INTEGRASI ROBOFLOW ---
        const response = await axios({
            method: "POST",
            url: "https://serverless.roboflow.com/daun_anggur-8kryf/1",
            params: { api_key: "XLaeFaRtaO2lzuZIrgrY" },
            data: base64Data, 
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const predictions = response.data.predictions || [];
        
        if (predictions.length === 0) {
            return res.status(200).json({
                status: 'success',
                diagnosis: 'Tidak Terdeteksi',
                confidence: "0%",
                image_url: imageUrl
            });
        }

        const labelPenyakit = predictions[0].class;
        const confidenceScore = predictions[0].confidence;

        // --- 6. SIMPAN LOG KE DATABASE ---
        const logAI = await LogDiagnosisAI.create({
            perangkat_id,
            image_url: imageUrl, 
            hasil_diagnosis: labelPenyakit,
            confidence_score: confidenceScore,
            saran_tindakan: getSaran(labelPenyakit)
        });

        // --- 7. NOTIFIKASI ---
        if (["Isariopsis", "Black Rot", "Esca"].includes(labelPenyakit) && confidenceScore > 0.6) {
            await triggerAlerts(perangkat, labelPenyakit, confidenceScore);
        }

        res.status(200).json({ 
            status: 'success', 
            diagnosis: labelPenyakit, 
            confidence: (confidenceScore * 100).toFixed(2) + "%",
            image_url: imageUrl
        });

    } catch (error) {
        console.error("❌ AI Diagnosis Error:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Fungsi pembantu agar tidak query DB berulang kali
async function triggerAlerts(perangkat, label, confidence) {
    const namaNode = perangkat.nama_node || perangkat.id;
    const pesan = `⚠️ Deteksi ${label} di ${namaNode} (${(confidence * 100).toFixed(1)}%)`;

    await Notification.create({ perangkat_id: perangkat.id, pesan, tipe: 'danger' });
    
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