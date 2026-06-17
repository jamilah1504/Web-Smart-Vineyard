import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { getLatestWaterLevel } from '../services/controlApi';

const DEVICE_ID = "ESP32-MAC-A001"; // ID Perangkat

function TankMonitoringPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tank, setTank] = useState('all');
  const [tankData, setTankData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTankTable, setExpandedTankTable] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableWrapperRef = useRef(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const ITEMS_PER_PAGE = 15;

  // Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function: Status disinkronkan dengan backend (Cut-off di bawah 10 cm)
  const determinateStatus = (tinggiCm) => {
    if (tinggiCm >= 20) return 'normal';    // Aman (> 20 cm)
    if (tinggiCm >= 10) return 'warning';   // Siaga (10 cm - 19.9 cm)
    return 'critical';                      // Kritis (< 10 cm, pompa mati otomatis)
  };

  // === FUNGSI SCROLL TABEL HORIZONTAL ===
  const handleTableScroll = () => {
    if (tableWrapperRef.current) {
      const element = tableWrapperRef.current;
      setScrollPosition(element.scrollLeft);
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 10);
    }
  };

  const scrollTableLeft = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollTableRight = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // === EFFECT: CEK SCROLL POSITION SAAT TABEL BERUBAH ===
  useEffect(() => {
    if (tableWrapperRef.current) {
      setTimeout(handleTableScroll, 300);
    }
  }, [expandedTankTable, tankData]);

  // === FUNGSI TARIK DATA ===
  const fetchTankData = useCallback(async () => {
    try {
      const response = await getLatestWaterLevel(DEVICE_ID);
      
      console.log("Cek Data Tandon Asli:", response.data);

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const transformed = response.data.map(item => {
          // 1. Ambil nilai aktual (ESP32 SUDAH mengirimkan tinggi air dalam cm, bukan jarak sensor)
          const tinggiAirAsli = parseFloat(item.ketinggian_air) || 0;
          const TINGGI_MAKSIMAL_TANDON = 31.0; 

          // 2. Kalkulasi Sisa Air dalam Persentase
          let persentase = Math.round((tinggiAirAsli / TINGGI_MAKSIMAL_TANDON) * 100);
          persentase = Math.max(0, Math.min(100, persentase)); // Safety guard 0-100%

          // 3. Penamaan tandon dinamis
          const jenisTandon = item.jenis_tandon?.toLowerCase() === 'pupuk' ? 'Tandon Nutrisi' : 'Tandon Air Baku';

          // 4. Standarisasi Tanggal
          const rawDate = new Date(item.timestamp || item.createdAt); 
          const year = rawDate.getFullYear();
          const month = String(rawDate.getMonth() + 1).padStart(2, '0');
          const day = String(rawDate.getDate()).padStart(2, '0');
          const isoDate = `${year}-${month}-${day}`; 

          return {
            time: rawDate.toLocaleString('id-ID'), 
            isoDate: isoDate,                      
            timestampStr: rawDate.getTime(),       
            tank: jenisTandon,
            level: persentase,
            ketinggian_cm: tinggiAirAsli.toFixed(1),
            status: determinateStatus(tinggiAirAsli) // Status dicek berdasarkan CM
          };
        });

        // Urutkan dari yang paling baru
        transformed.sort((a, b) => b.timestampStr - a.timestampStr);

        setTankData(transformed);
        setError('');
      } else {
        setTankData([]);
      }
    } catch (err) {
      console.error("Error Fetch:", err);
      setError("Gagal koneksi ke server tandon. Pastikan backend aktif.");
    } finally {
      setLoading(false);
    }
  }, []);

  // === TRIGGER: PENGAMBILAN DATA AWAL & AUTO REFRESH ===
  useEffect(() => {
    setLoading(true);
    fetchTankData();
    
    // Auto refresh setiap 15 detik mengikuti siklus POST dari ESP32
    const intervalId = setInterval(fetchTankData, 15000);
    return () => clearInterval(intervalId);
  }, [fetchTankData]);

  // === LOGIKA FILTER TANGGAL & JENIS TANDON ===
  const filtered = useMemo(() => {
    return tankData.filter((row) => {
      const matchesFrom = !dateFrom || row.isoDate >= dateFrom;
      const matchesTo = !dateTo || row.isoDate <= dateTo;
      const matchesTank = tank === 'all' || row.tank === tank;
      
      return matchesFrom && matchesTo && matchesTank;
    });
  }, [dateFrom, dateTo, tank, tankData]);
  
  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayData = filtered.slice(startIndex, endIndex);
  
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;
  
  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(0);
  }, [filtered.length]);

  const latest = filtered.length > 0 ? filtered[0] : null;

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      
      {/* 🔴 ALERT ERROR */}
      {error && (
        <div className="alert alert-danger u-mb-15" style={{ backgroundColor: '#fadbd8', color: '#c0392b', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #e74c3c' }}>
          <strong>⚠️ Peringatan:</strong> {error}
        </div>
      )}
      
      {/* HEADER HALAMAN */}
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">💧 Monitoring Tandon</div>
          <div className="page-caption page-caption-lg">
            Pantau persentase stok air dan nutrisi di tandon utama secara real-time.
          </div>
        </div>
      </div>

      {/* KOTAK-KOTAK ATAS (DASHBOARD) */}
      <section className="responsive-grid-section">
        
        {/* KARTU 1: FILTER */}
        <div className="card-responsive" style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '24px', border: '1px solid #ecf0f1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔍 Filter Data
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Pilih rentang waktu & tandon</div>
          </div>
          
          <div className={`responsive-filter-grid${windowWidth < 576 ? '' : ''}`}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#7f8c8d', marginBottom: '4px', display: 'block' }}>Tanggal Mulai</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '13px', color: '#2c3e50', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#7f8c8d', marginBottom: '4px', display: 'block' }}>Tanggal Akhir</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '13px', color: '#2c3e50', boxSizing: 'border-box' }} />
            </div>
            <div className="span-full">
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#7f8c8d', marginBottom: '4px', display: 'block' }}>Pilih Tandon</label>
              <select value={tank} onChange={(e) => setTank(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '13px', color: '#2c3e50', backgroundColor: '#f9f9f9', cursor: 'pointer' }}>
                <option value="all">💧 Semua Tandon</option>
                <option value="Tandon Air Baku">Tandon Air Baku</option>
                <option value="Tandon Nutrisi">Tandon Nutrisi</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: '15px' }}>
            <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); setTank('all'); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #bdc3c7', backgroundColor: '#fff', color: '#7f8c8d', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}>
              🔄 Reset Filter
            </button>
          </div>
        </div>

        {/* KARTU 2: SNAPSHOT TANDON TERBARU */}
        <div className="card-responsive" style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '24px', border: '1px solid #ecf0f1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Snapshot Terbaru
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Pembacaan sensor JSN-SR04T</div>
          </div>
          
          {loading && !latest ? (
            <div style={{ textAlign: 'center', color: '#95a5a6', padding: '30px 0', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              <div style={{ animation: 'pulse 1.5s infinite' }}>⏳ Memuat data tandon...</div>
            </div>
          ) : latest ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px 15px', backgroundColor: '#f4f6f8', borderRadius: '10px', borderLeft: '4px solid #3498db' }}>
                <div style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: '600', marginBottom: '2px' }}>Tandon Aktif</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#2c3e50' }}>{latest.tank}</div>
              </div>
              
              <div style={{ padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: latest.status === 'critical' ? '#fff5f5' : latest.status === 'warning' ? '#fffbeb' : '#f0fdf4', border: `1px solid ${latest.status === 'critical' ? '#ffe3e3' : latest.status === 'warning' ? '#fef3c7' : '#dcfce7'}` }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: '600' }}>Sisa Volume</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', color: latest.status === 'critical' ? '#e74c3c' : latest.status === 'warning' ? '#f39c12' : '#27ae60' }}>
                      {latest.level}%
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#7f8c8d' }}>({latest.ketinggian_cm} cm)</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px' }}>
                     {latest.status === 'critical' ? '⚠️' : latest.status === 'warning' ? '🔔' : '✅'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '10px', color: '#95a5a6', textAlign: 'right', marginTop: '4px' }}>
                Diperbarui: {latest.time}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#95a5a6', padding: '30px 0', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              Tidak ada data tandon.
            </div>
          )}
        </div>

        {/* KARTU 3: STATUS KEAMANAN */}
        <div className="card-responsive" style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '24px', border: '1px solid #ecf0f1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛡️ Status Keamanan
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Sistem proteksi dry-run pompa</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚙️</div>
                <span style={{ fontWeight: '600', color: '#34495e', fontSize: '13px' }}>Auto-Cutoff</span>
              </div>
              <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                ✓ AKTIF
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📉</div>
                <span style={{ fontWeight: '600', color: '#34495e', fontSize: '13px' }}>Ambang Kritis</span>
              </div>
              <span style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                &lt; 10 cm (~28,57%)
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '11px', color: '#7f8c8d', textAlign: 'center', border: '1px dashed #bdc3c7' }}>
             💡 Pompa akan dimatikan otomatis oleh sistem jika volume air menyentuh batas kritis (di bawah 10 cm).
          </div>
        </div>
      </section>

      {/* TABEL RIWAYAT DI BAWAH */}
      <section className="card card-animate card-animate-delay-4 card-elevated">
        <div style={{ marginBottom: '20px' }} className="responsive-toolbar">
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>💧 Riwayat Level Tandon {filtered.length > 0 && `(${filtered.length} data)`}</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
              Data riwayat fluktuasi air berdasarkan waktu (Terbaru di atas)
            </div>
          </div>
          {totalPages > 1 && (
            <div className="responsive-toolbar-actions">
              {/* Info Halaman */}
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginRight: '8px',
                whiteSpace: 'nowrap'
              }}>
                Hal. {currentPage + 1} dari {totalPages > 0 ? totalPages : 1}
              </div>
              
              {/* Tombol Sebelumnya */}
              <button
                onClick={handlePreviousPage}
                disabled={!canGoPrevious}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: canGoPrevious ? '#3498db' : '#ecf0f1',
                  color: canGoPrevious ? '#fff' : '#bdc3c7',
                  cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '12px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => canGoPrevious && (e.target.style.backgroundColor = '#2980b9')}
                onMouseOut={(e) => canGoPrevious && (e.target.style.backgroundColor = '#3498db')}
                title="Lihat data sebelumnya"
              >
                ◀ Sebelumnya
              </button>

              {/* Tombol Sesudahnya */}
              <button
                onClick={handleNextPage}
                disabled={!canGoNext}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: canGoNext ? '#27ae60' : '#ecf0f1',
                  color: canGoNext ? '#fff' : '#bdc3c7',
                  cursor: canGoNext ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '12px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => canGoNext && (e.target.style.backgroundColor = '#229954')}
                onMouseOut={(e) => canGoNext && (e.target.style.backgroundColor = '#27ae60')}
                title="Lihat data selanjutnya"
              >
                Sesudahnya ▶
              </button>
            </div>
          )}
        </div>
        <div className="table-wrapper u-mt-05" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {/* Tombol Scroll Kiri */}
          <button
            type="button"
            className="table-scroll-btn"
            onClick={scrollTableLeft}
            disabled={!canScrollLeft}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: canScrollLeft ? '#3498db' : '#ecf0f1',
              color: canScrollLeft ? '#fff' : '#bdc3c7',
              cursor: canScrollLeft ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              height: '36px'
            }}
            onMouseOver={(e) => canScrollLeft && (e.target.style.backgroundColor = '#2980b9')}
            onMouseOut={(e) => canScrollLeft && (e.target.style.backgroundColor = '#3498db')}
            title="Scroll ke kiri"
          >
            ◀
          </button>

          {/* Tabel Container dengan Scroll */}
          <div
            ref={tableWrapperRef}
            onScroll={handleTableScroll}
            style={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              borderRadius: '6px',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
          >
          {loading && filtered.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>
              <p>⏳ Sedang menyinkronkan data...</p>
            </div>
          ) : (displayData).length > 0 ? (
            <table className="table table-compact" style={{ minWidth: '100%', width: 'auto' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #3498db' }}>
                  <th style={{ color: '#2c3e50', padding: '12px' }}>Waktu Catat</th>
                  <th style={{ color: '#2c3e50', padding: '12px' }}>Nama Tandon</th>
                  <th style={{ color: '#2c3e50', padding: '12px' }}>Ketinggian Air (%)</th>
                  <th style={{ color: '#2c3e50', padding: '12px' }}>Status Indikator</th>
                </tr>
              </thead>
              <tbody>
                {(displayData).map((row, index) => (
                  <tr key={`${row.timestampStr}-${index}`} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ fontWeight: '500', padding: '10px 12px' }}>{row.time}</td>
                    <td style={{ padding: '10px 12px' }}>{row.tank}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#2c3e50' }}>
                        {row.level}%
                        <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#7f8c8d', marginLeft: '6px' }}>
                          ({row.ketinggian_cm} cm)
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
                          backgroundColor: row.status === 'critical' ? '#fadbd8' : row.status === 'warning' ? '#fcf3cf' : '#d5f5e3',
                          color: row.status === 'critical' ? '#c0392b' : row.status === 'warning' ? '#b7950b' : '#1e8449'
                      }}>
                        {row.status === 'critical' ? 'Kritis (Segera Isi)' : row.status === 'warning' ? 'Siaga (Menipis)' : 'Normal (Aman)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>
              <p>📭 Tidak ada data riwayat yang cocok dengan filter.</p>
            </div>
          )}
          </div>

          {/* Tombol Scroll Kanan */}
          <button
            type="button"
            className="table-scroll-btn"
            onClick={scrollTableRight}
            disabled={!canScrollRight}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: canScrollRight ? '#3498db' : '#ecf0f1',
              color: canScrollRight ? '#fff' : '#bdc3c7',
              cursor: canScrollRight ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              height: '36px'
            }}
            onMouseOver={(e) => canScrollRight && (e.target.style.backgroundColor = '#2980b9')}
            onMouseOut={(e) => canScrollRight && (e.target.style.backgroundColor = '#3498db')}
            title="Scroll ke kanan"
          >
            ▶
          </button>
        </div>
      </section>
    </div>
  );
}

export default TankMonitoringPage;