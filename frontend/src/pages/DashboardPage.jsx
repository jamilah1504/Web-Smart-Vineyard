import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { animate } from 'animejs'
import { getDashboardSummary } from '../services/dashboardApi' 
import { updatePumpStatus } from '../services/controlApi'

function DashboardPage() {
  const navigate = useNavigate()
  const [pumpOn, setPumpOn] = useState(false)
  const [fertilizerOn, setFertilizerOn] = useState(false)
  const [sensorData, setSensorData] = useState([]) 
  const [latest, setLatest] = useState(null)       
  const [loading, setLoading] = useState(true)
  
  const registeredDevices = ["ESP32-MAC-A001", "ESPCAM-001"]; 
  const [selectedDevice, setSelectedDevice] = useState(registeredDevices[0]);

  // Fetch Data Dashboard
  const fetchData = async () => {
    try {
      const response = await getDashboardSummary(selectedDevice);
      if (response.status === 'success') {
        setLatest(response.data.latest);
        setSensorData(response.data.history);
        setPumpOn(response.data.latest.status_pompa_air === 1);
        setFertilizerOn(response.data.latest.status_pompa_pupuk === 1);
      }
    } catch (error) {
      console.error("Gagal load dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, [selectedDevice]);

  // Define chartData SEBELUM menggunakannya di animasi
  const chartData = useMemo(() => {
    return sensorData.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      soilMoisture: item.kelembapan_val,
      N: item.n_val,
      EC: item.ec_val,
      pH: item.ph_val
    }));
  }, [sensorData]);

  // Animasi dashboard elements
  useEffect(() => {
    if (!loading && sensorData.length > 0) {
      // Animate stat cards
      animate('.card-responsive', {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: (el, i) => i * 120,
        easing: 'easeOutQuad',
      })

      // Animate chart section
      animate('section[style*="Chart"]', {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 700,
        easing: 'easeOutQuad',
      })

      // Animate chart lines dengan delay
      animate('line', {
        opacity: [0, 1],
        duration: 800,
        delay: 300,
        easing: 'easeOutQuad',
      })
    }
  }, [loading, chartData]);
const handleToggleControl = async (type, currentStatus) => {
  const newStatus = currentStatus ? 0 : 1; // Konversi boolean ke 0/1 untuk DB
  
  // Siapkan payload lengkap agar tidak menimpa status pompa lainnya
  const payload = {
    status_pompa_air: type === 'air' ? newStatus : (pumpOn ? 1 : 0),
    status_pompa_pupuk: type === 'pupuk' ? newStatus : (fertilizerOn ? 1 : 0),
    mode_kerja: 'manual'
  };

  try {
    // 1. Kirim ke Backend
    const response = await updatePumpStatus(selectedDevice, payload);

    if (response.status === 'success' || response) {
      // 2. Jika sukses di DB, baru update UI
      if (type === 'air') setPumpOn(newStatus === 1);
      if (type === 'pupuk') setFertilizerOn(newStatus === 1);
      
      console.log(`Berhasil update DB untuk ${type}:`, newStatus);
    }
  } catch (error) {
    console.error("Gagal update database:", error.response?.data || error.message);
    alert("Gagal mengubah status di database. Periksa koneksi backend/token.");
    
    // Kembalikan UI ke status semula jika gagal
    if (type === 'air') setPumpOn(currentStatus);
    if (type === 'pupuk') setFertilizerOn(currentStatus);
  }
};

  const getWaterPercentage = (val) => {
    const height = parseFloat(val) || 0;
    const max = 42;
    return Math.min(100, Math.max(0, Math.round((height / max) * 100)));
  };

  if (loading && !latest) return <div className="page-shell u-p-20">🔄 Sinkronisasi Data Multi-Node...</div>;

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      
      {/* Header */}
      <div className="page-header u-mb-15" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div className="page-title page-title-lg">📊 Dashboard Monitoring</div>
          <div className="page-caption page-caption-lg">Data real-time node: <strong>{selectedDevice}</strong></div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '10px 15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #ddd' }}>
          <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', color: '#7f8c8d' }}>Pilih Perangkat:</label>
          <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} style={{ border: 'none', outline: 'none', fontWeight: '700', cursor: 'pointer' }}>
            {registeredDevices.map(id => <option key={id} value={id}>{id}</option>)}
          </select>
        </div>
      </div>

