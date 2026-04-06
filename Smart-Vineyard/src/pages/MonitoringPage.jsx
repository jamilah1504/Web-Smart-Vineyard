import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getLatestSensorData } from '../services/sensorApi'; // Sesuaikan path ini dengan struktur folder Anda!

function MonitoringPage() {
  // === STATE MANAGEMENT ===
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  
  // State untuk form filter (bisa dikembangkan nanti)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedParam, setSelectedParam] = useState('Semua Parameter');
  
  const DEVICE_ID = "ESP32-MAC-A001"; // ID Perangkat

  // === FUNGSI TARIK DATA & RETRY LOGIC ===
  const fetchData = useCallback(async () => {
    try {
      const response = await getLatestSensorData(DEVICE_ID);
      setSensorData(response.data);
      setError(''); 
      setRetryCount(0); 
    } catch (err) {
      console.error("🔴 Gagal menarik data:", err);
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
      } else {
        setError('Sistem gagal menghubungi server setelah 3 kali percobaan (API Error).');
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  // === TRIGGER: AUTO REFRESH ===
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 15000); 
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const latestData = sensorData.length > 0 ? sensorData[0] : null;

  // Generate chart data - 24-hour mock data
  const chartData = useMemo(() => {
    const data = []
    const now = new Date()
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now)
      time.setHours(time.getHours() - i)
      data.push({
        time: time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        soilMoisture: 40 + Math.random() * 40,
        pH: 6.0 + Math.random() * 1.5,
        N: 20 + Math.random() * 30,
      })
    }
    return data
  }, [])

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-responsive {
          animation: slideIn 0.5s ease-out;
          transition: all 0.3s ease;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .card-responsive:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      {/* Header */}
      <div className="page-header u-mb-2" style={{ marginBottom: '30px' }}>
        <div>
          <div className="page-title page-title-lg" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>📊 Monitoring Sensor</div>
          <div className="page-caption page-caption-lg" style={{ fontSize: '1.1rem', color: '#7f8c8d' }}>Tren real-time soil moisture, pH, dan NPK dari perangkat IoT</div>
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
          gap: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong>Koneksi Error</strong>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Filter + Status Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Filter Card */}
        <div className="card-responsive" style={{
          backgroundColor: '#ffffff',
          border: '1px solid #ecf0f1',
          padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>🔍 Filter & Pencarian</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Sesuaikan rentang data</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '6px' }}>Dari Tanggal</label>
              <input 
                type="date" 
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ecf0f1' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '6px' }}>Sampai Tanggal</label>
              <input 
                type="date" 
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ecf0f1' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '6px' }}>Parameter</label>
              <select 
                className="form-control"
                value={selectedParam}
                onChange={(e) => setSelectedParam(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ecf0f1' }}
              >
                <option>Semua Parameter</option>
                <option>Soil Moisture</option>
                <option>pH Tanah</option>
                <option>NPK</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button 
                style={{
                  flex: 1,
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
              >
                Terapkan
              </button>
              <button 
                style={{
                  flex: 1,
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSelectedParam('Semua Parameter');
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#bdc3c7'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ecf0f1'}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
          color: 'white',
          padding: '24px',
          boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>📍 Lokasi Sensor</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Perangkat aktif</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Blok A</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              <strong>{DEVICE_ID}</strong>
            </div>
          </div>
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            fontSize: '13px'
          }}>
            Status: <strong>{error ? '🔴 Offline' : '🟢 Online'}</strong>
          </div>
        </div>

        {/* Moisture Card */}
        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          color: 'white',
          padding: '24px',
          boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, marginBottom: '16px' }}>💧 Kelembapan Tanah</div>
            {loading && sensorData.length === 0 ? (
              <div style={{
                height: '60px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                animation: 'pulse 2s infinite'
              }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontSize: '48px', fontWeight: '700', lineHeight: '1' }}>
                  {latestData?.moisture_val || '--'}
                </div>
                <div style={{ fontSize: '18px', marginBottom: '6px', opacity: 0.9 }}>%</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Data Table */}
      <section style={{
        backgroundColor: '#ffffff',
        borderRadius: '15px',
        padding: '24px',
        marginBottom: '30px',
        border: '1px solid #ecf0f1',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        animation: 'slideIn 0.5s ease-out'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>📋 Data Sensor Real-Time</div>
          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Riwayat pembacaan sensor terbaru</div>
        </div>

        <div style={{
          overflowX: 'auto',
          borderRadius: '12px',
          border: '1px solid #ecf0f1'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #ecf0f1'
              }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Waktu</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Lokasi</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Moisture</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>pH</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>N</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>P</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>K</th>
              </tr>
            </thead>
            <tbody>
              {loading && sensorData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>
                    ⏳ Memuat data sensor...
                  </td>
                </tr>
              ) : sensorData.length > 0 ? (
                sensorData.slice(0, 20).map((row, idx) => (
                  <tr key={row.id} style={{
                    borderBottom: '1px solid #ecf0f1',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    transition: 'background-color 0.3s'
                  }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px' }}>
                        {new Date(row.timestamp).toLocaleString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        backgroundColor: '#e8f5e9',
                        color: '#27ae60',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>Blok A</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#3498db' }}>{row.moisture_val}%</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{row.ph_val}</td>
                    <td style={{ padding: '12px 16px' }}>{row.n_val}</td>
                    <td style={{ padding: '12px 16px' }}>{row.p_val}</td>
                    <td style={{ padding: '12px 16px' }}>{row.k_val}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>
                    📭 Tidak ada data tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chart */}
      <section style={{
        backgroundColor: '#ffffff',
        borderRadius: '15px',
        padding: '24px',
        border: '1px solid #ecf0f1',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        animation: 'slideIn 0.6s ease-out'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>📈 Tren 24 Jam Terakhir</div>
          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Visualisasi parameter sensor IoT</div>
        </div>

        {loading && sensorData.length === 0 ? (
          <div style={{
            height: '360px',
            backgroundColor: '#f5f7fa',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{ textAlign: 'center', color: '#95a5a6' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <div>Loading chart...</div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '380px' }}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                <XAxis dataKey="time" stroke="#95a5a6" tick={{ fill: '#95a5a6', fontSize: 12 }} />
                <YAxis stroke="#95a5a6" tick={{ fill: '#95a5a6', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #ecf0f1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  cursor={{ stroke: '#ecf0f1', strokeWidth: 2 }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                <Line type="monotone" dataKey="soilMoisture" stroke="#27ae60" name="Moisture (%)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="pH" stroke="#e74c3c" name="pH" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="N" stroke="#3498db" name="Nitrogen" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

export default MonitoringPage;