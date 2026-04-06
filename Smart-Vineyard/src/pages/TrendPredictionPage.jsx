import { useMemo } from 'react'
import { dummySamples as monitoringSamples } from './MonitoringPage.jsx'

function TrendPredictionPage() {
  const summary = useMemo(() => {
    const rows = monitoringSamples ?? []
    if (!rows.length) return null

    const last = rows[rows.length - 1]
    const first = rows[0]

    const moistureDelta = last.moisture - first.moisture
    const phDelta = (last.ph - first.ph).toFixed(2)

    return {
      moistureDelta,
      phDelta,
    }
  }, [])

  return (
    <div className="page page-with-padding page-shell">
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Prediksi Tren</div>
          <div className="page-caption page-caption-lg">
            Ringkasan pola perubahan kelembapan & nutrisi sebagai dasar rekomendasi agronomis.
          </div>
        </div>
      </div>

      <section className="card-grid-2 u-mb-1">
        <div className="card card-elevated card-animate card-animate-delay-1">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Ringkasan Tren</div>
              <div className="card-subtitle card-subtitle-lg">
                Perubahan dari awal hingga pembacaan terakhir (dummy).
              </div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="small-stat">
              <div className="small-text text-sm-muted">Δ Soil Moisture</div>
              <div className="big-number">
                {summary ? `${summary.moistureDelta > 0 ? '+' : ''}${summary.moistureDelta}%` : '–'}
              </div>
              </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Δ pH Tanah</div>
              <div className="big-number">
                {summary ? `${summary.phDelta > 0 ? '+' : ''}${summary.phDelta}` : '–'}
              </div>
            </div>
          </div>
        </div>

        <div className="card card-elevated card-animate card-animate-delay-2">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Interpretasi Tren</div>
              <div className="card-subtitle card-subtitle-lg">
                Narasi singkat yang nanti bisa diganti oleh model AI.
              </div>
            </div>
          </div>
          <div className="text-body u-mt-05">
            Dalam implementasi sesungguhnya, halaman ini akan menampilkan hasil analisis tren dari model
            statistik atau AI (mis. regresi, ARIMA) untuk memprediksi kebutuhan irigasi dan nutrisi pada
            beberapa jam ke depan. Saat ini konten masih berupa dummy yang siap digantikan oleh data
            backend.
          </div>
        </div>
      </section>
    </div>
  )
}

export default TrendPredictionPage