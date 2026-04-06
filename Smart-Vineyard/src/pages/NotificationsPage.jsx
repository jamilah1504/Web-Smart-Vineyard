import { useState } from 'react'

function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      time: '2026-03-12 10:30',
      type: 'warning',
      title: 'Kelembapan Kritical',
      message: 'Kelembapan Blok A turun di bawah 40%. Pompa irigasi akan diaktifkan otomatis dalam 5 menit.',
    },
    {
      id: 2,
      time: '2026-03-12 08:15',
      type: 'info',
      title: 'Irigasi Otomatis Selesai',
      message: 'Pompa Blok B selesai irigasi. Total durasi: 60 menit, volume: 3,000 liter.',
    },
    {
      id: 3,
      time: '2026-03-11 22:45',
      type: 'critical',
      title: 'Sensor Error',
      message: 'Sensor pH Blok A tidak merespons. Silakan periksa koneksi atau lakukan reset.',
    },
    {
      id: 4,
      time: '2026-03-11 15:20',
      type: 'success',
      title: 'Analisis AI Selesai',
      message: 'Analisis kesehatan tanaman Blok C selesai. Tidak ada anomali terdeteksi. Status: Normal.',
    },
    {
      id: 5,
      time: '2026-03-11 09:00',
      type: 'warning',
      title: 'Threshold Terlampaui',
      message: 'EC (salinitas) Blok B mencapai 1.6 dS/m. Rekomendasi: lakukan irigasi dengan air tawar.',
    },
  ])

  const typeColor = {
    info: '#2b8aef',
    warning: '#f39c12',
    critical: '#e74c3c',
    success: '#27ae60',
  }

  const typeLabel = {
    info: '📢',
    warning: '⚠️',
    critical: '🔴',
    success: '✓',
  }

  return (
    <div className="page page-with-padding page-shell">
      {/* Header */}
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Pusat Notifikasi</div>
          <div className="page-caption page-caption-lg">
            Pantau semua peringatan, informasi, dan status sistem dalam satu tempat.</div>
        </div>
      </div>

      <section
        className="card card-animate card-animate-delay-1 card-elevated u-mb-1"
      >
        <div
          className="card-header card-header-top-md"
        >
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

      <section
        className="card card-animate card-animate-delay-2 card-elevated"
      >
        <div
          className="card-header card-header-top"
        >
          <div>
            <div className="card-title card-title-lg">Riwayat Notifikasi</div>
            <div className="card-subtitle card-subtitle-lg">
              Daftar alert dengan severity & status penanganan.
            </div>
          </div>
        </div>
        <div className="small-text text-body">
          Tabel riwayat notifikasi akan ditampilkan di sini.
        </div>
      </section>
    </div>
  )
}

export default NotificationsPage

