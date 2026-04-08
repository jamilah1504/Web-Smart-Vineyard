import { useState, useMemo, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getLatestSensorData } from '../services/sensorApi'

function DashboardPage() {
  const [pumpOn, setPumpOn] = useState(false)
  const [injectOn, setInjectOn] = useState(false)
  const [sensorData, setSensorData] = useState([])
  const [loading, setLoading] = useState(true)

  const DEVICE_ID = "ESP32-MAC-A001";

  // Fetch Data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await getLatestSensorData(DEVICE_ID);
        if (response.status === 'success') {
          setSensorData([...response.data].reverse());
        }
      } catch (error) {
        console.error("Gagal load data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const latest = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  const chartData = useMemo(() => {
    return sensorData.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      soilMoisture: item.moisture_val,
      N: item.n_val,
      P: item.p_val,
      K: item.k_val,
      pH: item.ph_val
    }));
  }, [sensorData]);

  // Loading Skeleton Component
  const SkeletonCard = () => (
    <div style={{
      backgroundColor: '#f5f7fa',
      borderRadius: '12px',
      padding: '20px',
      animation: 'pulse 2s infinite'
    }}>
      <div style={{ height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '40px', backgroundColor: '#e0e0e0', borderRadius: '4px' }} />
    </div>
  );

  // Utility function untuk status badge
  const getStatusBadge = (value, minOptimal) => {
    if (value >= minOptimal) {
      return { text: 'Optimal', color: '#1B5E20', bg: '#f5ede3' };
    }
    return { text: 'Rendah', color: '#d9534f', bg: '#fadbd8' };
  };

  const statusN = getStatusBadge(latest?.n_val || 0, 30);

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
        }
        .card-responsive:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      <div className="page-header u-mb-2" style={{ marginBottom: '30px' }}>
        <div>
          <div className="page-title page-title-lg" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>Dashboard Monitoring</div>
          <div className="page-caption page-caption-lg" style={{ fontSize: '1.1rem', color: '#7f8c8d' }}>Realtime data sensor dan kontrol fertigasi otomatis</div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* NPK Card */}
        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>Nutrisi Tanah (NPK)</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Kandungan nutrisi terkini</div>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'N', value: latest?.n_val },
                { label: 'P', value: latest?.p_val },
                { label: 'K', value: latest?.k_val }
              ].map((item, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{item.value || '--'}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '12px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>pH: <strong>{latest?.ph_val || '--'}</strong></span>
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '11px'
            }}>
              Status: {statusN.text}
            </span>
          </div>
        </div>

        {/* Kelembapan Card */}
        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #45b7d1 0%, #0084ff 100%)',
          borderRadius: '15px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(69, 183, 209, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, marginBottom: '20px' }}>Kelembapan Tanah</div>
            {loading ? (
              <SkeletonCard />
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontSize: '56px', fontWeight: '700', lineHeight: '1' }}>
                  {latest?.moisture_val || '--'}
                </div>
                <div style={{ fontSize: '20px', marginBottom: '8px', opacity: 0.9 }}>%</div>
              </div>
            )}
          </div>
          <div style={{
            marginTop: '16px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 0',
            textAlign: 'center',
            fontSize: '12px'
          }}>
            Area Akar
          </div>
        </div>

        {/* Stok Air & Nutrisi Card */}
        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '15px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>Stok & Kapasitas</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Tandon & nutrisi</div>
          </div>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span>Air Baku</span>
                  <span style={{ fontWeight: '600' }}>85%</span>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    height: '100%',
                    width: '85%',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span>Pupuk Cair</span>
                  <span style={{ fontWeight: '600' }}>40%</span>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    height: '100%',
                    width: '40%',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI & Kontrol Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* AI Diagnosis */}
        <div className="card-responsive" style={{
          borderRadius: '15px',
          padding: '24px',
          backgroundColor: '#f8f9fa',
          border: '2px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>🤖 AI Diagnosis</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Status kesehatan tanaman</div>
          </div>
          {loading ? (
            <SkeletonCard />
          ) : (
            <div style={{
              backgroundColor: '#f5ede3',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center',
              border: '2px solid #1B5E20'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1B5E20' }}>Normal</div>
              <div style={{ fontSize: '12px', color: '#16a085', marginTop: '8px' }}>Belum ada gejala penyakit</div>
            </div>
          )}
        </div>

        {/* Manual Control */}
        <div className="card-responsive" style={{
          borderRadius: '15px',
          padding: '24px',
          backgroundColor: '#f8f9fa',
          border: '2px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>⚙️ Kontrol Manual</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Mode manual fertigasi</div>
          </div>

          {/* Pompa Control */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #ecf0f1'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>Pompa Irigasi</div>
              <div style={{
                fontSize: '12px',
                color: pumpOn ? '#1B5E20' : '#95a5a6',
                fontWeight: '500'
              }}>
                {pumpOn ? '🟢 MENYIRAM' : '⚪ STANDBY'}
              </div>
            </div>
            <button
              onClick={() => setPumpOn(!pumpOn)}
              style={{
                width: '56px',
                height: '32px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: pumpOn ? '#1B5E20' : '#bdc3c7',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: pumpOn ? '0 0 10px rgba(39, 174, 96, 0.5)' : 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                top: '2px',
                left: pumpOn ? '26px' : '2px',
                transition: 'left 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {/* Nutrient Inject Control */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #ecf0f1'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>Injeksi Nutrisi</div>
              <div style={{
                fontSize: '12px',
                color: injectOn ? '#3498db' : '#95a5a6',
                fontWeight: '500'
              }}>
                {injectOn ? '🟢 INJEKSI' : '⚪ STANDBY'}
              </div>
            </div>
            <button
              onClick={() => setInjectOn(!injectOn)}
              style={{
                width: '56px',
                height: '32px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: injectOn ? '#3498db' : '#bdc3c7',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: injectOn ? '0 0 10px rgba(52, 152, 219, 0.5)' : 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                top: '2px',
                left: injectOn ? '26px' : '2px',
                transition: 'left 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section style={{
        borderRadius: '15px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #ecf0f1',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        animation: 'slideIn 0.6s ease-out'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>📊 Tren Real-Time</div>
          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Visualisasi fluktuasi sensor tanah (data terakhir)</div>
        </div>

        {loading ? (
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
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
              <div>Loading chart...</div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '380px' }}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Line type="monotone" dataKey="soilMoisture" stroke="#1B5E20" name="Moisture (%)" strokeWidth={3} dot={{ r: 5, fill: '#1B5E20' }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="N" stroke="#3498db" name="Nitrogen" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pH" stroke="#d9534f" name="pH" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
