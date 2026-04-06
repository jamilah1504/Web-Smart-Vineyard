const axios = require('axios');
const { SensorData } = require('../models');

exports.getSevenDayTrends = async (req, res) => {
    try {
        // Koordinat Kebun (Contoh: Bandung)
        const lat = -6.9175;
        const lon = 107.6191;

        // 1. Ambil data dari Open-Meteo (Gratis & No API Key)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,precipitation_sum&timezone=Asia%2FBangkok`;
        
        const response = await axios.get(weatherUrl);
        const dailyData = response.data.daily;

        // 2. Ambil data terakhir dari database untuk titik awal prediksi
        const latestSensor = await SensorData.findOne({ order: [['createdAt', 'DESC']] });
        let currentSM = latestSensor ? latestSensor.soil_moisture : 55; // Default 55% jika DB kosong

        // 3. Olah data menjadi format yang dibutuhkan Frontend
        const trends = dailyData.time.map((dateStr, index) => {
            const rain = dailyData.precipitation_sum[index];
            const maxTemp = dailyData.temperature_2m_max[index];
            const weatherCode = dailyData.weathercode[index];

            // LOGIKA PREDIKSI SEDERHANA
            // Jika hujan > 5mm, SM naik. Jika suhu > 30C, SM turun lebih cepat.
            let predictionSM = currentSM + (rain * 0.8) - (maxTemp * 0.25);
            
            // Batasi rentang 0-100%
            predictionSM = Math.round(Math.max(Math.min(predictionSM, 95), 15));
            currentSM = predictionSM; // Update untuk iterasi hari berikutnya

            return {
                date: new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                weather: getWeatherDesc(weatherCode),
                temp: maxTemp,
                soilMoisture: predictionSM,
                rainfall: rain,
                action: predictionSM < 40 ? "Irigasi Intensif" : (predictionSM > 70 ? "Tunda Irigasi" : "Irigasi Normal")
            };
        });

        res.status(200).json({ status: 'success', data: trends });
    } catch (error) {
        console.error("Trend API Error:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Helper untuk menerjemahkan kode cuaca WMO
function getWeatherDesc(code) {
    if (code === 0) return "☀️ Cerah";
    if (code <= 3) return "⛅ Berawan";
    if (code >= 51 && code <= 67) return "🌧️ Hujan Ringan";
    if (code >= 71) return "⛈️ Badai/Hujan Lebat";
    return "☁️ Mendung";
}