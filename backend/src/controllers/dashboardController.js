const models = require('../models');
const LogSensorTanah = models.LogSensorTanah;
const LogTandon = models.LogTandon;
const LogDiagnosisAI = models.LogDiagnosisAI;

exports.getDashboardSummary = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        console.log(`🔍 Memproses Dashboard untuk: ${perangkat_id}`);

        // Gunakan Promise.allSettled agar jika satu tabel error/kosong, yang lain tetap jalan
        const results = await Promise.allSettled([
            // 1. Sensor Tanah (Cek apakah kolomnya 'timestamp' atau 'createdAt')
            LogSensorTanah.findOne({ 
                where: { perangkat_id }, 
                order: [['timestamp', 'DESC']] 
            }),
            // 2. Tandon
            LogTandon.findOne({ 
                where: { perangkat_id }, 
                order: [['timestamp', 'DESC']] 
            }),
            // 3. AI (Biasanya menggunakan createdAt)
            LogDiagnosisAI.findOne({ 
                where: { perangkat_id }, 
                order: [['createdAt', 'DESC']] 
            }),
            // 4. History Grafik
            LogSensorTanah.findAll({
                where: { perangkat_id },
                order: [['timestamp', 'DESC']],
                limit: 20
            })
        ]);

        // Mapping hasil dengan aman
        const latestSensor = results[0].status === 'fulfilled' ? results[0].value : null;
        const latestTandon = results[1].status === 'fulfilled' ? results[1].value : null;
        const latestAI     = results[2].status === 'fulfilled' ? results[2].value : null;
        const sensorHistory = results[3].status === 'fulfilled' ? results[3].value : [];

        // Log error ke terminal jika ada query yang gagal
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`❌ Query ke-${index + 1} Gagal:`, result.reason.message);
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                latest: {
                    n_val: latestSensor?.n_val || 0,
                    p_val: latestSensor?.p_val || 0,
                    k_val: latestSensor?.k_val || 0,
                    ph_val: latestSensor?.ph_val || 0,
                    ec_val: latestSensor?.ec_val || 0,
                    kelembapan_val: latestSensor?.kelembapan_val || 0,
                    water_level: latestTandon?.ketinggian_air || 0,
                    diagnosis: latestAI?.hasil_diagnosis || 'Normal',
                    confidence: latestAI?.confidence_score || 0
                },
                history: Array.isArray(sensorHistory) ? [...sensorHistory].reverse() : []
            }
        });

    } catch (error) {
        console.error("❌ Dashboard Global Error:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};