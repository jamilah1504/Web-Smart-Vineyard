import React, { useState, useEffect } from 'react';
import { getLatestSensorData } from '../services/sensorApi';

function TanksPage() {
  const [tankData, setTankData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const perangkatId = "ESP32-MAC-A001";
  const MAX_TINGGI_TANDON = 42; // Tinggi maksimal tandon kamu dalam cm

  const fetchData = async () => {
    try {
      const result = await getLatestSensorData(perangkatId);
      console.log("Data diterima dari API:", result.data); // Untuk debug di Console F12

      if (result.status === 'success' && result.data && result.data.length > 0) {
        // Kita ambil data pertama (paling baru)
        setTankData(result.data[0]);
        // Ambil 10 data terbaru untuk riwayat
        setHistory(result.data.slice(0, 10));
        setError(null);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal menyambung ke server. Pastikan Backend & Tunnel aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fungsi hitung persentase desimal (Float Safe)
  const calculatePercentage = (height) => {
    const val = parseFloat(height);
    if (isNaN(val)) return 0;
    let percentage = (val / MAX_TINGGI_TANDON) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  if (loading && history.length === 0) {
    return <div className="page-shell u-p-20">🔄 Sedang sinkronisasi data tandon...</div>;
  }

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">🏗️ Manajemen Tandon Air</div>
          <div className="page-caption">Node: <strong>{perangkatId}</strong></div>
        </div>
      </div>

      {error && <div className="alert alert-danger u-mb-1">{error}</div>}

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
                {calculatePercentage(tankData?.ketinggian_air)}%
              </div>
              <div className="small-text text-sm-muted">
                {/* Gunakan toFixed(2) untuk menampilkan 2 angka desimal dari Float */}
                {tankData?.ketinggian_air !== undefined ? parseFloat(tankData.ketinggian_air).toFixed(2) : '0.00'} / {MAX_TINGGI_TANDON}.0 cm
              </div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Status</div>
              <div style={{ 
                color: parseFloat(tankData?.ketinggian_air) < 10 ? '#e74c3c' : '#27ae60', 
                fontWeight: 'bold' 
              }}>
                {parseFloat(tankData?.ketinggian_air) < 10 ? '⚠ KRITIS' : '✓ NORMAL'}
              </div>
            </div>
          </div>
        </div>

        {/* CARD NUTRISI (Data ini biasanya dari log_sensor_tanah) */}
        <div className="card card-animate card-elevated">
          <div className="card-header"><div className="card-title">Nutrisi Terkini</div></div>
          <div className="simple-card-list">
            <div className="small-stat">
              <div className="small-text text-sm-muted">pH Tanah</div>
              <div className="big-number" style={{ fontSize: '1.8rem' }}>{tankData?.ph_val || '-'}</div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Kelembapan</div>
              <div className="big-number" style={{ fontSize: '1.8rem' }}>{tankData?.kelembapan_val ? `${tankData.kelembapan_val}%` : '-'}</div>
            </div>
          </div>
        </div>

        {/* CARD STATUS POMPA */}
        <div className="card card-animate card-elevated">
          <div className="card-header"><div className="card-title">Kontrol Pompa</div></div>
          <div className="u-p-15" style={{ textAlign: 'center' }}>
             {/* Logika: Pompa nyala jika kelembapan rendah */}
             <div className={`badge ${parseFloat(tankData?.kelembapan_val) < 50 ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '1.1rem', padding: '10px' }}>
                {parseFloat(tankData?.kelembapan_val) < 50 ? 'POMPA AKTIF 🟢' : 'POMPA MATI 🔴'}
             </div>
             <div className="small-text u-mt-10">Sistem Proteksi Otomatis</div>
          </div>
        </div>
      </section>

      {/* TABEL HISTORI - PENYEBAB UTAMA UNDEFINED FIXED HERE */}
      <section className="card card-elevated">
        <div className="card-header">
          <div className="card-title">10 Riwayat Pengukuran Terakhir</div>
        </div>
        <div className="table-wrapper">
          <table className="table table-compact">
            <thead>
              <tr style={{ borderBottom: '2px solid #27ae60', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Waktu</th>
                <th style={{ padding: '12px' }}>Ketinggian Air</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: '1px solid #eee' }}>
                  {/* Gunakan 'timestamp' sesuai DB */}
                  <td style={{ padding: '12px' }}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleString('id-ID') : '-'}
                  </td>
                  
                  {/* Menangani Float 'ketinggian_air' */}
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    {item.ketinggian_air !== undefined && item.ketinggian_air !== null 
                      ? `${parseFloat(item.ketinggian_air).toFixed(2)} cm` 
                      : '0.00 cm'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    Belum ada data tandon untuk perangkat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TanksPage;