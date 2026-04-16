import { useState, useEffect } from 'react';
// Pastikan path import ini sesuai dengan file service API kamu
import { getWeatherTrends } from '../services/trendsApi'; 

const DEVICE_ID = "ESP32-MAC-A001"; // ID Perangkat default

function TrendsPage() {
  const [forecastData, setForecastData] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [locationName, setLocationName] = useState('Memuat lokasi...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data dari Backend
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await getWeatherTrends(DEVICE_ID);
        
        if (response && response.status === 'success') {
            setForecastData(response.data || []);
            setCurrentWeather(response.currentWeather || null);
            setLocationName(response.location || 'Area Perkebunan');
        } else {
            setForecastData([]);
            setCurrentWeather(null);
        }
        setError('');
      } catch (err) {
        console.error("🔴 Error API Trend:", err);
        setError(err.message || 'Gagal mengambil data tren cuaca');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Membuat rekomendasi dinamis berdasarkan data array 3 Hari
  const generateRecommendations = () => {
      if (forecastData.length === 0) return [];
      
      let recs = [];
      const day3SM = forecastData[2]?.soilMoisture || 0;
      const totalRain = forecastData.reduce((sum, day) => sum + (day.rainfall || 0), 0);
      const highTempDay = forecastData.find(day => day.temp > 33);

      if (day3SM < 40) {
          recs.push(<span><strong>Intensifikasi irigasi</strong> – Prediksi tanah mengering ({day3SM}%) pada hari ke-3.</span>);
      } else if (day3SM > 75) {
          recs.push(<span><strong>Kurangi irigasi</strong> – Kelembapan tanah diprediksi sangat tinggi ({day3SM}%).</span>);
      } else {
          recs.push(<span><strong>Lanjutkan jadwal normal</strong> – Kelembapan tanah stabil.</span>);
      }

      if (totalRain > 10) {
          recs.push(<span><strong>Pantau curah hujan</strong> – Potensi akumulasi hujan {totalRain}mm dalam 3 hari ke depan.</span>);
      }

      if (highTempDay) {
          recs.push(<span><strong>Waspada Penguapan</strong> – Suhu mencapai {highTempDay.temp}°C pada {highTempDay.date}.</span>);
      }

      return recs;
  };

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      
      {/* HEADER HALAMAN */}
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">📈 Prediksi Tren Cuaca & Irigasi</div>
          <div className="page-caption page-caption-lg">
            Analisis data BMKG untuk area <strong>{locationName}</strong> guna perencanaan otomatisasi irigasi AETERA.
          </div>
        </div>
      </div>

      {/* ALERT ERROR */}
      {error && (
        <div style={{
          backgroundColor: '#fadbd8', color: '#c62828', padding: '16px', borderRadius: '12px',
          marginBottom: '20px', border: '2px solid #e74c3c', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <strong>Error Data Cuaca</strong>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* 🌟 KOTAK CUACA SAAT INI (NOWCAST BMKG) 🌟 */}
      {currentWeather && !loading && (
        <section className="u-mb-1" style={{ 
            backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '5px solid #27ae60', marginBottom: '30px'
        }}>
          <div style={{ color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>Saat ini</div>
          <div style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '16px' }}>
            Pemutakhiran: {currentWeather.waktu_pemutakhiran}
          </div>
          
          {/* Peringatan Dini (Muncul jika ada potensi petir/hujan lebat) */}
          {currentWeather.peringatan && (
            <div style={{ color: '#c0392b', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5', fontWeight: '500' }}>
              {currentWeather.peringatan}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '25px' }}>
             <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#2c3e50', lineHeight: '1' }}>
               {currentWeather.suhu} °C
             </div>
             <div style={{ fontSize: '18px', fontWeight: '600', color: '#34495e', marginTop: '8px' }}>
               {currentWeather.cuaca}
             </div>
             <div style={{ color: '#7f8c8d', fontSize: '15px', marginTop: '4px' }}>
               di {locationName}
             </div>
          </div>

          <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', 
              paddingTop: '20px', borderTop: '1px solid #ecf0f1', fontSize: '15px', color: '#34495e'
          }}>
             <div>
                <span style={{ color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>Kelembapan:</span>
                <strong>{currentWeather.kelembapan_udara}%</strong>
             </div>
             <div>
                <span style={{ color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>Kecepatan Angin:</span>
                <strong>{currentWeather.kecepatan_angin} km/jam</strong>
             </div>
             <div>
                <span style={{ color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>Arah Angin dari:</span>
                <strong>{currentWeather.arah_angin}</strong>
             </div>
             <div>
                <span style={{ color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>Jarak Pandang:</span>
                <strong>{currentWeather.jarak_pandang}</strong>
             </div>
          </div>
        </section>
      )}

      {/* RINGKASAN TREN 3 HARI */}
      <section className="card-grid-3 u-mb-1" style={{ marginBottom: '30px', gap: '15px' }}>
        
        {/* KARTU 1: PRAKIRAAN CUACA */}
        <div className="card card-animate card-elevated card-stretch">
          <div className="card-header card-header-top-md">
            <div>
              <div className="card-title card-title-lg">Prakiraan BMKG</div>
              <div className="card-subtitle card-subtitle-lg">3 Hari ke depan</div>
            </div>
          </div>
          {loading ? (
            <div className="simple-card-list u-mt-05">
              <div style={{ textAlign: 'center', color: '#95a5a6', padding: '20px 0' }}>⏳ Memuat BMKG...</div>
            </div>
          ) : forecastData.length > 0 ? (
            <div className="simple-card-list u-mt-05">
              {forecastData.map((day, idx) => (
                <div key={idx} className="small-stat" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div className="small-text text-sm-muted">{day.date}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{day.weather}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="small-text text-sm-muted">Suhu Maks</div>
                    <div style={{ fontWeight: 'bold' }}>{day.temp}°C</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="simple-card-list u-mt-05">
               <div style={{ textAlign: 'center', color: '#95a5a6' }}>Data tidak tersedia</div>
            </div>
          )}
        </div>

        {/* KARTU 2: PREDIKSI SOIL MOISTURE */}
        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Prediksi Kelembapan</div>
              <div className="card-subtitle card-subtitle-lg">Evolusi Tanah Node A</div>
            </div>
          </div>
          {loading ? (
            <div className="simple-card-list u-mt-05">
              <div style={{ textAlign: 'center', color: '#95a5a6', padding: '20px 0' }}>⏳ Mengalkulasi...</div>
            </div>
          ) : forecastData.length > 0 ? (
            <div className="simple-card-list u-mt-05">
              <div className="small-stat">
                <div className="small-text text-sm-muted">Estimasi Besok ({forecastData[1]?.date})</div>
                <div className="big-number" style={{ color: forecastData[1]?.soilMoisture < 40 ? '#e74c3c' : '#27ae60' }}>
                    {forecastData[1]?.soilMoisture || '--'}%
                </div>
                <div className="small-text text-sm-muted">
                  {forecastData[1]?.action}
                </div>
              </div>
              <div className="small-stat">
                <div className="small-text text-sm-muted">Prediksi Hari ke-3 ({forecastData[2]?.date})</div>
                <div className="big-number" style={{ color: forecastData[2]?.soilMoisture < 40 ? '#e74c3c' : '#27ae60' }}>
                  {forecastData[2]?.soilMoisture || '--'}%
                </div>
                <div className="small-text text-sm-muted">
                  {forecastData[2]?.action}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* KARTU 3: REKOMENDASI AI/SISTEM */}
        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Rekomendasi Aksi</div>
              <div className="card-subtitle card-subtitle-lg">Analisis Sistem AI</div>
            </div>
          </div>
          <div className="simple-list u-mt-05">
            {loading ? (
                 <div style={{ textAlign: 'center', color: '#95a5a6', padding: '20px 0' }}>⏳ Memproses insight...</div>
            ) : (
                generateRecommendations().map((rec, idx) => (
                    <div key={idx} className="small-text" style={{ paddingBottom: '12px', lineHeight: '1.4' }}>
                        ✓ {rec}
                    </div>
                ))
            )}
            {!loading && forecastData.length === 0 && (
                <div className="small-text" style={{ color: '#95a5a6' }}>Tidak ada rekomendasi saat ini.</div>
            )}
          </div>
        </div>
      </section>

      {/* TABEL RINCIAN 3 HARI */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Tabel Rincian Prediksi (3 Hari)</div>
            <div className="card-subtitle card-subtitle-lg">Berdasarkan integrasi cuaca BMKG dan Evapotranspirasi</div>
          </div>
        </div>
        <div className="table-wrapper u-mt-05">
          <table className="table table-compact">
            <thead>
              <tr style={{ borderBottom: '3px solid #27ae60' }}>
                <th style={{ color: '#27ae60', paddingLeft: '15px' }}>Tanggal</th>
                <th style={{ color: '#27ae60' }}>Cuaca (Suhu Maks)</th>
                <th style={{ color: '#27ae60' }}>Est. Hujan</th>
                <th style={{ color: '#27ae60' }}>Prediksi Kelembapan</th>
                <th style={{ color: '#27ae60' }}>Aksi Irigasi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#95a5a6', padding: '30px' }}>
                    ⏳ Memuat data dari server...
                  </td>
                </tr>
              ) : forecastData.length > 0 ? (
                forecastData.map((day, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '500', paddingLeft: '15px' }}>{day.date}</td>
                    <td>{day.weather} ({day.temp}°C)</td>
                    <td>{day.rainfall} mm</td>
                    <td style={{ fontWeight: '700', color: day.soilMoisture > 60 ? '#27ae60' : day.soilMoisture < 40 ? '#e74c3c' : '#f39c12' }}>
                      {day.soilMoisture}%
                    </td>
                    <td>
                        <span style={{
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500',
                            backgroundColor: day.action.includes("Intensif") ? '#fadbd8' : day.action.includes("Tunda") ? '#d5f5e3' : '#fcf3cf',
                            color: day.action.includes("Intensif") ? '#c62828' : day.action.includes("Tunda") ? '#1e8449' : '#b7950b'
                        }}>
                            {day.action}
                        </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#95a5a6', padding: '30px' }}>
                    Data kosong. Pastikan backend terhubung.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="small-text text-sm-muted u-mt-05" style={{ textAlign: 'center', padding: '12px', color: '#95a5a6' }}>
            *Akurasi prediksi bergantung pada validitas sensor tanah saat ini dan update berkala Open Data BMKG.
          </div>
        </div>
      </section>
    </div>
  )
}

export default TrendsPage;