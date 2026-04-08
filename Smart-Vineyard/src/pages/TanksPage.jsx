function TanksPage() {
  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Manajemen Tandon Air</div>
          <div className="page-caption page-caption-lg">
            Pantau dan kelola status tandon air untuk irigasi. Lihat level air, kapasitas, dan jadwal pengisian otomatis.
          </div>
        </div>
      </div>

      {/* Tank Status Cards */}
      <section className="card-grid-3 u-mb-1">
        <div className="card card-animate card-elevated card-stretch">
          <div className="card-header card-header-top-md">
            <div>
              <div className="card-title card-title-lg">Tandon Utama</div>
              <div className="card-subtitle card-subtitle-lg">Blok A – Status pengisian</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="small-stat">
              <div className="small-text text-sm-muted">Level Air</div>
              <div className="big-number">85%</div>
              <div className="small-text text-sm-muted">4,250 liter / 5,000 liter</div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Status</div>
              <div style={{ color: '#27ae60', fontSize: '0.95rem', fontWeight: 'bold' }}>✓ Normal</div>
              <div className="small-text text-sm-muted">Pertama kali diisi 3 jam lalu</div>
            </div>
          </div>
        </div>

        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Tandon Cadangan</div>
              <div className="card-subtitle card-subtitle-lg">Blok B – Status pengisian</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="small-stat">
              <div className="small-text text-sm-muted">Level Air</div>
              <div className="big-number">52%</div>
              <div className="small-text text-sm-muted">2,600 liter / 5,000 liter</div>
            </div>
            <div className="small-stat">
              <div className="small-text text-sm-muted">Kondisi</div>
              <div style={{ color: '#f39c12', fontSize: '0.95rem', fontWeight: 'bold' }}>⚠ Perhatian</div>
              <div className="small-text text-sm-muted">Akan diisi otomatis dalam 2 jam</div>
            </div>
          </div>
        </div>

        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Jadwal Irigasi</div>
              <div className="card-subtitle card-subtitle-lg">Settings otomatis per tandon</div>
            </div>
          </div>
          <div className="simple-list u-mt-05">
            <div className="small-text">
              • <strong>06:00 – 09:00</strong> – Pagi (Blok A)
            </div>
            <div className="small-text">
              • <strong>15:00 – 18:00</strong> – Sore (Blok A)
            </div>
            <div className="small-text">
              • <strong>06:30 – 08:00</strong> – Pagi (Blok B)
            </div>
            <div className="small-text">
              • <strong>17:00 – 19:00</strong> – Sore (Blok B)
            </div>
          </div>
        </div>
      </section>

      {/* Tabel Historis */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Riwayat Pengisian Tandon</div>
            <div className="card-subtitle card-subtitle-lg">
              Catatan pengisian & penggunaan air 7 hari terakhir
            </div>
          </div>
        </div>
        <div className="table-wrapper u-mt-05">
          <table className="table table-compact">
            <thead>
              <tr style={{ borderBottom: '3px solid #27ae60' }}>
                <th style={{ color: '#27ae60' }}>Waktu</th>
                <th style={{ color: '#27ae60' }}>Tandon</th>
                <th style={{ color: '#27ae60' }}>Tipe</th>
                <th style={{ color: '#27ae60' }}>Volume (liter)</th>
                <th style={{ color: '#27ae60' }}>Level Sebelum</th>
                <th style={{ color: '#27ae60' }}>Level Sesudah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12 Mar 2026, 06:00</td>
                <td>Tandon Utama</td>
                <td>Pengisian Otomatis</td>
                <td>850</td>
                <td>35%</td>
                <td>52%</td>
              </tr>
              <tr>
                <td>12 Mar 2026, 09:30</td>
                <td>Tandon Utama</td>
                <td>Irigasi Otomatis</td>
                <td>650</td>
                <td>52%</td>
                <td>38%</td>
              </tr>
              <tr>
                <td>11 Mar 2026, 18:15</td>
                <td>Tandon Cadangan</td>
                <td>Pengisian Manual</td>
                <td>1200</td>
                <td>20%</td>
                <td>44%</td>
              </tr>
            </tbody>
          </table>
          <div className="small-text text-sm-muted u-mt-05" style={{ textAlign: 'center', padding: '12px', color: '#95a5a6' }}>
            Data riwayat pengisian tandon
          </div>
        </div>
      </section>
    </div>
  )
}

export default TanksPage
