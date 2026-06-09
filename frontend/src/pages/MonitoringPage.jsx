import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { animate } from 'animejs';
import { getLatestSensorData } from '../services/sensorApi'; // Sesuaikan path ini dengan struktur folder Anda!

function MonitoringPage() {
  // === STATE MANAGEMENT ===
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [expandedTable, setExpandedTable] = useState(false);
  const tableWrapperRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // State untuk form filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedParam, setSelectedParam] = useState('Semua Parameter');
  const [filteredData, setFilteredData] = useState([]);
  const [useFilter, setUseFilter] = useState(false);
  
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
  
  const DEVICE_ID = "ESP32-MAC-A001";

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

  // === ANIMASI MONITORING PAGE ===
  useEffect(() => {
    if (!loading && sensorData.length > 0) {
      animate('.card-responsive', {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: (el, i) => i * 100,
        easing: 'easeOutQuad',
      });

      animate('.filter-section', {
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 600,
        easing: 'easeOutQuad',
      });

      animate('[style*="Chart"]', {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 700,
        delay: 200,
        easing: 'easeOutQuad',
      });

      animate('line[stroke]', {
        opacity: [0, 1],
        duration: 1000,
        delay: 500,
        easing: 'easeOutQuad',
      });
    }
  }, [loading, sensorData]);

  const latestData = sensorData.length > 0 ? sensorData[0] : null;

  // === LOGIKA FILTER ===
  const handleApplyFilter = () => {
    let filtered = [...sensorData];
    
    if (startDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        return itemDate >= startDate;
      });
    }
    
    if (endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        return itemDate <= endDate;
      });
    }
    
    setFilteredData(filtered);
    setUseFilter(true);
  };

  // ✅ FIX 1: handleResetFilter mereset semua state termasuk filteredData & useFilter
  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedParam('Semua Parameter');
    setFilteredData([]);
    setUseFilter(false);
    setCurrentPage(0);
  };

  // Data yang ditampilkan (filtered atau semua)
  const dataSource = useFilter ? filteredData : sensorData;
  
  // Pagination logic
  const totalPages = Math.ceil(dataSource.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayData = dataSource.slice(startIndex, endIndex);
  
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

  // === FUNGSI SCROLL TABEL HORIZONTAL ===
  const updateTableScrollButtons = useCallback(() => {
    const element = tableWrapperRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(element.scrollLeft > 1);
    setCanScrollRight(maxScroll > 1 && element.scrollLeft < maxScroll - 1);
  }, []);

  const scrollMonitoringTableLeft = () => {
    if (!tableWrapperRef.current) return;
    tableWrapperRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    setTimeout(updateTableScrollButtons, 350);
  };

  const scrollMonitoringTableRight = () => {
    if (!tableWrapperRef.current) return;
    tableWrapperRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    setTimeout(updateTableScrollButtons, 350);
  };

  // === EFFECT: CEK SCROLL POSITION SAAT TABEL BERUBAH ===
  useEffect(() => {
    setCurrentPage(0);
  }, [useFilter, startDate, endDate, selectedParam, sensorData.length]);

  useEffect(() => {
    updateTableScrollButtons();
    const t1 = setTimeout(updateTableScrollButtons, 150);
    const t2 = setTimeout(updateTableScrollButtons, 500);
    window.addEventListener('resize', updateTableScrollButtons);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateTableScrollButtons);
    };
  }, [displayData, windowWidth, updateTableScrollButtons]);

  // ✅ FIX 2: chartData sekarang memetakan EC, P, dan K
  const chartData = useMemo(() => {
    if (displayData.length === 0) return [];
    
    return displayData.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      soilMoisture: parseFloat(item.kelembapan_val) || 0,
      pH: parseFloat(item.ph_val) || 0,
      suhu: parseFloat(item.suhu_val) || 0,
      N: parseFloat(item.n_val) || 0,
      P: parseFloat(item.p_val) || 0,   // ✅ Ditambahkan
      K: parseFloat(item.k_val) || 0,   // ✅ Ditambahkan
      EC: parseFloat(item.ec_val) || 0  // ✅ Ditambahkan
    }));
  }, [displayData]);

  // === Tentukan Line mana yang ditampilkan berdasarkan selectedParam ===
  const showLine = (param) => {
    if (selectedParam === 'Semua Parameter') return true;
    if (selectedParam === 'Soil Moisture' && param === 'soilMoisture') return true;
    if (selectedParam === 'pH Tanah' && param === 'pH') return true;
    if (selectedParam === 'NPK' && ['N', 'P', 'K'].includes(param)) return true;
    if (selectedParam === 'EC' && param === 'EC') return true;
    if (selectedParam === 'Suhu' && param === 'suhu') return true;
    return false;
  };

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
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">📊 Monitoring Sensor</div>
          <div className="page-caption page-caption-lg">Tren real-time soil moisture, pH, dan NPK dari perangkat IoT</div>
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
        <div className="card-responsive filter-section" style={{
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
              {/* ✅ FIX 3: Opsi parameter dilengkapi EC & Suhu */}
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
                <option>EC</option>
                <option>Suhu</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {/* ✅ FIX 4: onClick handleApplyFilter dipasang ke tombol Terapkan */}
              <button 
                onClick={handleApplyFilter}
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
              {/* ✅ FIX 5: onClick handleResetFilter (bukan inline) agar filteredData & useFilter ikut direset */}
              <button 
                onClick={handleResetFilter}
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
                onMouseOver={(e) => e.target.style.backgroundColor = '#bdc3c7'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ecf0f1'}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Lokasi Sensor */}
        <div className="card-responsive" style={{
          alignSelf: 'start',
          background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
          color: 'white',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
          borderRadius: '15px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>📍 Lokasi Sensor</div>
              <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '2px' }}>Perangkat aktif di kebun</div>
            </div>
            <span style={{
              fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
              backgroundColor: error ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.2)',
              border: `1px solid ${error ? 'rgba(231,76,60,0.5)' : 'rgba(255,255,255,0.3)'}`,
            }}>
              {error ? '● Offline' : '● Online'}
            </span>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px', marginBottom: '12px', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>🌿</div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '700' }}>Blok A</div>
                <div style={{ fontSize: '11px', opacity: 0.85, fontFamily: 'monospace' }}>{DEVICE_ID}</div>
              </div>
            </div>
          </div>

          {/* Mini peta blok */}
          <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '10px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>PETA BLOK KEBUN</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
              {['B1', 'B2', 'B3', 'A1', 'A2', 'A3', 'C1', 'C2', 'C3'].map((blok) => (
                <div key={blok} style={{
                  padding: '6px 4px', borderRadius: '6px', textAlign: 'center', fontSize: '10px', fontWeight: '600',
                  backgroundColor: blok === 'A1' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)',
                  border: blok === 'A1' ? '2px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: blok === 'A1' ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
                }}>
                  {blok === 'A1' ? '📡' : blok}
                </div>
              ))}
            </div>
          </div>

          {/* Info singkat */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🔄', label: 'Interval', value: '15 detik' },
              { icon: '📊', label: 'Data', value: `${sensorData.length} entri` },
              {
                icon: '🕐', label: 'Terakhir', value: latestData?.timestamp
                  ? new Date(latestData.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  : '--:--',
              },
              { icon: '📶', label: 'Node', value: 'ESP32' },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 10px' }}>
                <div style={{ fontSize: '9px', opacity: 0.7, fontWeight: '600' }}>{item.icon} {item.label}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '2px' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All Parameters in One Card */}
        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          color: 'white',
          padding: '24px',
          boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
          gridColumn: 'span 2'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>📊 Semua Parameter</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Data sensor real-time</div>
          </div>
          
          {loading && sensorData.length === 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} style={{
                  height: '70px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  animation: 'pulse 2s infinite'
                }} />
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '16px'
            }}>
              {/* Moisture */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>💧 Kelembapan</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{latestData?.kelembapan_val ?? '--'}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>%</div>
              </div>

              {/* Temperature */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>🌡️ Suhu</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{latestData?.suhu_val ?? '--'}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>°C</div>
              </div>

              {/* EC — ✅ sebelumnya tidak ada kartu ini */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>⚡ EC</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{latestData?.ec_val ?? '--'}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>µS/cm</div>
              </div>

              {/* pH */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>⚗️ pH</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{latestData?.ph_val ?? '--'}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>pH</div>
              </div>

              {/* Nitrogen */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>🌱 N</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{latestData?.n_val ?? '--'}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>ppm</div>
              </div>

              {/* Phosphorus */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>🔴 P</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{latestData?.p_val ?? '--'}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>ppm</div>
              </div>

              {/* Potassium */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>🟡 K</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{latestData?.k_val ?? '--'}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>ppm</div>
              </div>
            </div>
          )}
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
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: windowWidth < 768 ? 'column' : 'row', justifyContent: windowWidth < 768 ? 'flex-start' : 'space-between', alignItems: windowWidth < 768 ? 'flex-start' : 'center', gap: windowWidth < 768 ? '12px' : '0' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>📋 Data Sensor Real-Time</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Riwayat pembacaan sensor terbaru {dataSource.length > 0 && `(${dataSource.length} data)`}</div>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: windowWidth < 768 ? 'wrap' : 'nowrap' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {/* Tombol Scroll Kiri */}
          <button
            type="button"
            onClick={scrollMonitoringTableLeft}
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
            onMouseOver={(e) => canScrollLeft && (e.currentTarget.style.backgroundColor = '#2980b9')}
            onMouseOut={(e) => canScrollLeft && (e.currentTarget.style.backgroundColor = '#3498db')}
            title="Scroll ke kiri"
            aria-label="Scroll tabel ke kiri"
          >
            ◀
          </button>

          {/* Tabel Container dengan Scroll */}
          <div
            ref={tableWrapperRef}
            onScroll={updateTableScrollButtons}
            style={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              borderRadius: '12px',
              border: '1px solid #ecf0f1',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
            }}
          >
              <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Waktu</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Lokasi</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Kelembapan</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Suhu</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>EC</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>pH</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>N</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>P</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>K</th>
              </tr>
            </thead>
            <tbody>
              {loading && displayData.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>
                    ⏳ Memuat data sensor...
                  </td>
                </tr>
              ) : displayData.length > 0 ? (
                displayData.map((row, idx) => (
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
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#3498db' }}>{row.kelembapan_val}%</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#e67e22' }}>{row.suhu_val}°C</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#9b59b6' }}>{row.ec_val}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{row.ph_val}</td>
                    <td style={{ padding: '12px 16px' }}>{row.n_val}</td>
                    <td style={{ padding: '12px 16px' }}>{row.p_val}</td>
                    <td style={{ padding: '12px 16px' }}>{row.k_val}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>
                    📭 Tidak ada data tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          {/* Tombol Scroll Kanan */}
          <button
            type="button"
            onClick={scrollMonitoringTableRight}
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
            onMouseOver={(e) => canScrollRight && (e.currentTarget.style.backgroundColor = '#2980b9')}
            onMouseOut={(e) => canScrollRight && (e.currentTarget.style.backgroundColor = '#3498db')}
            title="Scroll ke kanan"
            aria-label="Scroll tabel ke kanan"
          >
            ▶
          </button>
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
          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
            Visualisasi parameter sensor IoT
            {useFilter && <span style={{ marginLeft: '8px', color: '#27ae60', fontWeight: '500' }}>· Filter aktif</span>}
          </div>
        </div>

        {loading && displayData.length === 0 ? (
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

                {/* ✅ FIX 6: Semua line ditambahkan, dengan logika show/hide berdasarkan selectedParam */}
                {showLine('soilMoisture') && (
                  <Line type="monotone" dataKey="soilMoisture" stroke="#27ae60" name="Moisture (%)" strokeWidth={3} dot={false} />
                )}
                {showLine('suhu') && (
                  <Line type="monotone" dataKey="suhu" stroke="#e67e22" name="Suhu (°C)" strokeWidth={2} dot={false} />
                )}
                {showLine('pH') && (
                  <Line type="monotone" dataKey="pH" stroke="#e74c3c" name="pH" strokeWidth={2} dot={false} />
                )}
                {showLine('EC') && (
                  <Line type="monotone" dataKey="EC" stroke="#9b59b6" name="EC (µS/cm)" strokeWidth={2} dot={false} />
                )}
                {showLine('N') && (
                  <Line type="monotone" dataKey="N" stroke="#3498db" name="Nitrogen (N)" strokeWidth={2} dot={false} />
                )}
                {showLine('P') && (
                  <Line type="monotone" dataKey="P" stroke="#e74c3c" name="Fosfor (P)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                )}
                {showLine('K') && (
                  <Line type="monotone" dataKey="K" stroke="#f39c12" name="Kalium (K)" strokeWidth={2} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

export default MonitoringPage;