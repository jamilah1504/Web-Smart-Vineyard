import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { animate } from 'animejs'
import { getDashboardSummary } from '../services/dashboardApi' 
import { updatePumpStatus } from '../services/controlApi'
import { useAuth } from '../core/auth/AuthContext.jsx'
import { OwnerPaths, AgronomisPaths } from '../routes/routePaths'

function getDiagnosisPath(role) {
  const r = role?.toLowerCase()
  if (r === 'agronomis') return AgronomisPaths.analysis
  return OwnerPaths.analysis
}

function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
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

  const TANK_MAX_CM = 42;

  const getWaterPercentage = (val) => {
    const height = parseFloat(val) || 0;
    return Math.min(100, Math.max(0, Math.round((height / TANK_MAX_CM) * 100)));
  };

  const getWaterStatus = (val) => {
    const cm = parseFloat(val) || 0;
    if (cm < 10) return { label: 'Kritis', color: '#e74c3c', bg: '#fff5f5', border: '#fecaca' };
    if (cm < 20) return { label: 'Rendah', color: '#f39c12', bg: '#fffbeb', border: '#fde68a' };
    return { label: 'Aman', color: '#27ae60', bg: '#f0fdf4', border: '#bbf7d0' };
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
        {(() => {
          const waterPct = getWaterPercentage(latest?.water_level);
          const waterCm = parseFloat(latest?.water_level) || 0;
          const waterStatus = getWaterStatus(latest?.water_level);
          const pumpDisabled = waterCm < 5;
          const fertDisabled = !pumpOn || waterCm < 5;

          return (
            <div className="card-responsive" style={{ borderRadius: '15px', padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: '16px' }}>⚙️</span>
                  Kontrol & Kapasitas
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px', marginLeft: '40px' }}>Manajemen fertigasi & level tandon</div>
              </div>

              {/* Visual Tandon + Ringkasan */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flex: 1, minHeight: '140px' }}>
                {/* Tank Visual */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <div style={{ position: 'relative', width: '72px', height: '130px', borderRadius: '12px 12px 8px 8px', border: '3px solid #cbd5e1', background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)', overflow: 'hidden', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: `${waterPct}%`,
                      background: waterCm < 10
                        ? 'linear-gradient(180deg, #fca5a5 0%, #e74c3c 100%)'
                        : 'linear-gradient(180deg, #7dd3fc 0%, #3498db 100%)',
                      transition: 'height 1s ease',
                      borderRadius: '0 0 5px 5px',
                    }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: waterPct > 40 ? '#fff' : '#334155', textShadow: waterPct > 40 ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>
                        {waterPct}%
                      </span>
                    </div>
                    {/* Garis skala */}
                    {[25, 50, 75].map(mark => (
                      <div key={mark} style={{ position: 'absolute', left: 0, right: 0, bottom: `${mark}%`, borderTop: '1px dashed rgba(148,163,184,0.5)', zIndex: 0 }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>0 — {TANK_MAX_CM} cm</div>
                </div>

                {/* Info Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '14px', borderRadius: '12px', background: waterStatus.bg, border: `1px solid ${waterStatus.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>💧 Stok Air Tandon</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: waterStatus.color, backgroundColor: '#fff', padding: '2px 8px', borderRadius: '20px' }}>{waterStatus.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '28px', fontWeight: '800', color: waterStatus.color, lineHeight: 1 }}>{waterCm.toFixed(1)}</span>
                      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>cm / {TANK_MAX_CM} cm</span>
                    </div>
                    <div style={{ backgroundColor: '#e2e8f0', borderRadius: '20px', height: '8px', overflow: 'hidden', marginTop: '10px' }}>
                      <div style={{ backgroundColor: waterStatus.color, height: '100%', width: `${waterPct}%`, transition: 'width 1s', borderRadius: '20px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flex: 1 }}>
                    {[
                      { icon: '💧', label: 'Pompa Air', on: pumpOn, color: '#27ae60' },
                      { icon: '🧪', label: 'Injeksi Pupuk', on: fertilizerOn && pumpOn, color: '#8e44ad' },
                      { icon: '🌱', label: 'Kelembapan', value: `${latest?.kelembapan_val || 0}%`, color: '#3498db' },
                      { icon: '📏', label: 'Kapasitas', value: `${waterPct}%`, color: '#764ba2' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', marginBottom: '2px' }}>{item.icon} {item.label}</div>
                        {item.value !== undefined ? (
                          <div style={{ fontSize: '14px', fontWeight: '700', color: item.color }}>{item.value}</div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: item.on ? item.color : '#cbd5e1', boxShadow: item.on ? `0 0 6px ${item.color}` : 'none' }} />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: item.on ? item.color : '#94a3b8' }}>{item.on ? 'Aktif' : 'Mati'}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kontrol Switch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {[
                  { type: 'air', label: 'Pompa Air', desc: 'Sirkulasi air ke sistem irigasi', on: pumpOn, color: '#27ae60', disabled: pumpDisabled, warn: pumpDisabled ? 'Level air terlalu rendah' : null },
                  { type: 'pupuk', label: 'Injeksi Pupuk', desc: 'Pemberian nutrisi larutan pupuk', on: fertilizerOn, color: '#8e44ad', disabled: fertDisabled, warn: !pumpOn ? 'Aktifkan pompa air terlebih dahulu' : pumpDisabled ? 'Level air terlalu rendah' : null },
                ].map(ctrl => (
                  <div key={ctrl.type} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', borderRadius: '12px',
                    backgroundColor: ctrl.on ? `${ctrl.color}08` : '#f8fafc',
                    border: `1px solid ${ctrl.on ? `${ctrl.color}30` : '#e2e8f0'}`,
                    opacity: ctrl.disabled ? 0.65 : 1,
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{ctrl.label}</div>
                      <div style={{ fontSize: '10px', color: ctrl.warn ? '#e74c3c' : '#94a3b8', marginTop: '2px' }}>
                        {ctrl.warn || ctrl.desc}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleControl(ctrl.type, ctrl.on)}
                      disabled={ctrl.disabled}
                      style={{
                        width: '50px', height: '26px', borderRadius: '13px', border: 'none', flexShrink: 0,
                        backgroundColor: ctrl.on ? ctrl.color : '#cbd5e1',
                        cursor: ctrl.disabled ? 'not-allowed' : 'pointer',
                        position: 'relative', transition: 'background-color 0.3s',
                      }}
                    >
                      <div style={{
                        position: 'absolute', width: '20px', height: '20px', borderRadius: '50%',
                        backgroundColor: '#fff', top: '3px', left: ctrl.on ? '27px' : '3px',
                        transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer Status Bar */}
              <div style={{
                marginTop: 'auto', padding: '10px 14px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  <strong style={{ color: '#334155' }}>Mode:</strong> Manual
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Sistem: <strong style={{ color: pumpOn || fertilizerOn ? '#27ae60' : '#94a3b8' }}>
                    {pumpOn || fertilizerOn ? '● Beroperasi' : '○ Standby'}
                  </strong>
                </div>
              </div>
            </div>
          );
        })()}

        {/* AI Diagnosis */}
        <div className="card-responsive" style={{ borderRadius: '15px', padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>🤖 AI Diagnosis</div>
            <button
              onClick={() => navigate(getDiagnosisPath(currentUser?.role))}
              style={{ fontSize: '12px', fontWeight: '600', color: '#fff', backgroundColor: '#27ae60', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 2px 6px rgba(39, 174, 96, 0.3)' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#229954' }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#27ae60' }}
            >
              📊 Detail
            </button>
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