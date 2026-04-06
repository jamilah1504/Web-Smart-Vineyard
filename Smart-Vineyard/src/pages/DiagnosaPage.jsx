import { useState } from 'react'

const seed = [
  {
    id: 1,
    date: '2026-03-12',
    blok: 'Blok A',
    disease: 'Powdery Mildew',
    severity: 'Tinggi',
    confidence: '92%',
    recommendation: 'Aplikasikan fungisida sulfur. Tingkatkan ventilasi & kurangi kelembapan.',
    status: 'Terdeteksi',
  },
  {
    id: 2,
    date: '2026-03-11',
    blok: 'Blok B',
    disease: 'Downy Mildew',
    severity: 'Sedang',
    confidence: '78%',
    recommendation: 'Spray dengan metalaksil. Monitor kelembapan harian.',
    status: 'Monitoring',
  },
  {
    id: 3,
    date: '2026-03-10',
    blok: 'Blok C',
    disease: 'Black Rot',
    severity: 'Rendah',
    confidence: '64%',
    recommendation: 'Observasi lebih lanjut. Jangan ada tanda risiko tinggi.',
    status: 'Stabil',
  },
]

function severityBadge(severity) {
  if (severity === 'Tinggi') return 'badge-pill-critical'
  if (severity === 'Sedang') return 'badge-pill-warning'
  return 'badge-pill-success'
}

function severityLabel(severity) {
  if (severity === 'Tinggi') return 'Severity Tinggi'
  if (severity === 'Sedang') return 'Severity Sedang'
  return 'Severity Rendah'
}

function statusBadge(status) {
  if (status === 'Terdeteksi') return 'badge-pill-critical'
  if (status === 'Monitoring') return 'badge-pill-warning'
  return 'badge-pill-success'
}

export default function DiagnosaPage() {
  const [diagnosisResults] = useState(seed)

  return (
    <div className="page page-with-padding page-shell">
      <section className="card card-elevated u-mb-15">
        <div className="card-header card-header-top card-header-top-gap">
          <div>
            <div className="card-title card-title-lg">Diagnosa Penyakit Tanaman (AI)</div>
            <div className="card-subtitle card-subtitle-lg">
              Hasil deteksi otomatis menggunakan kamera dan analisis citra (dummy — siap ke API).
            </div>
          </div>
          <span className="badge-pill-neutral">Total {diagnosisResults.length}</span>
        </div>
      </section>

      <section className="card card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Status Diagnosa</div>
            <div className="card-subtitle card-subtitle-lg">Riwayat deteksi 10 hari terakhir</div>
          </div>
        </div>

        <div className="simple-card-list">
          {diagnosisResults.map((result) => (
            <article key={result.id} className="card card-elevated">
              <div className="u-flex u-justify-between u-align-start u-gap-1">
                <div style={{ flex: 1 }}>
                  <div className="u-flex u-align-center u-gap-075 u-flex-wrap">
                    <div className="card-title card-title-lg">{result.disease}</div>
                    <span className={severityBadge(result.severity)}>{severityLabel(result.severity)}</span>
                    <span className="badge-pill-neutral">{result.blok}</span>
                    <span className={statusBadge(result.status)}>{result.status}</span>
                  </div>
                  <div className="text-body u-mt-025">
                    <strong>Confidence:</strong> {result.confidence}
                  </div>
                  <div className="text-body u-mt-025">
                    <strong>Rekomendasi:</strong> {result.recommendation}
                  </div>
                  <div className="text-sm-muted u-mt-04">
                    Diagnosa #{result.id} · {result.date}
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
