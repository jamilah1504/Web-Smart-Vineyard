import { useMemo, useState } from 'react'

const dummyResults = [
  { label: 'Healthy Leaf', confidence: 0.92, badge: 'badge-pill-success' },
  { label: 'Chlorosis', confidence: 0.78, badge: 'badge-pill-neutral' },
  { label: 'Necrosis', confidence: 0.73, badge: 'badge-pill-critical' },
]

export default function UploadImagePage() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const canAnalyze = useMemo(() => Boolean(file) && !analyzing, [file, analyzing])

  const onPick = (f) => {
    if (!f) return
    setFile(f)
    setResult(null)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
  }

  const analyze = async () => {
    if (!file) return
    setAnalyzing(true)
    setResult(null)

    // Simulasi request /api/ai/analyze
    await new Promise((r) => setTimeout(r, 900))
    const pick = dummyResults[Math.floor(Math.random() * dummyResults.length)]
    setResult(pick)
    setAnalyzing(false)
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
  }

  return (
    <div className="page page-with-padding page-shell">
      <section className="card card-elevated u-mb-15">
        <div className="card-header card-header-top card-header-top-gap">
          <div>
            <div className="card-title card-title-lg">Upload Citra Daun</div>
            <div className="card-subtitle card-subtitle-lg">
              Upload foto daun, preview, lalu jalankan analisis AI (dummy — siap ke endpoint{' '}
              <strong>/api/ai/analyze</strong>).
            </div>
          </div>
          <div className="u-flex u-gap-075 u-flex-wrap">
            <button type="button" className="btn-pill-outline" onClick={reset} disabled={!file && !previewUrl}>
              Reset
            </button>
            <button type="button" className="btn-pill-primary" onClick={analyze} disabled={!canAnalyze}>
              {analyzing ? 'Menganalisis...' : 'Analisis AI'}
            </button>
          </div>
        </div>

        <div className="simple-card-list">
          <div className="card card-elevated">
            <div className="text-sm-muted">Pilih file</div>
            <input
              className="form-control"
              type="file"
              accept="image/*"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
            <div className="text-sm-muted u-mt-04">
              Format: JPG/PNG. Ukuran disarankan &lt; 5MB.
            </div>
          </div>

          <div className="card card-elevated">
            <div className="card-header card-header-top">
              <div>
                <div className="card-title card-title-lg">Preview</div>
                <div className="card-subtitle card-subtitle-lg">
                  {file ? file.name : 'Belum ada gambar dipilih'}
                </div>
              </div>
            </div>
            <div className="placeholder-photo placeholder-striped">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview daun" className="u-img-preview" />
              ) : (
                <div className="text-body">Pilih gambar untuk melihat preview.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="card card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Hasil Analisis</div>
            <div className="card-subtitle card-subtitle-lg">
              {result ? 'Hasil dari model AI (dummy).' : 'Jalankan analisis untuk mendapatkan hasil.'}
            </div>
          </div>
          {result ? (
            <span className={result.badge}>
              {result.label} · {(result.confidence * 100).toFixed(0)}%
            </span>
          ) : null}
        </div>

        <div className="text-body">
          {analyzing ? (
            <div className="placeholder-striped">Memproses gambar…</div>
          ) : result ? (
            <div className="simple-card-list">
              <div className="card card-elevated">
                <div className="card-title card-title-lg">Diagnosis</div>
                <div className="text-body u-mt-025">{result.label}</div>
              </div>
              <div className="card card-elevated">
                <div className="card-title card-title-lg">Confidence</div>
                <div className="text-body u-mt-025">{(result.confidence * 100).toFixed(2)}%</div>
              </div>
              <div className="card card-elevated">
                <div className="card-title card-title-lg">Catatan Tindak Lanjut</div>
                <div className="text-body u-mt-025">
                  {result.label === 'Healthy Leaf'
                    ? 'Tidak ada tindakan khusus. Lanjutkan monitoring rutin.'
                    : 'Ambil 2–3 sampel daun tambahan dan konsultasikan ke agronomis.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder-striped">Belum ada hasil.</div>
          )}
        </div>
      </section>
    </div>
  )
}
