const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { LogDiagnosisAI, Notification, PerangkatIoT } = require('../models');
const sendTelegram = require('../utils/telegram');

exports.diagnoseLeaf = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: 'error', message: 'Body request kosong.' });
        }

        let { perangkat_id, image_base64, hasil_diagnosis, confidence_score } = req.body;

        const perangkat = await PerangkatIoT.findByPk(perangkat_id);
        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: `Perangkat ID ${perangkat_id} tidak terdaftar.` });
        }

        let base64Data = image_base64.includes(",") ? image_base64.split(",")[1] : image_base64;
        const buffer = Buffer.from(base64Data, 'base64');

        let finalLabel = hasil_diagnosis;
        let finalScore = confidence_score;

        // 1. Ambil data dari Roboflow jika dari Web
        if (!finalLabel) {
            try {
                const response = await axios({
                    method: "POST",
                    url: "https://serverless.roboflow.com/daun_anggur-8kryf/1",
                    params: { api_key: "XLaeFaRtaO2lzuZIrgrY" },
                    data: base64Data, 
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                });

                const predictions = response.data.predictions || [];
                if (predictions.length > 0) {
                    finalLabel = predictions[0].class;
                    finalScore = predictions[0].confidence;
                } else {
                    finalLabel = "Tidak Terdeteksi";
                    finalScore = 0;
                }
            } catch (error) {
                return res.status(502).json({ status: 'error', message: 'AI Server Error' });
            }
        }

        // --- 2. LOGIKA FILTERING KEYWORD ---
        const labelRaw = finalLabel ? String(finalLabel).toUpperCase() : "";
        
        const isHealthy    = labelRaw.includes("HEALTHY") || labelRaw.includes("SEHAT");
        const isEsca       = labelRaw.includes("ESCA");
        const isBlackRot   = labelRaw.includes("BLACK");
        const isIsariopsis = labelRaw.includes("ISARIOPSIS");
        const isBlight     = labelRaw.includes("BLIGHT");
        const isKlorosis   = labelRaw.includes("KLOROSIS");

        const isValidLeaf = isHealthy || isEsca || isBlackRot || isIsariopsis || isBlight || isKlorosis;

        console.log(`🔍 DEBUG: Raw="${finalLabel}", Valid=${isValidLeaf}, Score=${finalScore}`);

        // Validasi Jenis Objek
        if (!isValidLeaf) {
            return res.status(200).json({ 
                status: 'invalid', 
                message: `Objek terdeteksi (${finalLabel}) bukan daun anggur terdaftar.`,
                diagnosis: finalLabel
            });
        }

        // --- VALIDASI AKURASI (> 70%) ---
        // Jika akurasi <= 0.7, hentikan proses (jangan simpan ke DB/Folder)
        if (finalScore <= 0.7) {
            return res.status(200).json({ 
                status: 'invalid', 
                message: `Hasil analisis (${(finalScore * 100).toFixed(1)}%) di bawah standar akurasi 70%. Silakan ambil foto ulang.`,
                diagnosis: finalLabel,
                confidence: (finalScore * 100).toFixed(2) + "%"
            });
        }

        // --- 3. SIMPAN GAMBAR FISIK ---
        // Hanya dijalankan jika lolos validasi daun & akurasi > 70%
        const fileName = `diag_${perangkat_id}_${Date.now()}.jpg`;
        const dirPath = path.join(__dirname, '../../public/uploads/diagnosis');
        const imageUrl = `/public/uploads/diagnosis/${fileName}`;

        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(path.join(dirPath, fileName), buffer);

        // --- 4. SIMPAN KE DATABASE ---
        const logAI = await LogDiagnosisAI.create({
            perangkat_id,
            image_url: imageUrl, 
            hasil_diagnosis: finalLabel,
            confidence_score: finalScore,
            saran_tindakan: getSaran(finalLabel)
        });

        // --- 5. NOTIFIKASI ---
        if ((isEsca || isBlackRot || isIsariopsis || isBlight) && finalScore > 0.7) {
            await triggerAlerts(perangkat, finalLabel, finalScore);
        }

        res.status(201).json({ 
            status: 'success', 
            diagnosis: finalLabel, 
            confidence: (finalScore * 100).toFixed(2) + "%",
            image_url: imageUrl,
            data: logAI
        });

    } catch (error) {
        console.error("❌ Error Global:", error.message);
        if (!res.headersSent) res.status(500).json({ status: 'error', message: error.message });
    }
};

function getSaran(label) {
    const raw = String(label).toUpperCase();
    if (raw.includes("ESCA")) return "Terdeteksi Jamur Esca. Segera pangkas bagian yang terinfeksi dan bakar sisa pangkasan.";
    if (raw.includes("HEALTHY") || raw.includes("SEHAT")) return "Daun dalam kondisi prima. Pertahankan kelembapan tanah di angka 60-70%.";
    if (raw.includes("BLACK")) return "Infeksi Black Rot terdeteksi. Gunakan fungisida berbahan aktif Mankozeb.";
    if (raw.includes("ISARIOPSIS")) return "Terdeteksi Isariopsis. Perbaiki sirkulasi udara di sekitar tajuk tanaman.";
    if (raw.includes("BLIGHT")) return "Hawar daun terdeteksi. Hindari menyiram bagian daun di sore hari.";
    return "Lakukan observasi visual lebih lanjut.";
}

async function triggerAlerts(perangkat, label, confidence) {
    try {
        const namaNode = perangkat.nama_node || perangkat.id;
        const pesan = `⚠️ Deteksi ${label} di ${namaNode} (${(confidence * 100).toFixed(1)}%)`;
        await Notification.create({ perangkat_id: perangkat.id, pesan, tipe: 'danger' });
        sendTelegram(`🌿 *AI ALERT*\n\nTerdeteksi: *${label}*\nLokasi: ${namaNode}`).catch(() => {});
    } catch (err) {
        console.error("⚠️ Gagal kirim notif:", err.message);
    }
}

exports.getLatestDiagnosis = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        const data = await LogDiagnosisAI.findOne({
            where: { perangkat_id },
            order: [['createdAt', 'DESC']]
        });
        if (!data) return res.status(404).json({ status: 'error', message: 'Belum ada riwayat.' });
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