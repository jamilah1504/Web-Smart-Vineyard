const axios = require("axios");
const { LogDiagnosisAI, PerangkatIoT } = require('../models');

// --- 1. Fungsi Utama: Proses Deteksi via Roboflow ---
exports.diagnoseLeaf = async (req, res) => {
    try {
        const { perangkat_id, image_base64 } = req.body;

        // Validasi input
        if (!perangkat_id || !image_base64) {
            return res.status(400).json({ status: 'error', message: 'perangkat_id dan image_base64 wajib diisi' });
        }

        // 1. Kirim ke Roboflow API
        const response = await axios({
            method: "POST",
            url: "https://serverless.roboflow.com/daun_anggur-8kryf/1",
            params: {
                api_key: "XLaeFaRtaO2lzuZIrgrY" 
            },
            data: image_base64,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const predictions = response.data.predictions;
        
        // Cari prediksi dengan skor tertinggi
        let labelPenyakit = "Sehat";
        let confidenceScore = 0;

        if (predictions && predictions.length > 0) {
            // Roboflow memberikan array prediksi, kita ambil yang paling tinggi confidence-nya
            const topPrediction = predictions[0]; 
            labelPenyakit = topPrediction.class;
            confidenceScore = topPrediction.confidence;
        }

        // 2. Simpan hasil ke MySQL
        const logAI = await LogDiagnosisAI.create({
            perangkat_id,
            hasil_diagnosis: labelPenyakit,
            confidence_score: confidenceScore,
            saran_tindakan: getSaran(labelPenyakit) 
        });

        res.status(200).json({
            status: 'success',
            diagnosis: labelPenyakit,
            confidence: (confidenceScore * 100).toFixed(2) + "%",
            data: logAI
        });

    } catch (error) {
        console.error("AI Diagnosis Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: "Gagal memproses AI: " + error.message });
    }
};

// --- 2. Fungsi: Ambil Diagnosis Terakhir (Untuk Dashboard/SmartVision) ---
exports.getLatestDiagnosis = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        const data = await LogDiagnosisAI.findOne({
            where: { perangkat_id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// --- 3. Fungsi: Ambil Riwayat Diagnosis ---
exports.getDiagnosisHistory = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        const data = await LogDiagnosisAI.findAll({
            where: { perangkat_id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// --- Fungsi Bantu (Helper) ---
function getSaran(label) {
    const daftarSaran = {
        "Klorosis": "Berikan pupuk mikro (Fe, Mg) atau cek pH tanah. Pastikan pH tidak terlalu basa agar nutrisi terserap.",
        "Isariopsis": "Segera semprotkan fungisida kontak dan bersihkan daun yang gugur agar tidak menular.",
        "Sehat": "Tanaman Anda dalam kondisi prima. Pertahankan kelembapan tanah di rentang 40-70%.",
        "Black Rot": "Kurangi kelembapan kanopi dengan pemangkasan dan gunakan fungisida sistemik.",
        "Esca": "Potong bagian batang yang terinfeksi dan olesi dengan pasta fungisida."
    };
    return daftarSaran[label] || "Lakukan observasi visual lebih lanjut dan pastikan sanitasi lingkungan terjaga.";
}