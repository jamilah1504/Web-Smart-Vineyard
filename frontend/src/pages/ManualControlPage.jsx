import { useState, useEffect } from 'react';
// Pastikan path import ini sesuai dengan lokasi file services kamu
import { getAllDevices, controlPump } from '../services/controlApi';

function OwnerManualControlPage() {
  const [deviceId, setDeviceId] = useState(null);
  const [pumpAir, setPumpAir] = useState(false);
  const [pumpPupuk, setPumpPupuk] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Mengambil status awal perangkat saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const response = await getAllDevices();
        if (response.data && response.data.length > 0) {
          // Ambil perangkat pertama (misal: ESP32-MAC-A001)
          const device = response.data[0];
          setDeviceId(device.id);
          
          // Set status toggle sesuai dengan data di database
          setPumpAir(device.status_pompa_air || false);
          setPumpPupuk(device.status_pompa_pupuk || false);
        }
      } catch (error) {
        console.error("🔴 Gagal mengambil data perangkat:", error);
      }
    };

    fetchInitialStatus();
  }, []);

  // 2. Fungsi Menyalakan/Mematikan Pompa Irigasi (Air)
  const togglePumpAir = async () => {
    if (!deviceId) return alert("Sistem masih memuat data perangkat...");
    
    const targetStatus = !pumpAir; // Kebalikan dari status saat ini
    setLoading(true);

    try {
      // Panggil API Backend (perangkat_id, pompa_type, status)
      await controlPump(deviceId, 'air', targetStatus);
      setPumpAir(targetStatus); // Update UI jika sukses
    } catch (error) {
      alert("❌ Gagal mengontrol pompa irigasi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Menyalakan/Mematikan Pompa Pupuk
  const togglePumpPupuk = async () => {
    if (!deviceId) return alert("Sistem masih memuat data perangkat...");
    
    const targetStatus = !pumpPupuk;
    setLoading(true);

    try {
      // Panggil API Backend
      await controlPump(deviceId, 'nutrisi', targetStatus);
      setPumpPupuk(targetStatus); // Update UI jika sukses
    } catch (error) {
      alert("❌ Gagal mengontrol pompa pupuk: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      padding: '0',
      margin: '0'
    }}>
      <div style={{ padding: '30px 20px' }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .card-responsive {
          animation: slideIn 0.5s ease-out;
          transition: all 0.3s ease;
        }
        .card-responsive:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 15px;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-active {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-inactive {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .toggle-switch {
          width: 100%;
          padding: 14px 16px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 700;
          color: white;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .toggle-switch:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .toggle-switch.active {
          background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
        }
        .toggle-switch.inactive {
          background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        }
      `}</style>

      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">⚙️ Kontrol Manual Sistem</div>
          <div className="page-caption page-caption-lg">
            Kelola pompa irigasi, solenoid valve, dan perangkat sistem secara real-time
          </div>
        </div>
      </div>

      {/* PUMP CONTROLS SECTION */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#27ae60', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          💧 Pompa Irigasi
        </h2>
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Pump */}
          <div className="card-responsive" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 6px 20px rgba(39, 174, 96, 0.12)',
            border: '2px solid #e8f8f5',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, #27ae60 0%, #1e8449 100%)'
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                  Pompa Irigasi
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '6px 0 0 0', fontWeight: '500' }}>
                  Sistem Irigasi Utama
                </p>
              </div>
              <span className={`status-badge ${pumpAir ? 'status-active' : 'status-inactive'}`}>
                {pumpAir ? '⚡ Aktif' : '⏸ Mati'}
              </span>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
            }}>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0, marginBottom: '8px', fontWeight: '600' }}>
                Status Koneksi
              </p>
              <p style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                {deviceId ? deviceId : 'Menghubungkan...'}
              </p>
              <p style={{ fontSize: '0.8rem', opacity: 0.85, margin: '8px 0 0 0' }}>
                {pumpAir ? '▶ Arus daya mengalir' : '• Standby'}
              </p>
            </div>

            <button
              onClick={() => togglePumpAir()}
              disabled={loading || !deviceId}
              className={`toggle-switch ${pumpAir ? 'active' : 'inactive'}`}
              style={{ marginBottom: '10px' }}
            >
              {loading ? '⏱️ Memproses...' : (pumpAir ? '⏹️ Matikan Pompa' : '▶️ Nyalakan Pompa')}
            </button>
            <button style={{
              width: '100%', padding: '12px 16px', backgroundColor: '#3498db',
              color: 'white', border: 'none', borderRadius: '10px',
              fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease',
              fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#2980b9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = '#3498db';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
            }}
            >
              ⏱️ Atur Durasi
            </button>
          </div>
        </section>
      </div>

      {/* POMPA PUPUK CONTROLS SECTION */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#e67e22', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🧪 Pompa Pupuk
        </h2>
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Pompa Pupuk */}
          <div className="card-responsive" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 6px 20px rgba(230, 126, 34, 0.12)',
            border: '2px solid #fdebd0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, #e67e22 0%, #d35400 100%)'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                  Pompa Pupuk
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '6px 0 0 0', fontWeight: '500' }}>
                  Tandon Pupuk (Nutrisi)
                </p>
              </div>
              <span className={`status-badge ${pumpPupuk ? 'status-active' : 'status-inactive'}`}>
                {pumpPupuk ? '⚡ Aktif' : '⏸ Mati'}
              </span>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)'
            }}>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0, marginBottom: '8px', fontWeight: '600' }}>
                Status Koneksi
              </p>
              <p style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                {deviceId ? deviceId : 'Menghubungkan...'}
              </p>
              <p style={{ fontSize: '0.8rem', opacity: 0.85, margin: '8px 0 0 0' }}>
                {pumpPupuk ? '▶ Arus daya mengalir' : '• Standby'}
              </p>
            </div>

            <button
              onClick={() => togglePumpPupuk()}
              disabled={loading || !deviceId}
              className={`toggle-switch ${pumpPupuk ? 'active' : 'inactive'}`}
              style={{ marginBottom: '10px' }}
            >
              {loading ? '⏱️ Memproses...' : (pumpPupuk ? '⏹️ Matikan Pompa' : '▶️ Nyalakan Pompa')}
            </button>
            <button style={{
              width: '100%', padding: '12px 16px', backgroundColor: '#3498db',
              color: 'white', border: 'none', borderRadius: '10px',
              fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease',
              fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#2980b9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = '#3498db';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
            }}
            >
              ⏱️ Atur Durasi
            </button>
          </div>
        </section>
      </div>

      {/* SYSTEM CONTROLS SECTION */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f39c12', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ⚡ Kontrol Sistem
        </h2>
        <section style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
          border: '2px solid #ecf0f1'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            <div className="card-responsive" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px', background: 'linear-gradient(135deg, #ebf5fb 0%, #d6eaf8 100%)',
              borderRadius: '12px', borderLeft: '5px solid #3498db'
            }}>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                  🔄 Kalibrasi Sensor A
                </p>
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d', margin: '6px 0 0 0', fontWeight: '500' }}>
                  Reset pembacaan sensor
                </p>
              </div>
              <button style={{
                padding: '10px 18px', backgroundColor: '#3498db', color: 'white', border: 'none',
                borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease',
                fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)', whiteSpace: 'nowrap'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
              }}
              >
                Reset
              </button>
            </div>

            <div className="card-responsive" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px', background: 'linear-gradient(135deg, #ebf5fb 0%, #d6eaf8 100%)',
              borderRadius: '12px', borderLeft: '5px solid #3498db'
            }}>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                  🔄 Kalibrasi Sensor B
                </p>
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d', margin: '6px 0 0 0', fontWeight: '500' }}>
                  Reset pembacaan sensor
                </p>
              </div>
              <button style={{
                padding: '10px 18px', backgroundColor: '#3498db', color: 'white', border: 'none',
                borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease',
                fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)', whiteSpace: 'nowrap'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
              }}
              >
                Reset
              </button>
            </div>

            <div className="card-responsive" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '12px', borderLeft: '5px solid #e74c3c'
            }}>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                  🔌 Restart Sistem
                </p>
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d', margin: '6px 0 0 0', fontWeight: '500' }}>
                  Mulai ulang IoT Hub
                </p>
              </div>
              <button style={{
                padding: '10px 18px', backgroundColor: '#e74c3c', color: 'white', border: 'none',
                borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease',
                fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)', whiteSpace: 'nowrap'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#c0392b';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(231, 76, 60, 0.4)';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = '#e74c3c';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
              }}
              >
                Restart
              </button>
            </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}

export default OwnerManualControlPage;