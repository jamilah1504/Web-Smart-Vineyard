import { useMemo, useState } from 'react'

const seed = [
  {
    id: 'H-001',
    time: '2026-03-10 08:30',
    block: 'Blok A',
    type: 'sensor',
    title: 'Soil Moisture 55%',
    note: 'Mendekati batas bawah threshold (60%).',
  },
  {
    id: 'H-002',
    time: '2026-03-10 09:05',
    block: 'Blok A',
    type: 'action',
    title: 'Irigasi manual dijalankan',
    note: 'Durasi 12 menit (pompa aktif).',
  },
  {
    id: 'H-003',
    time: '2026-03-10 14:20',
    block: 'Blok C',
    type: 'ai',
    title: 'AI: Klorosis ringan',
    note: 'Confidence 0.74, perlu observasi lanjutan.',
  },
  {
    id: 'H-004',
    time: '2026-03-11 07:10',
    block: 'Blok B',
    type: 'sensor',
    title: 'NPK stabil',
    note: 'N:120 P:45 K:180, pH 6.5.',
  },
]

const typeLabel = {
  sensor: 'Sensor',
  ai: 'AI',
  action: 'Aksi',
}

function typeBadge(type) {
  if (type === 'ai') return 'badge-pill-neutral'
  if (type === 'action') return 'badge-pill-success'
  return 'badge-pill-neutral'
}

export default function HistoryPage() {
  const [items] = useState(seed)
  const [query, setQuery] = useState('')
  const [block, setBlock] = useState('all')
  const [type, setType] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      const matchesQ =
        !q ||
        it.title.toLowerCase().includes(q) ||
        it.note.toLowerCase().includes(q) ||
        it.id.toLowerCase().includes(q)
      const matchesBlock = block === 'all' ? true : it.block === block
      const matchesType = type === 'all' ? true : it.type === type
      return matchesQ && matchesBlock && matchesType
    })
  }, [items, query, block, type])

  return (
    <div className="page page-with-padding page-shell">
      <section className="card card-elevated u-mb-15">
        <div className="card-header card-header-top card-header-top-gap">
          <div>
            <div className="card-title card-title-lg">Riwayat Data & Aktivitas</div>
            <div className="card-subtitle card-subtitle-lg">
              Riwayat sensor, hasil AI, dan tindakan (dummy — siap sinkron ke backend).
            </div>
          </div>
          <span className="badge-pill-neutral">Total {items.length}</span>
        </div>

        <div className="form-grid-3">
          <div>
            <div className="text-sm-muted">Cari</div>
            <input
              className="form-control"
              placeholder="Cari event..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <div className="text-sm-muted">Blok</div>
            <select className="form-control" value={block} onChange={(e) => setBlock(e.target.value)}>
              <option value="all">Semua</option>
              <option value="Blok A">Blok A</option>
              <option value="Blok B">Blok B</option>
              <option value="Blok C">Blok C</option>
            </select>
          </div>
          <div>
            <div className="text-sm-muted">Tipe</div>
            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Semua</option>
              <option value="sensor">Sensor</option>
              <option value="ai">AI</option>
              <option value="action">Aksi</option>
            </select>
          </div>
        </div>
      </section>

      <section className="card card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Timeline</div>
            <div className="card-subtitle card-subtitle-lg">
              Hasil filter: <strong>{filtered.length}</strong>
            </div>
          </div>
        </div>

        <div className="simple-card-list">
          {filtered.map((it) => (
            <article key={it.id} className="card card-elevated">
              <div className="u-flex u-justify-between u-align-start u-gap-1">
                <div>
                  <div className="u-flex u-align-center u-gap-075 u-flex-wrap">
                    <div className="card-title card-title-lg">{it.title}</div>
                    <span className={typeBadge(it.type)}>{typeLabel[it.type] ?? it.type}</span>
                    <span className="badge-pill-neutral">{it.block}</span>
                  </div>
                  <div className="text-body u-mt-025">{it.note}</div>
                  <div className="text-sm-muted u-mt-04">
                    {it.id} · {it.time}
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