{/* REVISI: RUBRIK INDIKATOR (VALUASI NORMAL) - LENGKAP */}
      <section style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '20px', marginBottom: '30px', border: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📖 Rubrik Indikator (Ambang Batas Normal)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {[
                { label: 'Nitrogen (N)', range: '> 30', unit: 'mg/kg', desc: 'Pembentukan klorofil & vegetatif' },
                { label: 'Fosfor (P)', range: '> 20', unit: 'mg/kg', desc: 'Energi tanaman & perkembangan akar' },
                { label: 'Kalium (K)', range: '> 40', unit: 'mg/kg', desc: 'Kualitas buah & daya tahan penyakit' },
                { label: 'Kelembapan', range: '40% - 70%', unit: '%', desc: 'Ideal untuk pertumbuhan vegetatif' },
                { label: 'pH Tanah', range: '6.0 - 7.0', unit: 'pH', desc: 'Rentang optimal penyerapan nutrisi' },
                { label: 'EC (Salinitas)', range: '1.0 - 2.0', unit: 'dS/m', desc: 'Kadar garam/kepekatan nutrisi' },
                { label: 'Level Tandon', range: '> 10', unit: 'cm', desc: 'Batas aman operasional pompa' },
                { label: 'Akurasi AI', range: '> 75%', unit: 'Score', desc: 'Tingkat kepercayaan diagnosis' }
            ].map((r, i) => (
                <div key={i} style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '10px', borderLeft: '4px solid #764ba2' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#7f8c8d', textTransform: 'uppercase' }}>{r.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', margin: '2px 0' }}>
                        {r.range} <span style={{ fontSize: '12px', fontWeight: '400', color: '#95a5a6' }}>{r.unit}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#95a5a6', lineHeight: '1.4' }}>{r.desc}</div>
                </div>
            ))}
        </div>
      </section>

      {/* 4 Stats Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card-responsive" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px', padding: '20px', color: 'white' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Nutrisi NPK</div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {['N', 'P', 'K'].map(label => (
              <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px' }}>{label}</div>
                <div style={{ fontWeight: '700' }}>{latest?.[`${label.toLowerCase()}_val`] || 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-responsive" style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', borderRadius: '15px', padding: '20px', color: 'white' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>pH Tanah</div>
          <div style={{ fontSize: '36px', fontWeight: '700', margin: '5px 0' }}>{latest?.ph_val || '0.0'}</div>
          <div style={{ fontSize: '11px' }}>{latest?.ph_val < 6 ? "⚠️ Terlalu Asam" : "✅ Normal"}</div>
        </div>

        <div className="card-responsive" style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', borderRadius: '15px', padding: '20px', color: 'white' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Salinitas (EC)</div>
          <div style={{ fontSize: '36px', fontWeight: '700', margin: '5px 0' }}>{latest?.ec_val || '0.0'}</div>
          <div style={{ fontSize: '11px' }}>{latest?.ec_val > 2.0 ? "⚠️ Terlalu Pekat" : "✅ Normal"}</div>
        </div>

        <div className="card-responsive" style={{ background: 'linear-gradient(135deg, #45b7d1 0%, #0084ff 100%)', borderRadius: '15px', padding: '20px', color: 'white' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Kelembapan Tanah</div>
          <div style={{ fontSize: '36px', fontWeight: '700', margin: '5px 0' }}>{latest?.kelembapan_val || '0'}%</div>
          <div style={{ fontSize: '11px' }}>{latest?.kelembapan_val < 40 ? "🔴 Kering" : "🟢 Optimal"}</div>
        </div>
      </section>

      {/* Kontrol & Stok Terintegrasi */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Kontrol Card */}
        <div className="card-responsive" style={{ borderRadius: '15px', padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50' }}>⚙️ Kontrol & Kapasitas</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Manajemen fertigasi & level tandon</div>
          </div>

          {/* Stok Air */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>💧 Stok Air Tandon</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: latest?.water_level < 10 ? '#e74c3c' : '#27ae60' }}>{getWaterPercentage(latest?.water_level)}%</div>
            </div>
            <div style={{ backgroundColor: '#e0e0e0', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: latest?.water_level < 10 ? '#e74c3c' : '#3498db', height: '100%', width: `${getWaterPercentage(latest?.water_level)}%`, transition: 'width 1s' }} />
            </div>
          </div>

          {/* Switch 1: Pompa Air */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Pompa Air {pumpOn ? '🟢' : '⚪'}</div>
            <button onClick={() => handleToggleControl('air', pumpOn)} disabled={latest?.water_level < 5} style={{ width: '50px', height: '26px', borderRadius: '13px', border: 'none', backgroundColor: pumpOn ? '#27ae60' : '#bdc3c7', cursor: latest?.water_level < 5 ? 'not-allowed' : 'pointer', opacity: latest?.water_level < 5 ? 0.5 : 1, position: 'relative' }}>
              <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', top: '3px', left: pumpOn ? '27px' : '3px', transition: '0.3s' }} />
            </button>
          </div>

          {/* Switch 2: Pompa Pupuk */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Injeksi Pupuk {fertilizerOn ? '🟣' : '⚪'}</div>
            <button onClick={() => handleToggleControl('pupuk', fertilizerOn)} disabled={!pumpOn || latest?.water_level < 5} style={{ width: '50px', height: '26px', borderRadius: '13px', border: 'none', backgroundColor: fertilizerOn && pumpOn ? '#8e44ad' : '#bdc3c7', cursor: (!pumpOn || latest?.water_level < 5) ? 'not-allowed' : 'pointer', opacity: (!pumpOn || latest?.water_level < 5) ? 0.5 : 1, position: 'relative' }}>
              <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', top: '3px', left: fertilizerOn ? '27px' : '3px', transition: '0.3s' }} />
            </button>
          </div>
        </div>

        {/* AI Diagnosis */}
        <div className="card-responsive" style={{ borderRadius: '15px', padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>🤖 AI Diagnosis</div>
            <button onClick={() => navigate('/agronomis/analysis')} style={{ fontSize: '12px', fontWeight: '600', color: '#fff', backgroundColor: '#27ae60', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 2px 6px rgba(39, 174, 96, 0.3)' }} onMouseOver={(e) => e.target.style.backgroundColor = '#229954'} onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}>📊 Detail</button>
          </div>

          {/* Diagnosis Image Display */}
          {latest?.diagnosis_image ? (
            <div style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxHeight: '250px' }}>
              <img 
                src={latest.diagnosis_image} 
                alt="Diagnosis Result"
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  objectFit: 'cover',
                  maxHeight: '250px'
                }} 
              />
            </div>
          ) : (
            <div style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#f0f0f0', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>Belum ada foto diagnosis</div>
                <div style={{ fontSize: '11px', color: '#bbb', marginTop: '5px' }}>Upload foto untuk analisis AI</div>
              </div>
            </div>
          )}

          {/* Diagnosis Result */}
          <div style={{ backgroundColor: latest?.diagnosis === 'Sehat' ? '#e8f5e9' : '#fff3e0', padding: '20px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${latest?.diagnosis === 'Sehat' ? '#27ae60' : '#f39c12'}` }}>
            <div style={{ fontSize: '32px' }}>{latest?.diagnosis === 'Sehat' ? '🌿' : '⚠️'}</div>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>{latest?.diagnosis || 'Menunggu data...'}</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Akurasi: {(latest?.confidence * 100 || 0).toFixed(1)}%</div>
          </div>
        </div>
      </section>

      {/* Chart Tren */}
      <section style={{ borderRadius: '15px', padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>📊 Tren Parameter Tanah</div>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="time" fontSize={12} stroke="#999" />
              <YAxis fontSize={12} stroke="#999" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="soilMoisture" stroke="#1B5E20" name="Kelembapan" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="pH" stroke="#d9534f" name="pH" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="EC" stroke="#f39c12" name="EC" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage;