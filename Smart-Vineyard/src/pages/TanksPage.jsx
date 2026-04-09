import React, { useState, useEffect } from 'react';
import { getLatestSensorData } from '../services/sensorApi';

function TanksPage() {
  const [tankData, setTankData] = useState(null);
  const [history, setHistory] = useState([]); // Untuk tabel riwayat
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const perangkatId = "ESP32-MAC-A001";

  const fetchData = async () => {
    try {
      const result = await getLatestSensorData(perangkatId);
      if (result.status === 'success' && result.data && result.data.length > 0) {
        setTankData(result.data[0]); // Data terbaru untuk card
        setHistory(result.data);     // Semua data untuk tabel
        setError(null);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal menyambung ke server. Pastikan Backend aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fungsi hitung persentase yang aman
  const calculatePercentage = (height) => {
    if (height === undefined || height === null) return 0;
    const maxTinggi = 42;
    let percentage = (height / maxTinggi) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  if (loading) return <div className="page-shell u-p-20">🔄 Sedang memuat data tandon...</div>;
  if (error) return <div className="page-shell u-p-20 text-danger">❌ {error}</div>;

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Manajemen Tandon Air</div>
          <div className="page-caption">Monitoring Real-time Node: <strong>{perangkatId}</strong></div>
        </div>
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
              {/* Gunakan Optional Chaining (?.) agar tidak crash jika tankData null */}
              <div className="big-number">
                {calculatePercentage(tankData?.ketinggian_air)}%
              </div>
              <div className="small-text text-sm-muted">
                {tankData?.ketinggian_air?.toFixed(1) || '0'} / 42.0 cm
              </div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Kondisi</div>
              <div style={{ 
                color: tankData?.ketinggian_air < 10 ? '#e74c3c' : '#27ae60', 
                fontWeight: 'bold' 
              }}>
                {tankData?.ketinggian_air < 10 ? '⚠ KRITIS' : '✓ NORMAL'}
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
              <div className="big-number" style={{ fontSize: '1.8rem' }}>{tankData?.ph_val || '--'}</div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Kelembapan</div>
              <div className="big-number" style={{ fontSize: '1.8rem' }}>{tankData?.kelembapan_val || '--'}%</div>
            </div>
          </div>
        </div>

        {/* CARD INFO JADWAL */}
        <div className="card card-animate card-elevated">
          <div className="card-header"><div className="card-title">Status Pompa</div></div>
          <div className="u-p-15" style={{ textAlign: 'center' }}>
             <div className={`badge ${tankData?.kelembapan_val < 50 ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
                {tankData?.kelembapan_val < 50 ? 'POMPA NYALA 🟢' : 'POMPA MATI 🔴'}
             </div>
             <div className="small-text u-mt-10">Berdasarkan mode otomatis</div>
          </div>
        </div>
      </section>

      {/* TABEL HISTORI */}
      <section className="card card-elevated">
        <div className="card-header"><div className="card-title">10 Riwayat Terakhir</div></div>
        <div className="table-wrapper">
          <table className="table table-compact">
            <thead>
              <tr style={{ borderBottom: '2px solid #27ae60' }}>
                <th>Waktu</th>
                <th>Tinggi Air</th>
                <th>pH</th>
                <th>Kelembapan</th>
                <th>NPK</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.timestamp).toLocaleString('id-ID')}</td>
                  <td>{item.ketinggian_air} cm</td>
                  <td>{item.ph_val}</td>
                  <td>{item.kelembapan_val}%</td>
                  <td>{`${item.n_val}-${item.p_val}-${item.k_val}`}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data di database</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TanksPage;