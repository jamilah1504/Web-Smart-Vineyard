// ========================================================================
// 📁 controllers/aiController.js — VERSI PERBAIKAN
// Notif penyakit daun kini melewati cooldown via helper terpusat
// ========================================================================

const axios    = require("axios");
const fs       = require("fs");
const path     = require("path");
const { LogDiagnosisAI, PerangkatIoT } = require('../models');
const { sendNotificationWithCooldown }  = require('../utils/notificationHelper');

exports.diagnoseLeaf = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: 'error', message: 'Body request kosong atau file tidak terbaca.' });
        }

        let perangkat_id = "ESP32-MAC-A001";
        let base64Data   = "";
        let finalLabel   = "";
        let finalScore   = 0;

        // CEK SUMBER DATA: Dari ESP32-CAM (Buffer) atau Web (JSON)?
        if (Buffer.isBuffer(req.body)) {
            console.log("📸 [KAMERA] Menerima gambar mentah langsung dari ESP32-CAM!");
            base64Data = req.body.toString('base64');
            if (req.headers['x-device-id']) perangkat_id = req.headers['x-device-id'];
        } else {
            console.log("💻 [WEB] Menerima request deteksi dari Web Dashboard");
            perangkat_id = req.body.perangkat_id || perangkat_id;
            finalLabel   = req.body.hasil_diagnosis;
            finalScore   = req.body.confidence_score;
            base64Data   = req.body.image_base64.includes(",")
                ? req.body.image_base64.split(",")[1]
                : req.body.image_base64;
        }

        const bufferImage = Buffer.from(base64Data, 'base64');

        // Validasi Perangkat
        const perangkat = await PerangkatIoT.findByPk(perangkat_id);
        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: `Perangkat ID ${perangkat_id} tidak terdaftar.` });
        }

        // --- 1. AMBIL DATA DARI ROBOFLOW ---
        if (!finalLabel) {
            console.log("⏳ Mengirim foto ke AI Roboflow untuk dianalisis...");
            try {
                const response = await axios({
                    method:  "POST",
                    url:     "https://serverless.roboflow.com/daun_anggur-8kryf/1",
                    params:  { api_key: "XLaeFaRtaO2lzuZIrgrY" },
                    data:    base64Data,
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
                console.error("❌ Roboflow Error:", error.message);
                return res.status(502).json({ status: 'error', message: 'AI Server Roboflow Error' });
            }
        }

        // --- 2. LOGIKA FILTERING KEYWORD ---
        const labelRaw     = finalLabel ? String(finalLabel).toUpperCase() : "";
        const isHealthy    = labelRaw.includes("HEALTHY") || labelRaw.includes("SEHAT");
        const isEsca       = labelRaw.includes("ESCA");
        const isBlackRot   = labelRaw.includes("BLACK");
        const isIsariopsis = labelRaw.includes("ISARIOPSIS");
        const isBlight     = labelRaw.includes("BLIGHT");
        const isKlorosis   = labelRaw.includes("KLOROSIS");
        const isValidLeaf  = isHealthy || isEsca || isBlackRot || isIsariopsis || isBlight || isKlorosis;

        console.log(`🔍 DEBUG: Hasil AI = "${finalLabel}", Score = ${Math.round(finalScore * 100)}%`);

        if (!isValidLeaf) {
            return res.status(200).json({
                status:    'invalid',
                message:   `Objek terdeteksi (${finalLabel}) bukan daun anggur terdaftar.`,
                diagnosis: finalLabel
            });
        }

        if (finalScore <= 0.4) {
            console.log("⚠️ Ditolak: Akurasi di bawah 40%");
            return res.status(200).json({
                status:     'invalid',
                message:    `Hasil analisis (${(finalScore * 100).toFixed(1)}%) di bawah standar akurasi 40%. Silakan ambil foto ulang.`,
                diagnosis:  finalLabel,
                confidence: (finalScore * 100).toFixed(2) + "%"
            });
        }

        // --- 3. SIMPAN GAMBAR FISIK ---
        console.log("✅ Lolos Validasi! Menyimpan gambar ke folder lokal...");
        const fileName = `diag_${perangkat_id}_${Date.now()}.jpg`;
        const dirPath  = path.join(__dirname, '../../public/uploads/diagnosis');
        const imageUrl = `/public/uploads/diagnosis/${fileName}`;

        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(path.join(dirPath, fileName), bufferImage);

        // --- 4. SIMPAN KE DATABASE ---
        const logAI = await LogDiagnosisAI.create({
            perangkat_id,
            image_url:        imageUrl,
            hasil_diagnosis:  finalLabel,
            confidence_score: finalScore,
            saran_tindakan:   getSaran(finalLabel)
        });

        // --- 5. NOTIFIKASI TELEGRAM (dengan cooldown) ---
        // Cooldown lebih panjang untuk AI: 30 menit, karena deteksi penyakit jarang berubah cepat
        if ((isEsca || isBlackRot || isIsariopsis || isBlight) && finalScore > 0.7) {
            const namaNode = perangkat.nama_node || perangkat.id;
            await sendNotificationWithCooldown({
                perangkat_id,
                pesanDB:       `⚠️ Deteksi ${finalLabel} di ${namaNode} (${(finalScore * 100).toFixed(1)}%)`,
                pesanTelegram: `🌿 *AI ALERT*\n\nTerdeteksi: *${finalLabel}*\nLokasi: ${namaNode}\nAkurasi: ${(finalScore * 100).toFixed(1)}%`,
                cooldownMs:    30 * 60 * 1000  // 30 menit khusus notif AI
            });
        }

        console.log("🎉 Proses Diagnosa Berhasil Disimpan!");

        res.status(201).json({
            status:     'success',
            diagnosis:  finalLabel,
            confidence: (finalScore * 100).toFixed(2) + "%",
            image_url:  imageUrl,
            data:       logAI
        });

    } catch (error) {
        console.error("❌ Error Global Diagnosis:", error.message);
        if (!res.headersSent) res.status(500).json({ status: 'error', message: error.message });
    }
};

function getSaran(label) {
    const raw = String(label).toUpperCase();
    if (raw.includes("ESCA"))       return "Terdeteksi Jamur Esca. Segera pangkas bagian yang terinfeksi dan bakar sisa pangkasan.";
    if (raw.includes("HEALTHY") || raw.includes("SEHAT")) return "Daun dalam kondisi prima. Pertahankan kelembapan tanah di angka 60-70%.";
    if (raw.includes("BLACK"))      return "Infeksi Black Rot terdeteksi. Gunakan fungisida berbahan aktif Mankozeb.";
    if (raw.includes("ISARIOPSIS")) return "Terdeteksi Isariopsis. Perbaiki sirkulasi udara di sekitar tajuk tanaman.";
    if (raw.includes("BLIGHT"))     return "Hawar daun terdeteksi. Hindari menyiram bagian daun di sore hari.";
    return "Lakukan observasi visual lebih lanjut.";
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