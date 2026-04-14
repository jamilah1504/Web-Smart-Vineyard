import { useState, useEffect } from 'react'
import { getMyNotifications } from '../services/notificationApi.js'

function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Pastikan kunci (key) di sini sesuai dengan isi kolom 'tipe' di database
  const typeColor = {
    info: '#2b8aef',
    warning: '#f39c12',
    critical: '#e74c3c',
    danger: '#e74c3c', // Tambahan jika di DB pake tipe 'danger'
    success: '#27ae60',
  }

  const typeLabel = {
    info: '📢',
    warning: '⚠️',
    critical: '🔴',
    danger: '🔥',
    success: '✓',
  }

  // Integrasi API
  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const response = await getMyNotifications();
        // Sesuai controller backend: res.status(200).json({ status: 'success', data });
        // Kita cek apakah response.data ada, jika tidak default ke array kosong
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
    
    // Opsional: Refresh otomatis setiap 30 detik agar notifikasi baru dari ESP-CAM muncul
    const interval = setInterval(fetchNotif, 30000);
    return () => clearInterval(interval);
  }, []);

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
              Pilih rentang tanggal & tipe alert
            </div>
          </div>
        </div>
        <div className="simple-card-list form-grid-3">
          <div>
            <div className="small-text text-sm-muted">Tanggal Mulai</div>
            <input type="date" className="form-control" />
          </div>
          <div>
            <div className="small-text text-sm-muted">Tanggal Akhir</div>
            <input type="date" className="form-control" />
          </div>
          <div>
            <div className="small-text text-sm-muted">Tipe Alert</div>
            <select className="form-control">
              <option>Semua</option>
              <option>Tandon air kosong</option>
              <option>Kelembapan tanah rendah</option>
              <option>Sensor offline</option>
            </select>
          </div>
        </div>
      </section>

      {/* Daftar Notifikasi */}
      <section className="card card-animate card-animate-delay-2 card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Riwayat Notifikasi</div>
            <div className="card-subtitle card-subtitle-lg">
              Daftar alert dengan severity & status penanganan.
            </div>
          </div>
        </div>
        
        <div className="u-p-1">
          {loading ? (
            <div className="small-text">Memuat notifikasi...</div>
          ) : notifications && notifications.length > 0 ? (
            <div className="simple-card-list">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  style={{ 
                    padding: '15px', 
                    borderLeft: `5px solid ${typeColor[notif.tipe] || '#ccc'}`,
                    backgroundColor: '#fff',
                    marginBottom: '10px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: typeColor[notif.tipe] || '#333' }}>
                      {/* PERBAIKAN: Gunakan notif.tipe dan notif.perangkat_id */}
                      {typeLabel[notif.tipe] || '•'} {notif.perangkat_id}
                    </div>
                    <div className="small-text text-sm-muted" style={{ fontSize: '0.8rem' }}>
                      {new Date(notif.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="small-text u-mt-05" style={{ color: '#555' }}>
                    {/* PERBAIKAN: Gunakan notif.pesan sesuai nama kolom di database */}
                    {notif.pesan}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="small-text text-body">
              Belum ada notifikasi yang tersedia.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default NotificationsPage