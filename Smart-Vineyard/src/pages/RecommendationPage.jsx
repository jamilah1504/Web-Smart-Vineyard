import { useMemo, useState } from 'react'

const seed = [
  {
    id: 'R-001',
    createdAt: '2026-03-10 09:12',
    block: 'Blok A',
    priority: 'high',
    title: 'Kelembapan turun di bawah threshold',
    summary: 'Naikkan durasi irigasi 10–15 menit dan cek mulsa pada area kering.',
    tags: ['irigasi', 'kelembapan'],
  },
  {
    id: 'R-002',
    createdAt: '2026-03-10 14:40',
    block: 'Blok C',
    priority: 'medium',
    title: 'Indikasi klorosis ringan (AI)',
    summary: 'Pantau N dan Fe, lakukan foliar feed bila gejala meningkat.',
    tags: ['ai', 'daun', 'nutrisi'],
  },
  {
    id: 'R-003',
    createdAt: '2026-03-11 07:05',
    block: 'Blok B',
    priority: 'low',
    title: 'Nutrisi stabil',
    summary: 'Pertahankan jadwal fertigation, lakukan sampling ulang 48 jam.',
    tags: ['fertigasi', 'npk'],
  },
]

function priorityBadge(priority) {
  if (priority === 'high') return 'badge-pill-critical'
  if (priority === 'medium') return 'badge-pill-neutral'
  return 'badge-pill-success'
}

function priorityLabel(priority) {
  if (priority === 'high') return 'Prioritas Tinggi'
  if (priority === 'medium') return 'Prioritas Sedang'
  return 'Prioritas Rendah'
}

export default function RecommendationPage() {
  const [items, setItems] = useState(seed)
  const [query, setQuery] = useState('')
  const [block, setBlock] = useState('all')
  const [priority, setPriority] = useState('all')

  const [form, setForm] = useState({
    block: 'Blok A',
    priority: 'medium',
    title: '',
    summary: '',
    tags: '',
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      const matchesQ =
        !q ||
        it.title.toLowerCase().includes(q) ||
        it.summary.toLowerCase().includes(q) ||
        it.id.toLowerCase().includes(q)
      const matchesBlock = block === 'all' ? true : it.block === block
      const matchesPriority = priority === 'all' ? true : it.priority === priority
      return matchesQ && matchesBlock && matchesPriority
    })
  }, [items, query, block, priority])

  const add = () => {
    const title = form.title.trim()
    const summary = form.summary.trim()
    if (!title || !summary) return

    const id = `R-${String(items.length + 1).padStart(3, '0')}`
    const createdAt = new Date().toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setItems((prev) => [
      {
        id,
        createdAt: createdAt.replace(/\./g, '-').replace(',', ''),
        block: form.block,
        priority: form.priority,
        title,
        summary,
        tags,
      },
      ...prev,
    ])

    setForm((p) => ({ ...p, title: '', summary: '', tags: '' }))
  }

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <section className="card card-elevated u-mb-15">
        <div className="card-header card-header-top card-header-top-gap">
          <div>
            <div className="card-title card-title-lg">Rekomendasi Perawatan</div>
            <div className="card-subtitle card-subtitle-lg">
              Catatan agronomis berbasis data sensor & hasil analisis AI (dummy — siap ke API).
            </div>
          </div>
          <span className="badge-pill-neutral">Total {items.length}</span>
        </div>

        <div className="form-grid-3 u-mb-1">
          <div>
            <div className="text-sm-muted">Cari</div>
            <input
              className="form-control"
              placeholder="Cari judul / tag / isi rekomendasi"
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
            <div className="text-sm-muted">Prioritas</div>
            <select
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
          </div>
        </div>
      </section>

      <section className="card card-elevated u-mb-15">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Tambah Rekomendasi</div>
            <div className="card-subtitle card-subtitle-lg">Buat catatan tindakan untuk tim lapangan.</div>
          </div>
          <button type="button" className="btn-pill-primary" onClick={add}>
            Simpan
          </button>
        </div>

        <div className="form-grid-3">
          <div>
            <div className="text-sm-muted">Blok</div>
            <select
              className="form-control"
              value={form.block}
              onChange={(e) => setForm((p) => ({ ...p, block: e.target.value }))}
            >
              <option value="Blok A">Blok A</option>
              <option value="Blok B">Blok B</option>
              <option value="Blok C">Blok C</option>
            </select>
          </div>
          <div>
            <div className="text-sm-muted">Prioritas</div>
            <select
              className="form-control"
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
            >
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
          </div>
          <div>
            <div className="text-sm-muted">Tags (pisah dengan koma)</div>
            <input
              className="form-control"
              placeholder="contoh: irigasi, nutrisi"
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            />
          </div>
          <div>
            <div className="text-sm-muted">Judul</div>
            <input
              className="form-control"
              placeholder="contoh: Kelembapan turun di Blok A"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="text-sm-muted">Rekomendasi</div>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Tulis tindakan yang disarankan..."
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="card card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Riwayat Rekomendasi</div>
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
                    <span className={priorityBadge(it.priority)}>{priorityLabel(it.priority)}</span>
                    <span className="badge-pill-neutral">{it.block}</span>
                  </div>
                  <div className="text-body u-mt-025">{it.summary}</div>
                  <div className="u-flex u-gap-05 u-flex-wrap u-mt-04">
                    {it.tags.map((t) => (
                      <span key={`${it.id}-${t}`} className="tag-pill tag-pill-neutral">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm-muted u-mt-04">
                    {it.id} · {it.createdAt}
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
