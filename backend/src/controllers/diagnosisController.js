const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { LogDiagnosisAI, Notification, PerangkatIoT } = require('../models');
const sendTelegram = require('../utils/telegram');

exports.diagnoseLeaf = async (req, res) => {
    try {
        // --- 1. VALIDASI REQ.BODY ---
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: 'error', message: 'Body request kosong.' });
        }

        // Ambil data (termasuk hasil_diagnosis & confidence_score jika dari Python)
        let { perangkat_id, image_base64, hasil_diagnosis, confidence_score } = req.body;

        if (!perangkat_id || !image_base64) {
            return res.status(400).json({ status: 'error', message: 'ID Perangkat atau Gambar tidak ditemukan.' });
        }

        // --- 2. VALIDASI PERANGKAT (FOREIGN KEY CHECK) ---
        const perangkat = await PerangkatIoT.findByPk(perangkat_id);
        if (!perangkat) {
            return res.status(404).json({ 
                status: 'error', 
                message: `Perangkat ID ${perangkat_id} tidak terdaftar. Tambahkan ID ini ke tabel perangkat_iot dulu.` 
            });
        }

        // --- 3. PROSES GAMBAR BASE64 ---
        let base64Data = image_base64.includes(",") ? image_base64.split(",")[1] : image_base64;
        const buffer = Buffer.from(base64Data, 'base64');
        
        if (buffer.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Format gambar rusak.' });
        }

        // --- 4. SIMPAN GAMBAR FISIK ---
        const fileName = `diag_${perangkat_id}_${Date.now()}.jpg`;
        const dirPath = path.join(__dirname, '../../public/uploads/diagnosis');
        const imageUrl = `/public/uploads/diagnosis/${fileName}`;

        // Pastikan folder tersedia
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(path.join(dirPath, fileName), buffer);

        // --- 5. LOGIKA HYBRID (ROBOFLOW INTEGRATION) ---
        let finalLabel = hasil_diagnosis;
        let finalScore = confidence_score;

        // Jika request dari Web (hasil_diagnosis kosong), panggil Roboflow
        if (!finalLabel) {
            console.log(`🔍 Mendiagnosa data dari Web untuk: ${perangkat_id}`);
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
                console.error("⚠️ Roboflow API Error:", error.message);
                return res.status(502).json({ status: 'error', message: 'Gagal menghubungi server AI.' });
            }
        }

        // --- 6. SIMPAN KE DATABASE ---
        const logAI = await LogDiagnosisAI.create({
            perangkat_id,
            image_url: imageUrl, 
            hasil_diagnosis: finalLabel,
            confidence_score: finalScore,
            saran_tindakan: getSaran(finalLabel)
        });

        // --- 7. NOTIFIKASI (Hanya jika terdeteksi penyakit & skor > 60%) ---
        const penyakitKritis = ["Isariopsis", "Black Rot", "Esca", "Leaf Blight"];
        if (penyakitKritis.includes(finalLabel) && finalScore > 0.6) {
            await triggerAlerts(perangkat, finalLabel, finalScore);
        }

        // --- 8. RESPONSE ---
        res.status(201).json({ 
            status: 'success', 
            diagnosis: finalLabel, 
            confidence: (finalScore * 100).toFixed(2) + "%",
            image_url: imageUrl,
            data: logAI
        });

    } catch (error) {
        console.error("❌ AI Diagnosis Global Error:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

// Fungsi pembantu notifikasi
async function triggerAlerts(perangkat, label, confidence) {
    try {
        const namaNode = perangkat.nama_node || perangkat.id;
        const pesan = `⚠️ Deteksi ${label} di ${namaNode} (${(confidence * 100).toFixed(1)}%)`;

        await Notification.create({ perangkat_id: perangkat.id, pesan, tipe: 'danger' });
        
        sendTelegram(`🌿 *AI ALERT*\n\nTerdeteksi: *${label}*\nLokasi: ${namaNode}`).catch(() => {});
    } catch (err) {
        console.error("⚠️ Gagal mengirim notifikasi:", err.message);
    }
}

function getSaran(label) {
    const daftarSaran = {
        "Klorosis": "Kurang hara/pH tanah tidak stabil. Berikan pupuk mikro.",
        "Isariopsis": "Jamur. Semprot fungisida kontak dan kurangi kelembapan.",
        "Sehat": "Tanaman prima! Lanjutkan perawatan rutin.",
        "Healthy": "Tanaman prima! Lanjutkan perawatan rutin.",
        "Black Rot": "Infeksi jamur. Buang daun terinfeksi, gunakan fungisida sistemik.",
        "Esca": "Jamur batang. Lakukan pemangkasan pada bagian sakit.",
        "Leaf Blight": "Hawar daun. Perbaiki sirkulasi udara dan gunakan fungisida."
    };
    return daftarSaran[label] || "Lakukan observasi visual lebih lanjut.";
}

// Mengambil 1 riwayat terbaru
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

// Mengambil 50 riwayat terakhir
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