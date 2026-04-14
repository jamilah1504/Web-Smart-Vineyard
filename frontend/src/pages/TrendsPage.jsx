import { useMemo, useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getWeatherForecast } from '../services/trendsApi'

function TrendsPage() {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch cuaca dari Open-Meteo API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await getWeatherForecast();
        setForecastData(data);
        setError('');
      } catch (err) {
        console.error("Error:", err);
        setError('Gagal mengambil data cuaca');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">📈 Prediksi Tren 7 Hari</div>
          <div className="page-caption page-caption-lg">
            Analisis tren cuaca & parameter lingkungan untuk perencanaan irigasi & manajemen risiko.
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fadbd8',
          color: '#c62828',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '2px solid #e74c3c',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>⚠️</span>
          <div>
            <strong>Error Data Cuaca</strong>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Forecast Summary */}
      <section className="card-grid-3 u-mb-1" style={{ marginBottom: '30px', gap: '15px' }}>
        <div className="card card-animate card-elevated card-stretch">
          <div className="card-header card-header-top-md">
            <div>
              <div className="card-title card-title-lg">Prakiraan Cuaca</div>
              <div className="card-subtitle card-subtitle-lg">7 hari ke depan</div>
            </div>
          </div>
          {loading ? (
            <div className="simple-card-list u-mt-05">
              <div style={{ textAlign: 'center', color: '#95a5a6' }}>⏳ Memuat...</div>
            </div>
          ) : (
            <div className="simple-card-list u-mt-05">
              {forecastData.slice(0, 3).map((day, idx) => (
                <div key={idx} className="small-stat">
                  <div className="small-text text-sm-muted">{day.date}</div>
                  <div style={{ fontSize: '0.9rem' }}>{day.weather}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Prediksi Soil Moisture</div>
              <div className="card-subtitle card-subtitle-lg">Perkiraan Blok A</div>
            </div>
          </div>
          {loading ? (
            <div className="simple-card-list u-mt-05">
              <div style={{ textAlign: 'center', color: '#95a5a6' }}>⏳ Memuat...</div>
            </div>
          ) : (
            <div className="simple-card-list u-mt-05">
              <div className="small-stat">
                <div className="small-text text-sm-muted">Hari ini</div>
                <div className="big-number">{forecastData[0]?.soilMoisturePrediction || '--'}%</div>
                <div className="small-text text-sm-muted">
                  {forecastData[0]?.soilMoisturePrediction > 60 ? '✓ Optimal' : '⚠️ Perlu irigasi'}
                </div>
              </div>
              <div className="small-stat">
                <div className="small-text text-sm-muted">Prediksi 3 hari</div>
                <div className="big-number" style={{ color: forecastData[2]?.soilMoisturePrediction < 40 ? '#e74c3c' : '#27ae60' }}>
                  {forecastData[2]?.soilMoisturePrediction || '--'}%
                </div>
                <div className="small-text text-sm-muted">
                  {forecastData[2]?.soilMoisturePrediction < 40 ? '⚠️ Perlu irigasi' : '✓ Baik'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Rekomendasi Aksi</div>
              <div className="card-subtitle card-subtitle-lg">Saran sistem AI</div>
            </div>
          </div>
          <div className="simple-list u-mt-05">
            <div className="small-text" style={{ paddingBottom: '8px' }}>
              ✓ <strong>Intensifikasi irigasi</strong> – Prediksi kering 3 hari mendatang
            </div>
            <div className="small-text" style={{ paddingBottom: '8px' }}>
              ✓ <strong>Pantau hujan</strong> – Potensi 40mm pada 15 Mar
            </div>
            <div className="small-text">
              ✓ <strong>Sesuaikan jadwal</strong> – Pindahkan jadwal pagi ke 05:30
            </div>
          </div>
        </div>
      </section>

      {/* Soil Moisture Prediction Chart */}
      <section className="card card-animate card-elevated u-mb-1" style={{ marginBottom: '30px' }}>
        <div className="chart-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div className="card-title card-title-lg">Prediksi Soil Moisture 7 Hari</div>
            <div className="card-subtitle card-subtitle-lg">Estimasi kelembapan tanah dengan rekomendasi irigasi</div>
          </div>
        </div>
        <div style={{ width: '100%', minHeight: '340px', padding: 'clamp(0.75rem, 2%, 1.5rem) 0', backgroundColor: '#fafbfc', borderRadius: '8px', marginTop: '15px' }}>
          {loading ? (
            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6' }}>
              ⏳ Memuat data cuaca...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={forecastData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7e3" />
                <XAxis 
                  dataKey="date"
                  stroke="#789487"
                  style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)' }}
                  tick={{ fill: '#789487' }}
                />
                <YAxis 
                  stroke="#789487"
                  style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)' }}
                  tick={{ fill: '#789487' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #27ae60',
                    borderRadius: '0.8rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                  }}
                />
                <Bar dataKey="soilMoisturePrediction" fill="#27ae60" name="Soil Moisture (%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Detailed Predictions Table */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Tabel Prediksi Detail</div>
            <div className="card-subtitle card-subtitle-lg">Perkiraan parameter 7 hari</div>
          </div>
        </div>
        <div className="table-wrapper u-mt-05">
          <table className="table table-compact">
            <thead>
              <tr style={{ borderBottom: '3px solid #27ae60' }}>
                <th style={{ color: '#27ae60' }}>Tanggal</th>
                <th style={{ color: '#27ae60' }}>Cuaca</th>
                <th style={{ color: '#27ae60' }}>Prediksi SM (%)</th>
                <th style={{ color: '#27ae60' }}>Aksi Saran</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#95a5a6', padding: '20px' }}>
                    ⏳ Memuat data...
                  </td>
                </tr>
              ) : (
                forecastData.map((day, idx) => (
                  <tr key={idx}>
                    <td>{day.date}</td>
                    <td>{day.weather}</td>
                    <td style={{ fontWeight: '600', color: day.soilMoisturePrediction > 60 ? '#27ae60' : '#e74c3c' }}>
                      {day.soilMoisturePrediction}%
                    </td>
                    <td>
                      {day.soilMoisturePrediction > 60 
                        ? 'Tunda irigasi' 
                        : day.soilMoisturePrediction > 40 
                        ? 'Irigasi normal' 
                        : 'Irigasi intensif'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="small-text text-sm-muted u-mt-05" style={{ textAlign: 'center', padding: '12px', color: '#95a5a6' }}>
            Data prediksi tren 7 hari
          </div>
        </div>
      </section>
    </div>
  )
}

export default TrendsPage
