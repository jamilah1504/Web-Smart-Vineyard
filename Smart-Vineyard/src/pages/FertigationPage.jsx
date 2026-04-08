import { useState } from 'react'

function FertigationPage() {
  const [pumpOn, setPumpOn] = useState(false)
  const [solenoidOn, setSolenoidOn] = useState(false)

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Smart Fertigation</div>
          <div className="page-caption page-caption-lg">
            Kontrol penyiraman dan pemberian nutrisi berbasis kontrol proporsional.
          </div>
        </div>
        <span
          className="badge badge-pill-success"
        >
          Mode Otomatis
        </span>
      </div>

      <section
        className="card-grid-2 grid-2-wide"
      >
        <div
          className="card card-animate card-animate-delay-1 card-elevated"
        >
          <div
            className="card-header card-header-top"
          >
            <div>
              <div className="card-title card-title-lg">Status Sistem</div>
              <div className="card-subtitle card-subtitle-lg">
                Ringkasan operasi fertigasi
              </div>
            </div>
          </div>
          <div className="small-text text-stat">
            Moisture sekarang: <strong>62%</strong> · Target: <strong>65%</strong>
          </div>
          <div className="small-text text-stat-muted u-mt-04">
            Mode kontrol: <strong>Proportional Control</strong>
          </div>
          <div className="small-text text-stat-muted u-mt-04">
            Durasi penyiraman terakhir: <strong>120 detik</strong>
          </div>
        </div>

        <div
          className="card card-animate card-animate-delay-2 card-elevated"
        >
          <div
            className="card-header card-header-top"
          >
            <div>
              <div className="card-title card-title-lg">Kontrol Manual</div>
              <div className="card-subtitle card-subtitle-lg">
                Override mode otomatis
              </div>
            </div>
          </div>
          <div
            className="control-row control-row-lg u-mt-025"
          >
            <div>
              <div className="card-title">Pompa Irigasi</div>
              <div className="small-text text-body-sm">
                Status: {pumpOn ? 'MENYIRAM' : 'OFF'}
              </div>
            </div>
            <button
              type="button"
              className={`switch ${pumpOn ? 'switch-on' : ''}`}
              onClick={() => setPumpOn((v) => !v)}
              aria-label={pumpOn ? 'Matikan pompa' : 'Nyalakan pompa'}
            >
              <div className="switch-knob" />
            </button>
          </div>
          <div
            className="control-row control-row-lg u-mt-075"
          >
            <div>
              <div className="card-title">Solenoid Valve</div>
              <div className="small-text text-body-sm">
                Status: {solenoidOn ? 'TERBUKA' : 'TERTUTUP'}
              </div>
            </div>
            <button
              type="button"
              className={`switch ${solenoidOn ? 'switch-on' : ''}`}
              onClick={() => setSolenoidOn((v) => !v)}
              aria-label={solenoidOn ? 'Tutup solenoid' : 'Buka solenoid'}
            >
              <div className="switch-knob" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FertigationPage


