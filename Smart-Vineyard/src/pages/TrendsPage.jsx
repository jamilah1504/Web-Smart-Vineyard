import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function TrendsPage() {
  // Generate 7-day forecast data
  const forecastData = useMemo(() => {
    const days = ['13 Mar', '14 Mar', '15 Mar', '16 Mar', '17 Mar', '18 Mar', '19 Mar']
    return days.map((day, i) => ({
      name: day,
      soilMoisture: 30 + Math.random() * 50,
      rainfall: i === 2 ? 15 : Math.random() * 5,
    }))
  }, []);

  return (
    <div className="page page-with-padding page-shell">
      {/* Header */}
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Prediksi Tren 7 Hari</div>
          <div className="page-caption page-caption-lg">
            Analisis tren cuaca & parameter lingkungan untuk perencanaan irigasi & manajemen risiko.
          </div>
        </div>
      </div>

      {/* Forecast Summary */}
      <section className="card-grid-3 u-mb-1" style={{ marginBottom: '30px', gap: '15px' }}>
        <div className="card card-animate card-elevated card-stretch">
          <div className="card-header card-header-top-md">
            <div>
              <div className="card-title card-title-lg">Prakiraan Cuaca</div>
              <div className="card-subtitle card-subtitle-lg">7 hari ke depan</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="small-stat">
              <div className="small-text text-sm-muted">13 Mar (Besok)</div>
              <div style={{ fontSize: '0.9rem' }}>☀️ Cerah</div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">14 Mar</div>
              <div style={{ fontSize: '0.9rem' }}>⛅ Sebagian Berawan</div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">15 Mar</div>
              <div style={{ fontSize: '0.9rem' }}>🌧️ Hujan Ringan</div>
            </div>
          </div>
        </div>

        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Prediksi Soil Moisture</div>
              <div className="card-subtitle card-subtitle-lg">Perkiraan Blok A</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="small-stat">
              <div className="small-text text-sm-muted">Hari ini</div>
              <div className="big-number">65%</div>
              <div className="small-text text-sm-muted">Kondisi optimal</div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Prediksi 3 hari</div>
              <div className="big-number" style={{ color: '#e74c3c' }}>35%</div>
              <div className="small-text text-sm-muted">⚠️ Perlu irigasi</div>
            </div>
          </div>
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
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={forecastData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7e3" />
              <XAxis 
                dataKey="name"
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
              <Bar dataKey="soilMoisture" fill="#27ae60" name="Soil Moisture (%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
              <tr>
                <td>13 Mar</td>
                <td>Cerah</td>
                <td>52</td>
                <td>Irigasi pagi</td>
              </tr>
              <tr>
                <td>14 Mar</td>
                <td>Berawan</td>
                <td>45</td>
                <td>Irigasi pagi</td>
              </tr>
              <tr>
                <td>15 Mar</td>
                <td>Hujan Ringan</td>
                <td>68</td>
                <td>Tunda irigasi</td>
              </tr>
              <tr>
                <td>16 Mar</td>
                <td>Cerah</td>
                <td>38</td>
                <td>Irigasi sore</td>
              </tr>
              <tr>
                <td>17 Mar</td>
                <td>Cerah</td>
                <td>30</td>
                <td>Irigasi dobel</td>
              </tr>
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
