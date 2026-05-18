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
  const [expandedTrendsTable, setExpandedTrendsTable] = useState(false);

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
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* KARTU 1: PRAKIRAAN CUACA */}
        <div className="card-responsive" style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '24px', border: '1px solid #ecf0f1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⛅ Prakiraan BMKG
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Cuaca 3 hari ke depan</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#95a5a6', padding: '30px 0', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              <div style={{ animation: 'pulse 1.5s infinite' }}>⏳ Memuat BMKG...</div>
            </div>
          ) : forecastData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {forecastData.map((day, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '12px 15px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: '1px solid #f0f0f0' 
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#95a5a6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{day.date}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50', marginTop: '2px' }}>{day.weather}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#95a5a6' }}>Suhu Maks</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#e67e22' }}>{day.temp}°C</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#95a5a6', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              Data tidak tersedia
            </div>
          )}
        </div>

        {/* KARTU 2: PREDIKSI SOIL MOISTURE */}
        <div className="card-responsive" style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '24px', border: '1px solid #ecf0f1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📈 Prediksi Kelembapan
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Evolusi tanah Node Utama</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#95a5a6', padding: '30px 0', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
               <div style={{ animation: 'pulse 1.5s infinite' }}>⏳ Mengalkulasi model...</div>
            </div>
          ) : forecastData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Box Besok */}
              <div style={{ 
                padding: '16px', borderRadius: '12px', 
                backgroundColor: forecastData[1]?.soilMoisture < 40 ? '#fff5f5' : '#f0fdf4', 
                border: `1px solid ${forecastData[1]?.soilMoisture < 40 ? '#ffe3e3' : '#dcfce7'}` 
              }}>
                <div style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: '600', marginBottom: '4px' }}>Besok ({forecastData[1]?.date})</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: forecastData[1]?.soilMoisture < 40 ? '#e74c3c' : '#27ae60' }}>
                    {forecastData[1]?.soilMoisture || '--'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#7f8c8d' }}>%</span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: forecastData[1]?.soilMoisture < 40 ? '#c0392b' : '#1e8449', marginTop: '6px' }}>
                  {forecastData[1]?.action || 'Butuh Perhatian'}
                </div>
              </div>

              {/* Box Lusa (Hari ke-3) */}
              <div style={{ 
                padding: '16px', borderRadius: '12px', 
                backgroundColor: forecastData[2]?.soilMoisture < 40 ? '#fff5f5' : '#f0fdf4', 
                border: `1px solid ${forecastData[2]?.soilMoisture < 40 ? '#ffe3e3' : '#dcfce7'}` 
              }}>
                <div style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: '600', marginBottom: '4px' }}>Hari ke-3 ({forecastData[2]?.date})</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: forecastData[2]?.soilMoisture < 40 ? '#e74c3c' : '#27ae60' }}>
                    {forecastData[2]?.soilMoisture || '--'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#7f8c8d' }}>%</span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: forecastData[2]?.soilMoisture < 40 ? '#c0392b' : '#1e8449', marginTop: '6px' }}>
                  {forecastData[2]?.action || 'Pantau Berkala'}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* KARTU 3: REKOMENDASI AI/SISTEM */}
        <div className="card-responsive" style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '24px', border: '1px solid #ecf0f1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 Rekomendasi Aksi
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Analisis gabungan sistem AI</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
               <div style={{ textAlign: 'center', color: '#95a5a6', padding: '30px 0', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                 <div style={{ animation: 'pulse 1.5s infinite' }}>⏳ Memproses insight...</div>
               </div>
            ) : (
                generateRecommendations().map((rec, idx) => (
                    <div key={idx} style={{ 
                      backgroundColor: '#f4f6f8', 
                      padding: '12px 15px', 
                      borderRadius: '8px', 
                      borderLeft: '4px solid #3498db',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: '#34495e',
                      fontWeight: '500'
                    }}>
                        {rec}
                    </div>
                ))
            )}
            
            {!loading && forecastData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#95a5a6', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                  Tidak ada rekomendasi kritis saat ini.
                </div>
            )}
          </div>
        </div>

      </section>
            {/* TABEL RINCIAN 3 HARI */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title card-title-lg">Tabel Rincian Prediksi (3 Hari)</div>
            <div className="card-subtitle card-subtitle-lg">Berdasarkan integrasi cuaca BMKG dan Evapotranspirasi</div>
          </div>
          {forecastData.length > 3 && (
            <button
              onClick={() => setExpandedTrendsTable(!expandedTrendsTable)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: expandedTrendsTable ? '#e74c3c' : '#27ae60',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {expandedTrendsTable ? '🔽 Tutup' : '🔼 Lihat Semua (' + forecastData.length + ')'}
            </button>
          )}
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
              ) : (expandedTrendsTable ? forecastData : forecastData.slice(0, 3)).length > 0 ? (
                (expandedTrendsTable ? forecastData : forecastData.slice(0, 3)).map((day, idx) => (
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