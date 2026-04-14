import axios from 'axios';

const BASE_URL = "http://localhost:5000/api/sensor";

/**
 * Fungsi untuk mendapatkan prediksi tren 7 hari dari backend
 * Backend akan ambil dari Open-Meteo API
 */
export const getSevenDayTrends = async (perangkat_id = "ESP32-MAC-A001") => {
  try {
    const response = await axios.get(`${BASE_URL}/trends/${perangkat_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching trends:", error);
    throw error;
  }
};

/**
 * Fallback: Fetch cuaca dari Open-Meteo API langsung (tanpa backend)
 * Gunakan ini jika backend offline
 */
export const getWeatherForecast = async (lat = -6.9175, lon = 107.6191) => {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FBangkok`
    );
    
    const { daily } = response.data;
    
    // Transform data ke format yang sesuai
    return daily.time.map((date, idx) => ({
      date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      weather: getWeatherDesc(daily.weathercode[idx]),
      tempMax: daily.temperature_2m_max[idx],
      tempMin: daily.temperature_2m_min[idx],
      rainfall: daily.precipitation_sum[idx],
      soilMoisturePrediction: predictSoilMoisture(
        daily.precipitation_sum[idx],
        daily.temperature_2m_max[idx],
        idx
      )
    }));
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    throw error;
  }
};

/**
 * Helper: Terjemahkan kode cuaca WMO
 */
function getWeatherDesc(code) {
  if (code === 0) return "☀️ Cerah";
  if (code >= 1 && code <= 3) return "⛅ Berawan";
  if (code >= 45 && code <= 48) return "🌫️ Kabut";
  if (code >= 51 && code <= 67) return "🌧️ Hujan Ringan";
  if (code >= 71 && code <= 77) return "❄️ Salju";
  if (code >= 80 && code <= 82) return "🌦️ Hujan Deras";
  if (code >= 95) return "⛈️ Badai";
  return "☁️ Mendung";
}

/**
 * Helper: Prediksi soil moisture berdasarkan cuaca
 * Logika sederhana: hujan +0.8%, suhu -0.25% per °C
 */
function predictSoilMoisture(rainfall, tempMax, dayIndex) {
  let moisture = 60; // Base moisture (asumsi)
  
  // Evolusi dari hari sebelumnya
  if (dayIndex > 0) {
    moisture -= dayIndex * 5; // Menurun 5% per hari (evapotranspirasi)
  }
  
  // Tambah dari hujan
  moisture += rainfall * 0.8;
  
  // Kurang dari suhu tinggi
  moisture -= (tempMax - 25) * 0.25;
  
  // Batasi 15-95%
  return Math.round(Math.max(Math.min(moisture, 95), 15));
}
