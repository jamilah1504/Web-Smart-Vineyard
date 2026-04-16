import { useState, useEffect, useMemo } from 'react'
import { getMyNotifications } from '../services/notificationApi.js'

function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterType, setFilterType] = useState('semua')

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

  // Reset filter handler
  const handleResetFilter = () => {
    setDateFrom('');
    setDateTo('');
    setFilterType('semua');
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
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Riwayat Notifikasi</div>
            <div className="card-subtitle card-subtitle-lg">
              Daftar semua alert dengan severity &amp; waktu kejadian.
            </div>
          </div>
        </div>
        
        <div className="u-p-1">
          {loading ? (
            <div className="small-text" style={{ textAlign: 'center', padding: '40px 20px' }}>
              ⏳ Memuat notifikasi...
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #ecf0f1' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #ecf0f1'
                  }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Waktu</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Tipe</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Perangkat</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#2c3e50', fontWeight: '600' }}>Pesan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notif, idx) => (
                    <tr key={notif.id} style={{
                      borderBottom: '1px solid #ecf0f1',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      borderLeft: `4px solid ${typeColor[notif.tipe] || '#ccc'}`,
                      transition: 'background-color 0.3s'
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>
                        {new Date(notif.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
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
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#2c3e50' }}>
                        {notif.perangkat_id}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555', maxWidth: '400px' }}>
                        {notif.pesan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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