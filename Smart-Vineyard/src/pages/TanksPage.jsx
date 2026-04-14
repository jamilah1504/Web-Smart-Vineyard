import React, { useState, useEffect } from 'react';
import { getLatestSensorData } from '../services/sensorApi';

function TanksPage() {
  const [tankData, setTankData] = useState(null);
  const [history, setHistory] = useState([]); // Untuk tabel riwayat
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const perangkatId = "ESP32-MAC-A001";

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const result = await getLatestSensorData(perangkatId);
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        setTankData(result.data[0]); // Data terbaru untuk card
        setHistory(result.data);     // Semua data untuk tabel
        setError(null);
      } else {
        setError("Tidak ada data dari server");
      }
    } catch (err) {
      console.error("🔴 Fetch Error:", err);
      setError("Gagal menyambung ke server. Pastikan Backend aktif.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // Fungsi hitung persentase yang aman
  const calculatePercentage = (height) => {
    if (height === undefined || height === null) return 0;
    const maxTinggi = 42;
    let percentage = (height / maxTinggi) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  if (loading) {
    return (
      <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳ Sedang memuat data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="alert alert-danger" style={{ margin: '1rem' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="page-header u-mb-15" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title page-title-lg">🏗️ Manajemen Tandon Air</div>
          <div className="page-caption">Monitoring Real-time Node: <strong>{perangkatId}</strong></div>
        </div>
        <button 
          onClick={() => fetchData(true)} 
          disabled={refreshing}
          className="btn-primary btn-pill-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          {refreshing ? '⏳ Memuat...' : '🔄 Refresh'}
        </button>
      </div>

      <section className="card-grid-3 u-mb-1">
        {/* CARD TANDON UTAMA */}
        <div className="card card-animate card-elevated">
          <div className="card-header">
            <div className="card-title">Tandon Utama</div>
          </div>
          <div className="simple-card-list">
            <div className="small-stat">
              <div className="small-text text-sm-muted">Level Air</div>
              <div className="big-number">
                {tankData && tankData.ketinggian_air !== undefined && tankData.ketinggian_air !== null 
                  ? calculatePercentage(tankData.ketinggian_air)
                  : '--'}%
              </div>
              <div className="small-text text-sm-muted">
                {tankData && tankData.ketinggian_air !== undefined && tankData.ketinggian_air !== null
                  ? `${parseFloat(tankData.ketinggian_air).toFixed(2)} / 42.0 cm`
                  : '-- / 42.0 cm'}
              </div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Kondisi</div>
              <div style={{ 
                color: (tankData?.ketinggian_air || 0) < 10 ? '#e74c3c' : '#27ae60', 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                {(tankData?.ketinggian_air || 0) < 10 ? '⚠️ KRITIS' : '✅ NORMAL'}
              </div>
            </div>
          </div>
        </div>

        {/* CARD NUTRISI TANAH */}
        <div className="card card-animate card-elevated">
          <div className="card-header"><div className="card-title">Nutrisi Terkini</div></div>
          <div className="simple-card-list">
            <div className="small-stat">
              <div className="small-text text-sm-muted">pH Tanah</div>
              <div className="big-number" style={{ fontSize: '1.8rem' }}>
                {tankData?.ph_val !== undefined && tankData?.ph_val !== null ? tankData.ph_val : '--'}
              </div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Kelembapan</div>
              <div className="big-number" style={{ fontSize: '1.8rem' }}>
                {tankData?.kelembapan_val !== undefined && tankData?.kelembapan_val !== null 
                  ? tankData.kelembapan_val 
                  : '--'}%
              </div>
            </div>
          </div>
        </div>

        {/* CARD INFO JADWAL */}
        <div className="card card-animate card-elevated">
          <div className="card-header"><div className="card-title">Status Pompa</div></div>
          <div className="u-p-15" style={{ textAlign: 'center' }}>
             <div className={`badge ${(tankData?.kelembapan_val || 100) < 50 ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
                {(tankData?.kelembapan_val || 100) < 50 ? '🟢 POMPA NYALA' : '🔴 POMPA MATI'}
             </div>
             <div className="small-text u-mt-10">Berdasarkan mode otomatis</div>
          </div>
        </div>
      </section>

      {/* TABEL HISTORI */}
      <section className="card card-elevated">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">10 Riwayat Terakhir</div>
          <span className="small-text text-sm-muted">{history.length} records</span>
        </div>
        <div className="table-wrapper">
          {history.length > 0 ? (
            <table className="table table-compact">
              <thead>
                <tr style={{ borderBottom: '2px solid #27ae60' }}>
                  <th>Waktu</th>
                  <th>Tinggi Air (cm)</th>
                  <th>pH</th>
                  <th>Kelembapan (%)</th>
                  <th>N-P-K</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '0.9rem' }}>
                      {item.timestamp 
                        ? new Date(item.timestamp).toLocaleString('id-ID')
                        : '--'
                      }
                    </td>
                    <td style={{ fontWeight: '500' }}>
                      {item.ketinggian_air !== undefined && item.ketinggian_air !== null
                        ? parseFloat(item.ketinggian_air).toFixed(2)
                        : '--'
                      }
                    </td>
                    <td>
                      {item.ph_val !== undefined && item.ph_val !== null
                        ? parseFloat(item.ph_val).toFixed(2)
                        : '--'
                      }
                    </td>
                    <td>
                      {item.kelembapan_val !== undefined && item.kelembapan_val !== null
                        ? parseInt(item.kelembapan_val)
                        : '--'
                      }
                    </td>
                    <td>
                      {(item.n_val !== undefined && item.n_val !== null) &&
                       (item.p_val !== undefined && item.p_val !== null) &&
                       (item.k_val !== undefined && item.k_val !== null)
                        ? `${parseInt(item.n_val)}-${parseInt(item.p_val)}-${parseInt(item.k_val)}`
                        : '--'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              Belum ada data di database
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default TanksPage;