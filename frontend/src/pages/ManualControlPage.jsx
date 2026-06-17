import { useState, useEffect } from 'react';
import { getAllDevices, updateDeviceState, getDeviceStatus } from '../services/controlApi';


function OwnerManualControlPage() {
  const [deviceId, setDeviceId] = useState(null);
  const [pumpAir, setPumpAir] = useState(false);
  const [pumpPupuk, setPumpPupuk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState('Online');
  const [offlineAlertShown, setOfflineAlertShown] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Mengambil status awal perangkat saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const response = await getAllDevices();
        if (response.data && response.data.length > 0) {
          // Ambil perangkat pertama (misal: ESP32-MAC-A001)
          const device = response.data[0];
          setDeviceId(device.id);
          
          // Tarik status lengkap dari API getDeviceStatus untuk mendapat mode_kerja
          try {
            const deviceStatusResponse = await getDeviceStatus(device.id);
            const fullDevice = deviceStatusResponse.data || device;
            
            console.log(`📡 Status perangkat dari API:`, fullDevice);
            
            // Set status toggle sesuai dengan data di database
            setPumpAir(fullDevice.status_pompa_air || false);
            setPumpPupuk(fullDevice.status_pompa_pupuk || false);
            
            // 🌟 NEW: Track device connection status
            setDeviceStatus(fullDevice.status_koneksi || 'Online');
            
            // ✅ PERBAIKAN: Load mode_kerja dari database dan convert ke boolean
            const modeFromDb = fullDevice.mode_kerja?.toLowerCase() || 'manual';
            setAutoMode(modeFromDb === 'auto');
            console.log(`🤖 Mode kerja dari database: "${modeFromDb}" → autoMode: ${modeFromDb === 'auto'}`);
            console.log(`📡 Status koneksi: ${fullDevice.status_koneksi}`);
          } catch (statusError) {
            // Fallback jika getDeviceStatus gagal
            console.warn("⚠️ getDeviceStatus gagal, gunakan data dari getAllDevices:", statusError);
            setPumpAir(device.status_pompa_air || false);
            setPumpPupuk(device.status_pompa_pupuk || false);
            setAutoMode(device.mode_kerja?.toLowerCase() === 'auto' || false);
            setDeviceStatus(device.status_koneksi || 'Online');
          }
        }
      } catch (error) {
        console.error("🔴 Gagal mengambil data perangkat:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialStatus();
  }, []);

  // 2. Auto-refresh status SETIAP 2 DETIK untuk selalu sync dengan backend
  // (Penting jika pompa otomatis mati dari sisi backend/ESP32)
  useEffect(() => {
    if (!deviceId) return;

    const refreshStatus = async () => {
      try {
        const response = await getDeviceStatus(deviceId);
        const device = response.data;
        
        // Sinkronisasi status dari database tanpa mengganggu interaksi user
        setPumpAir(device.status_pompa_air || false);
        setPumpPupuk(device.status_pompa_pupuk || false);
        
        const modeFromDb = device.mode_kerja?.toLowerCase() || 'manual';
        setAutoMode(modeFromDb === 'auto');
        
        // 🌟 NEW: Track perubahan status koneksi
        const prevStatus = deviceStatus;
        setDeviceStatus(device.status_koneksi || 'Online');
        
        // 🌟 NEW: Tampil notifikasi jika device berubah status jadi offline
        if (device.status_koneksi !== 'Online' && !offlineAlertShown) {
          alert(`⚠️ ALERT: Perangkat sedang ${device.status_koneksi}. Kontrol manual tidak tersedia.`);
          setOfflineAlertShown(true);
        }
        
        // Reset alert jika device kembali online
        if (device.status_koneksi === 'Online' && offlineAlertShown) {
          setOfflineAlertShown(false);
        }
        
        console.log(`🔄 [Real-time sync] Status: ${device.status_koneksi}, Pompa Air: ${device.status_pompa_air}, Pompa Pupuk: ${device.status_pompa_pupuk}`);
      } catch (error) {
        console.warn("⚠️ Real-time sync gagal:", error.message);
      }
    };

    // Refresh setiap 3 detik untuk catching perubahan status dan pompa otomatis
    const intervalId = setInterval(refreshStatus, 3000);
    return () => clearInterval(intervalId);
  }, [deviceId, offlineAlertShown, deviceStatus]);

// 1. Fungsi Menyalakan/Mematikan Pompa Irigasi (Air)
  const togglePumpAir = async () => {
    if (!deviceId) return alert("Sistem masih memuat data perangkat...");
    
    // 🌟 NEW: Check jika device offline
    if (deviceStatus !== 'Online') {
      alert(`❌ Perangkat sedang ${deviceStatus}. Kontrol manual tidak tersedia.\n\nHubungkan perangkat ke internet terlebih dahulu.`);
      return;
    }
    
    const targetStatus = !pumpAir;
    setLoading(true);

    try {
      console.log(`💧 Mengirim status_pompa_air: ${targetStatus} ke perangkat: ${deviceId}`);
      // Kirim key 'status_pompa_air' sesuai ekspektasi req.body di Controller
      const response = await updateDeviceState(deviceId, { status_pompa_air: targetStatus });
      console.log(`✅ Response dari backend:`, response);
      setPumpAir(targetStatus); // Update UI optimistic
      
      // Refresh status dari backend setelah 500ms untuk confirm perubahan
      setTimeout(async () => {
        try {
          const statusResponse = await getDeviceStatus(deviceId);
          const device = statusResponse.data;
          setPumpAir(device.status_pompa_air || false);
          console.log(`🔄 Status terkini dari database: ${device.status_pompa_air}`);
        } catch (err) {
          console.warn("⚠️ Refresh setelah toggle gagal:", err.message);
        }
      }, 500);
      
      console.log(`✅ Pompa Air ${targetStatus ? 'NYALA' : 'MATI'}`);
    } catch (error) {
      console.error(`❌ Error updateDeviceState:`, error);
      // Backend Anda mengirim pesan error jika tandon kosong (< 10 cm)
      const errorMsg = error.response?.data?.message || error.message;
      alert("❌ Gagal mengontrol pompa irigasi: " + errorMsg);
      // Revert state jika gagal
      setPumpAir(!targetStatus);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Menyalakan/Mematikan Pompa Pupuk
  const togglePumpPupuk = async () => {
    if (!deviceId) return alert("Sistem masih memuat data perangkat...");
    
    // 🌟 NEW: Check jika device offline
    if (deviceStatus !== 'Online') {
      alert(`❌ Perangkat sedang ${deviceStatus}. Kontrol manual tidak tersedia.\n\nHubungkan perangkat ke internet terlebih dahulu.`);
      return;
    }
    
    const targetStatus = !pumpPupuk;
    setLoading(true);

    try {
      console.log(`🧪 Mengirim status_pompa_pupuk: ${targetStatus} ke perangkat: ${deviceId}`);
      // Kirim key 'status_pompa_pupuk' sesuai ekspektasi req.body di Controller
      const response = await updateDeviceState(deviceId, { status_pompa_pupuk: targetStatus });
      console.log(`✅ Response dari backend:`, response);
      setPumpPupuk(targetStatus); // Update UI optimistic
      
      // Refresh status dari backend setelah 500ms untuk confirm perubahan
      setTimeout(async () => {
        try {
          const statusResponse = await getDeviceStatus(deviceId);
          const device = statusResponse.data;
          setPumpPupuk(device.status_pompa_pupuk || false);
          console.log(`🔄 Status terkini dari database: ${device.status_pompa_pupuk}`);
        } catch (err) {
          console.warn("⚠️ Refresh setelah toggle gagal:", err.message);
        }
      }, 500);
      
      console.log(`✅ Pompa Pupuk ${targetStatus ? 'NYALA' : 'MATI'}`);
    } catch (error) {
      console.error(`❌ Error updateDeviceState:`, error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("❌ Gagal mengontrol pompa pupuk: " + errorMsg);
      setPumpPupuk(!targetStatus);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Toggle Mode Otomatis
const toggleAutoMode = async () => {
    if (!deviceId) return alert("Sistem masih memuat data perangkat...");
    
    // 🌟 NEW: Check jika device offline
    if (deviceStatus !== 'Online') {
      alert(`❌ Perangkat sedang ${deviceStatus}. Kontrol manual tidak tersedia.\n\nHubungkan perangkat ke internet terlebih dahulu.`);
      return;
    }

    const targetMode = !autoMode;
    // Sesuaikan persis dengan ENUM di database (huruf kecil)
    const modeString = targetMode ? 'auto' : 'manual'; 
    
    setLoading(true);

    try {
      console.log(`🤖 Mengirim mode_kerja: "${modeString}" ke perangkat: ${deviceId}`);
      const response = await updateDeviceState(deviceId, { mode_kerja: modeString });
      console.log(`✅ Response dari backend:`, response);
      
      setAutoMode(targetMode); // Update UI optimistic
      
      // Refresh status dari backend setelah 500ms untuk confirm perubahan
      setTimeout(async () => {
        try {
          const statusResponse = await getDeviceStatus(deviceId);
          const device = statusResponse.data;
          const modeFromDb = device.mode_kerja?.toLowerCase() || 'manual';
          setAutoMode(modeFromDb === 'auto');
          console.log(`🔄 Status terkini dari database: mode_kerja = "${modeFromDb}"`);
        } catch (err) {
          console.warn("⚠️ Refresh setelah toggle gagal:", err.message);
        }
      }, 500);
      
      console.log(targetMode ? '✅ Mode auto Diaktifkan' : '✅ Mode manual Diaktifkan');
    } catch (error) {
      console.error(`❌ Error toggleAutoMode:`, error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("❌ Gagal mengubah mode: " + errorMsg);
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

      {/* LOADING STATE INDICATOR */}
      {initialLoading && (
        <div style={{
          marginBottom: '20px',
          backgroundColor: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#1565c0',
          animation: 'pulse 1.5s infinite'
        }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <div>
            <strong>Memuat status perangkat...</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              Sinkronisasi dengan database untuk mendapatkan status terkini (mode auto/manual, pompa)
            </p>
          </div>
        </div>
      )}

      {/* 🌟 NEW: DEVICE OFFLINE WARNING BANNER */}
      {deviceStatus !== 'Online' && (
        <div style={{
          marginBottom: '20px',
          backgroundColor: '#fff3cd',
          border: '3px solid #ff6b6b',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#7f2a1b',
          animation: 'pulse 1s infinite'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <strong style={{ fontSize: '1.1rem' }}>Status: Perangkat {deviceStatus}</strong>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem' }}>
              Perangkat IoT tidak terhubung ke internet. Kontrol manual tidak tersedia saat ini. Hubungkan perangkat ke jaringan untuk melanjutkan.
            </p>
          </div>
        </div>
      )}

      {/* MODE OTOMATIS SECTION */}
      <div className="responsive-mode-banner" style={{
        marginBottom: '40px',
        background: autoMode 
          ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
          : 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
        borderRadius: '16px',
        padding: windowWidth < 576 ? '16px' : '24px',
        border: `3px solid ${autoMode ? '#28a745' : '#ffc107'}`,
        boxShadow: `0 6px 20px ${autoMode ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)'}`,
        animation: 'slideIn 0.5s ease-out'
      }}>
        <div className="responsive-mode-banner-content">
          <div style={{
            fontSize: windowWidth < 576 ? '1.1rem' : '1.3rem',
            fontWeight: '700',
            color: autoMode ? '#155724' : '#856404',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {autoMode ? '🤖 Mode Otomatis AKTIF' : '🕹️ Mode Manual AKTIF'}
          </div>
          <p style={{
            fontSize: '0.95rem',
            color: autoMode ? '#0c5460' : '#7a6e2e',
            margin: 0,
            fontWeight: '500'
          }}>
            {autoMode
              ? 'Sistem berjalan otomatis berdasarkan sensor. Kontrol manual dinonaktifkan.'
              : 'Anda sedang mengendalikan sistem secara manual. Klik tombol untuk mengaktifkan mode otomatis.'}
          </p>
        </div>
        <button
          className="responsive-mode-banner-btn"
          onClick={() => toggleAutoMode()}
          disabled={loading || !deviceId || deviceStatus !== 'Online'}
          style={{
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: autoMode ? '#28a745' : '#ffc107',
            color: autoMode ? '#fff' : '#000',
            fontWeight: '700',
            fontSize: windowWidth < 576 ? '0.9rem' : '1rem',
            cursor: (loading || deviceStatus !== 'Online') ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 12px ${autoMode ? 'rgba(40, 167, 69, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
            opacity: (loading || deviceStatus !== 'Online') ? 0.6 : 1,
            marginLeft: windowWidth < 576 ? 0 : '20px'
          }}
          onMouseOver={(e) => {
            if (!loading && deviceStatus === 'Online') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 16px ${autoMode ? 'rgba(40, 167, 69, 0.4)' : 'rgba(255, 193, 7, 0.4)'}`;
            }
          }}
          onMouseOut={(e) => {
            if (!loading && deviceStatus === 'Online') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 4px 12px ${autoMode ? 'rgba(40, 167, 69, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`;
            }
          }}
          title={deviceStatus !== 'Online' ? `Perangkat ${deviceStatus} - Fitur tidak tersedia` : ''}
        >
          {loading ? '⏱️ Memproses...' : (autoMode ? '✅ Matikan Otomatis' : '🤖 Aktifkan Otomatis')}
        </button>
      </div>

      {/* POMPA CONTROLS DISABLED WARNING */}
      {autoMode && (
        <div style={{
          marginBottom: '30px',
          backgroundColor: '#e7f3ff',
          border: '2px solid #3498db',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#0c5460'
        }}>
          <span style={{ fontSize: '20px' }}>ℹ️</span>
          <div>
            <strong>Mode Otomatis Aktif</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              Kontrol manual pompa sedang dinonaktifkan. Tombol di bawah hanya untuk referensi status saja.
            </p>
          </div>
        </div>
      )}

      {/* PUMP CONTROLS SECTION */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#27ae60', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          💧 Pompa Irigasi
        </h2>
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
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
                {deviceStatus === 'Online' ? (pumpAir ? '▶ Arus daya mengalir' : '• Standby') : `⚠️ ${deviceStatus}`}
              </p>
            </div>

            <button
              onClick={() => togglePumpAir()}
              disabled={loading || !deviceId || autoMode || deviceStatus !== 'Online'}
              className={`toggle-switch ${pumpAir ? 'active' : 'inactive'}`}
              style={{ 
                marginBottom: '10px', 
                opacity: (autoMode || deviceStatus !== 'Online') ? 0.5 : 1 
              }}
              title={
                deviceStatus !== 'Online' 
                  ? `Perangkat ${deviceStatus} - Kontrol tidak tersedia` 
                  : (autoMode ? 'Kontrol dinonaktifkan - Mode Otomatis aktif' : '')
              }
            >
              {loading ? '⏱️ Memproses...' : (pumpAir ? '⏹️ Matikan Pompa' : '▶️ Nyalakan Pompa')}
            </button>
            {/* <button style={{
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
            </button> */}
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
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
                {deviceStatus === 'Online' ? (pumpPupuk ? '▶ Arus daya mengalir' : '• Standby') : `⚠️ ${deviceStatus}`}
              </p>
            </div>

            <button
              onClick={() => togglePumpPupuk()}
              disabled={loading || !deviceId || autoMode || deviceStatus !== 'Online'}
              className={`toggle-switch ${pumpPupuk ? 'active' : 'inactive'}`}
              style={{ 
                marginBottom: '10px', 
                opacity: (autoMode || deviceStatus !== 'Online') ? 0.5 : 1 
              }}
              title={
                deviceStatus !== 'Online' 
                  ? `Perangkat ${deviceStatus} - Kontrol tidak tersedia` 
                  : (autoMode ? 'Kontrol dinonaktifkan - Mode Otomatis aktif' : '')
              }
            >
              {loading ? '⏱️ Memproses...' : (pumpPupuk ? '⏹️ Matikan Pompa' : '▶️ Nyalakan Pompa')}
            </button>
            {/* <button style={{
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
            </button> */}
          </div>
        </section>
      </div>

      {/* SYSTEM CONTROLS SECTION */}
      {/* <div>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
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
      </div> */}
      </div>
    </div>
  );
}

export default OwnerManualControlPage;