import { useMemo, useState } from 'react'

function Switch({ checked, onChange, label, description }) {
  return (
    <div className="card card-elevated">
      <div className="u-flex u-justify-between u-align-start u-gap-1">
        <div>
          <div className="card-title card-title-lg">{label}</div>
          <div className="card-subtitle card-subtitle-lg">{description}</div>
        </div>
        <button
          type="button"
          className={checked ? 'switch switch-on' : 'switch'}
          onClick={() => onChange(!checked)}
          aria-pressed={checked}
          aria-label={label}
        >
          <span className="switch-knob" />
        </button>
      </div>
    </div>
  )
}

const seedLogs = [
  { id: 'L-001', time: '2026-03-10 08:31', level: 'info', message: 'Sistem online. Semua service normal.' },
  { id: 'L-002', time: '2026-03-10 09:06', level: 'warn', message: 'Kelembapan Blok A mendekati threshold.' },
  { id: 'L-003', time: '2026-03-10 14:21', level: 'info', message: 'Analisis AI selesai untuk Blok C.' },
  { id: 'L-004', time: '2026-03-11 07:11', level: 'info', message: 'Sinkronisasi data sensor berhasil.' },
]

function levelBadge(level) {
  if (level === 'warn') return 'badge-pill-critical'
  return 'badge-pill-neutral'
}

export default function SettingsPage() {
  const [systemName, setSystemName] = useState('Smart Vineyard')
  const [timezone, setTimezone] = useState('Asia/Jakarta')
  const [refreshSec, setRefreshSec] = useState(5)

  const [notifEnabled, setNotifEnabled] = useState(true)
  const [autoIrrigation, setAutoIrrigation] = useState(false)
  const [aiAutoAnalyze, setAiAutoAnalyze] = useState(true)

  const [logQuery, setLogQuery] = useState('')
  const logs = useMemo(() => {
    const q = logQuery.trim().toLowerCase()
    if (!q) return seedLogs
    return seedLogs.filter((l) => l.message.toLowerCase().includes(q) || l.id.toLowerCase().includes(q))
  }, [logQuery])

  return (
    <div className="page page-with-padding page-shell">
      <section className="card card-elevated u-mb-15">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Pengaturan Sistem</div>
            <div className="card-subtitle card-subtitle-lg">
              Konfigurasi & log aktivitas (dummy — siap dihubungkan ke API).
            </div>
          </div>
          <span className="badge-pill-neutral">Owner</span>
        </div>
      </section>

      <section className="card card-elevated u-mb-15">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Konfigurasi Umum</div>
            <div className="card-subtitle card-subtitle-lg">
              Nama sistem, zona waktu, dan interval refresh monitoring.
            </div>
          </div>
          <button type="button" className="btn-pill-primary">
            Simpan
          </button>
        </div>

        <div className="form-grid-3">
          <div>
            <div className="text-sm-muted">Nama sistem</div>
            <input className="form-control" value={systemName} onChange={(e) => setSystemName(e.target.value)} />
          </div>
          <div>
            <div className="text-sm-muted">Timezone</div>
            <select className="form-control" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="Asia/Jakarta">Asia/Jakarta</option>
              <option value="Asia/Makassar">Asia/Makassar</option>
              <option value="Asia/Jayapura">Asia/Jayapura</option>
            </select>
          </div>
          <div>
            <div className="text-sm-muted">Refresh sensor (detik)</div>
            <input
              className="form-control"
              type="number"
              min={1}
              max={60}
              value={refreshSec}
              onChange={(e) => setRefreshSec(Number(e.target.value || 0))}
            />
          </div>
        </div>
      </section>

      <section className="card card-elevated u-mb-15">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Otomasi & Notifikasi</div>
            <div className="card-subtitle card-subtitle-lg">Kontrol perilaku sistem saat kondisi kritis.</div>
          </div>
        </div>

        <div className="simple-card-list">
          <Switch
            checked={notifEnabled}
            onChange={setNotifEnabled}
            label="Notifikasi aktif"
            description="Kirim notifikasi saat threshold terlewati."
          />
          <Switch
            checked={autoIrrigation}
            onChange={setAutoIrrigation}
            label="Otomasi irigasi"
            description="Jalankan irigasi otomatis saat kelembapan di bawah batas."
          />
          <Switch
            checked={aiAutoAnalyze}
            onChange={setAiAutoAnalyze}
            label="AI auto-analyze"
            description="Analisis citra otomatis saat ada upload baru."
          />
        </div>
      </section>

      <section className="card card-elevated">
        <div className="card-header card-header-top card-header-top-gap">
          <div>
            <div className="card-title card-title-lg">Log Aktivitas</div>
            <div className="card-subtitle card-subtitle-lg">
              Audit singkat aktivitas sistem (dummy).
            </div>
          </div>
          <div style={{ minWidth: 260 }}>
            <input
              className="form-control"
              placeholder="Cari log..."
              value={logQuery}
              onChange={(e) => setLogQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="simple-card-list">
          {logs.map((l) => (
            <article key={l.id} className="card card-elevated">
              <div className="u-flex u-justify-between u-align-start u-gap-1">
                <div>
                  <div className="u-flex u-align-center u-gap-075 u-flex-wrap">
                    <span className={levelBadge(l.level)}>{l.level.toUpperCase()}</span>
                    <div className="card-title card-title-lg">{l.message}</div>
                  </div>
                  <div className="text-sm-muted u-mt-04">
                    {l.id} · {l.time}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
