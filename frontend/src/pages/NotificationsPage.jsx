import { useState, useEffect, useMemo, useRef } from 'react'
import { getMyNotifications } from '../services/notificationApi.js'

function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const notificationTableRef = useRef(null)
  
  // Filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterType, setFilterType] = useState('semua')
  const [expandedNotifTable, setExpandedNotifTable] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const ITEMS_PER_PAGE = 15

  // Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Pastikan kunci (key) di sini sesuai dengan isi kolom 'tipe' di database
  const typeColor = {
    info: '#2b8aef',
    warning: '#f39c12',
    critical: '#e74c3c',
    danger: '#e74c3c',
    success: '#27ae60',
  }

  const typeLabel = {
    info: '📢',
    warning: '⚠️',
    critical: '🔴',
    danger: '🔥',
    success: '✓',
  }

  // Tipe notifikasi options (sesuai dengan yang mungkin di-send dari backend)
  const notificationTypes = [
    { value: 'semua', label: 'Semua Notifikasi' },
    { value: 'critical', label: '🔴 Critical (Bahaya)' },
    { value: 'warning', label: '⚠️ Warning (Peringatan)' },
    { value: 'info', label: '📢 Informasi' },
    { value: 'success', label: '✓ Sukses' },
  ]

  // Integrasi API
  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const response = await getMyNotifications();
        if (response && response.data) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error("Gagal mengambil notifikasi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotif();
    
    // Opsional: Refresh otomatis setiap 15 detik
    const interval = setInterval(fetchNotif, 15000);
    return () => clearInterval(interval);
  }, []);

  // Logika Filter untuk Data
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      // Filter by type
      if (filterType !== 'semua' && notif.tipe !== filterType) {
        return false;
      }

      // Filter by date range
      if (dateFrom) {
        const notifDate = new Date(notif.createdAt).toISOString().split('T')[0];
        if (notifDate < dateFrom) {
          return false;
        }
      }

      if (dateTo) {
        const notifDate = new Date(notif.createdAt).toISOString().split('T')[0];
        if (notifDate > dateTo) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, filterType, dateFrom, dateTo]);

  // === FUNGSI SCROLL TABEL HORIZONTAL ===
  const handleNotificationTableScroll = () => {
    if (notificationTableRef.current) {
      const element = notificationTableRef.current;
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 10);
    }
  };

  const scrollNotificationTableLeft = () => {
    if (notificationTableRef.current) {
      notificationTableRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollNotificationTableRight = () => {
    if (notificationTableRef.current) {
      notificationTableRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // === EFFECT: CEK SCROLL POSITION SAAT TABEL BERUBAH ===
  useEffect(() => {
    if (notificationTableRef.current) {
      setTimeout(handleNotificationTableScroll, 300);
    }
    // Reset ke halaman 1 saat data berubah
    setCurrentPage(0);
  }, [filteredNotifications.length]);

  // Reset filter handler
  const handleResetFilter = () => {
    setDateFrom('');
    setDateTo('');
    setFilterType('semua');
    setCurrentPage(0);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayData = filteredNotifications.slice(startIndex, endIndex);
  
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

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">🔔 Pusat Notifikasi</div>
          <div className="page-caption page-caption-lg">
            Pantau semua peringatan, informasi, dan status sistem dalam satu tempat.
          </div>
        </div>
      </div>

      {/* Filter Riwayat */}
      <section className="card card-animate card-animate-delay-1 card-elevated u-mb-1">
        <div className="card-header card-header-top-md">
          <div>
            <div className="card-title card-title-lg">Filter Riwayat</div>
            <div className="card-subtitle card-subtitle-lg">
              Pilih rentang tanggal &amp; tipe notifikasi untuk melihat alert spesifik
            </div>
          </div>
        </div>
        <div className="simple-card-list form-grid-3">
          <div>
            <div className="small-text text-sm-muted">Tanggal Mulai</div>
            <input 
              type="date" 
              className="form-control"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <div className="small-text text-sm-muted">Tanggal Akhir</div>
            <input 
              type="date" 
              className="form-control"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div>
            <div className="small-text text-sm-muted">Tipe Notifikasi</div>
            <select 
              className="form-control"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="btn-row u-mt-075">
          <button 
            type="button" 
            className="btn-primary btn-pill-primary"
            onClick={() => window.location.reload()}
          >
            🔄 Refresh
          </button>
          <button
            type="button"
            className="btn-pill-outline"
            onClick={handleResetFilter}
          >
            Reset Filter
          </button>
        </div>
        {filteredNotifications.length > 0 && (
          <div style={{
            padding: '12px 15px',
            backgroundColor: '#f0f7ff',
            borderRadius: '8px',
            fontSize: '12px',
            marginTop: '12px',
            color: '#0066cc'
          }}>
            📊 Ditemukan {filteredNotifications.length} notifikasi dari {notifications.length} total
          </div>
        )}
      </section>

      {/* Daftar Notifikasi */}
      <section className="card card-animate card-animate-delay-2 card-elevated">
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: windowWidth < 768 ? 'column' : 'row', justifyContent: windowWidth < 768 ? 'flex-start' : 'space-between', alignItems: windowWidth < 768 ? 'flex-start' : 'center', gap: windowWidth < 768 ? '12px' : '0' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>🔔 Riwayat Notifikasi {filteredNotifications && filteredNotifications.length > 0 && `(${filteredNotifications.length} data)`}</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
              Daftar semua alert dengan severity &amp; waktu kejadian.
            </div>
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
        
        <div className="u-p-1">
          {loading ? (
            <div className="small-text" style={{ textAlign: 'center', padding: '40px 20px' }}>
              ⏳ Memuat notifikasi...
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              {/* Tombol Scroll Kiri */}
              <button
                type="button"
                className="table-scroll-btn"
                onClick={scrollNotificationTableLeft}
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
                ref={notificationTableRef}
                onScroll={handleNotificationTableScroll}
                style={{
                  flex: 1,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  borderRadius: '6px',
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth',
                  border: '1px solid #ecf0f1'
                }}
              >
                <table style={{
                  width: '100%',
                  minWidth: '1000px',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #ecf0f1'
                      }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600', minWidth: '200px' }}>Waktu</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600', minWidth: '150px' }}>Tipe</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600', minWidth: '200px' }}>Perangkat</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600', minWidth: '400px' }}>Pesan</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((notif, idx) => (
                    <tr key={notif.id} style={{
                      borderBottom: '1px solid #ecf0f1',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      borderLeft: `4px solid ${typeColor[notif.tipe] || '#ccc'}`,
                      transition: 'background-color 0.3s'
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555', minWidth: '200px' }}>
                        {new Date(notif.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '12px 16px', minWidth: '150px' }}>
                        <span style={{
                          backgroundColor: typeColor[notif.tipe] || '#ccc',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          display: 'inline-block'
                        }}>
                          {typeLabel[notif.tipe] || '•'} {notif.tipe}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#2c3e50', minWidth: '200px' }}>
                        {notif.perangkat_id}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555', minWidth: '400px' }}>
                        {notif.pesan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Tombol Scroll Kanan */}
              <button
                type="button"
                className="table-scroll-btn"
                onClick={scrollNotificationTableRight}
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
          ) : (
            <div className="small-text text-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
              {notifications.length === 0 ? '📭 Belum ada notifikasi.' : '🔍 Tidak ada notifikasi yang sesuai dengan filter.'}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default NotificationsPage