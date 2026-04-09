const axios = require('axios');
const { LogSensorTanah, PerangkatIoT } = require('../models');

/**
 * @desc    Mendapatkan tren cuaca & prediksi kelembapan tanah 7 hari ke depan
 * @route   GET /api/sensor/trends/:perangkat_id
 */
exports.getSevenDayTrends = async (req, res) => {
    try {
        const { perangkat_id } = req.params;

        // 1. Ambil data terakhir dari database sebagai titik awal (baseline)
        // Kita sesuaikan dengan model LogSensorTanah dan kolom moisture_val
        const latestSensor = await LogSensorTanah.findOne({ 
            where: { perangkat_id },
            order: [['createdAt', 'DESC']] 
        });

        // Default kelembapan 55% jika database masih kosong
        let currentSM = latestSensor ? latestSensor.moisture_val : 55;

        // 2. Tentukan Koordinat (Default: Bandung, bisa dikembangkan ambil dari tabel PerangkatIoT)
        const lat = -6.9175;
        const lon = 107.6191;

        // 3. Ambil data dari Open-Meteo (Forecast 7 Hari)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,precipitation_sum&timezone=Asia%2FBangkok`;
        
        const response = await axios.get(weatherUrl);
        const dailyData = response.data.daily;

        // 4. Olah data menjadi format Tren & Prediksi
        const trends = dailyData.time.map((dateStr, index) => {
            const rain = dailyData.precipitation_sum[index];
            const maxTemp = dailyData.temperature_2m_max[index];
            const weatherCode = dailyData.weathercode[index];

            /**
             * LOGIKA PREDIKSI SEDERHANA (EVP - Evapotranspiration)
             * - Setiap 1mm hujan meningkatkan kelembapan tanah sekitar 0.8%
             * - Setiap 1°C suhu maksimal menurunkan kelembapan tanah sekitar 0.25%
             */
            let predictionSM = currentSM + (rain * 0.8) - (maxTemp * 0.25);
            
            // Batasi rentang logika kelembapan tanah (Min 15%, Max 95%)
            predictionSM = Math.round(Math.max(Math.min(predictionSM, 95), 15));
            
            // Update currentSM untuk perhitungan hari berikutnya (akumulatif)
            currentSM = predictionSM; 

            return {
                date: new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                weather: getWeatherDesc(weatherCode),
                temp: maxTemp,
                soilMoisture: predictionSM, // Prediksi kelembapan
                rainfall: rain,
                action: predictionSM < 40 ? "Irigasi Intensif" : (predictionSM > 75 ? "Tunda Irigasi" : "Irigasi Normal")
            };
        });

        res.status(200).json({ 
            status: 'success', 
            perangkat_id,
            location: "Bandung",
            data: trends 
        });

    } catch (error) {
        console.error("❌ Trend API Error:", error.message);
        res.status(500).json({ 
            status: 'error', 
            message: "Gagal mengambil data tren cuaca",
            detail: error.message 
        });
    }
};

/**
 * Helper untuk menerjemahkan kode cuaca WMO (World Meteorological Organization)
 */
function getWeatherDesc(code) {
    if (code === 0) return "☀️ Cerah";
    if (code >= 1 && code <= 3) return "⛅ Berawan";
    if (code >= 45 && code <= 48) return "🌫️ Kabut";
    if (code >= 51 && code <= 67) return "🌧️ Hujan Ringan/Sedang";
    if (code >= 71 && code <= 77) return "❄️ Salju/Dingin";
    if (code >= 80 && code <= 82) return "🌦️ Hujan Deras";
    if (code >= 95) return "⛈️ Badai Petir";
    return "☁️ Mendung";
}