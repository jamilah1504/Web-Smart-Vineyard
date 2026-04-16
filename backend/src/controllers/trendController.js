const axios = require('axios');
const { LogSensorTanah } = require('../models');

// Helper menerjemahkan arah mata angin BMKG
const terjemahkanArahAngin = (wd) => {
    const arah = { "N": "Utara", "NE": "Timur Laut", "E": "Timur", "SE": "Tenggara", "S": "Selatan", "SW": "Barat Daya", "W": "Barat", "NW": "Barat Laut" };
    return arah[wd] || wd || "Bervariasi";
};

exports.getSevenDayTrends = async (req, res) => {
    try {
        const { perangkat_id } = req.params;

        // 1. Baseline DB
        const latestSensor = await LogSensorTanah.findOne({ 
            where: { perangkat_id },
            order: [['timestamp', 'DESC']] 
        });

        let currentSM = (latestSensor && latestSensor.kelembapan_val) ? parseFloat(latestSensor.kelembapan_val) : 55;
        if (isNaN(currentSM)) currentSM = 55;

        // 2. Tarik data BMKG Palasari
        const bmkgUrl = 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=32.13.29.2006';
        const response = await axios.get(bmkgUrl);
        const cuacaData = response.data.data[0].cuaca.flat(); 
        
        // --- 🌟 TAMBAHAN BARU: AMBIL DATA "SAAT INI" ---
        const sekarang = new Date();
        let cuacaSaatIni = cuacaData[0]; // Default ambil yang pertama

        // Cari data yang jam-nya paling mendekati waktu saat ini
        for (let i = 0; i < cuacaData.length; i++) {
            const waktuItem = new Date(cuacaData[i].local_datetime);
            if (waktuItem >= sekarang) {
                // Ambil blok waktu sebelumnya jika sudah lewat, atau waktu ini jika pas
                cuacaSaatIni = i > 0 ? cuacaData[i - 1] : cuacaData[i];
                break;
            }
        }

        const peringatanDini = cuacaSaatIni.weather_desc.toLowerCase().includes('petir') 
            ? `Berpotensi terjadi hujan lebat yang dapat disertai kilat/petir dan angin kencang di area ${response.data.lokasi.desa}.`
            : null; // Kosong jika tidak ada petir

        const currentWeatherData = {
            waktu_pemutakhiran: sekarang.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
            suhu: cuacaSaatIni.t,
            cuaca: cuacaSaatIni.weather_desc,
            kelembapan_udara: cuacaSaatIni.hu,
            kecepatan_angin: cuacaSaatIni.ws,
            arah_angin: terjemahkanArahAngin(cuacaSaatIni.wd),
            peringatan: peringatanDini,
            jarak_pandang: cuacaSaatIni.vs_text || "> 10 km" 
        };
        // ------------------------------------------------

        // 3. Olah data Agregasi (Sisa kode lama tetap sama)
        const dailyData = {};
        cuacaData.forEach(item => {
            const dateStr = new Date(item.local_datetime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            if (!dailyData[dateStr]) dailyData[dateStr] = { date: dateStr, temps: [], weathers: [], rainEstimate: 0 };
            dailyData[dateStr].temps.push(item.t);
            dailyData[dateStr].weathers.push(item.weather_desc);

            const desc = (item.weather_desc || "").toLowerCase();
            if (desc.includes("petir") || desc.includes("lebat")) dailyData[dateStr].rainEstimate += 10; 
            else if (desc.includes("sedang")) dailyData[dateStr].rainEstimate += 5; 
            else if (desc.includes("ringan")) dailyData[dateStr].rainEstimate += 2; 
        });

        const trends = Object.values(dailyData).map(day => {
            const maxTemp = Math.max(...day.temps);
            const rain = day.rainEstimate;
            
            let dominantWeather = "⛅ Berawan";
            if (day.weathers.some(w => w.includes("Petir"))) dominantWeather = "⛈️ Hujan Petir";
            else if (day.weathers.some(w => w.includes("Sedang") || w.includes("Lebat"))) dominantWeather = "🌧️ Hujan Sedang";
            else if (day.weathers.some(w => w.includes("Ringan"))) dominantWeather = "🌦️ Hujan Ringan";
            else if (day.weathers.some(w => w.includes("Cerah"))) dominantWeather = "☀️ Cerah";

            let predictionSM = currentSM + (rain * 0.8) - (maxTemp * 0.25);
            predictionSM = Math.round(Math.max(Math.min(predictionSM, 95), 15));
            currentSM = predictionSM; 

            return {
                date: day.date, weather: dominantWeather, temp: maxTemp,
                soilMoisture: predictionSM, rainfall: rain,
                action: predictionSM < 40 ? "Irigasi Intensif" : (predictionSM > 75 ? "Tunda Irigasi" : "Irigasi Normal")
            };
        });

        res.status(200).json({ 
            status: 'success', 
            perangkat_id,
            location: response.data.lokasi.desa,
            currentWeather: currentWeatherData, // 🌟 KIRIM DATA SAAT INI KE REACT
            data: trends 
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};