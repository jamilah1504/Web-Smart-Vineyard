import { useState, useRef } from 'react'

function AnalysisPage() {
  const [analysisHistory] = useState([
    {
      id: 1,
      date: '2026-03-12',
      image: 'daun_sehat.jpg',
      disease: 'Tidak Ada Penyakit',
      confidence: '98%',
      status: 'Sehat',
      recommendation: 'Lanjutkan monitoring rutin',
    },
    {
      id: 2,
      date: '2026-03-11',
      image: 'daun_powdery.jpg',
      disease: 'Powdery Mildew',
      confidence: '92%',
      status: 'Terdeteksi',
      recommendation: 'Aplikasikan fungisida sulfur. Kurangi kelembapan.',
    },
    {
      id: 3,
      date: '2026-03-10',
      image: 'daun_downy.jpg',
      disease: 'Downy Mildew',
      confidence: '85%',
      status: 'Terdeteksi',
      recommendation: 'Spray metalaksil. Monitor kelembapan harian.',
    },
  ])

  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Handle file selection dari galeri
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.')
      return
    }

    // Validasi tipe file
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG atau PNG.')
      return
    }

    setSelectedPhoto(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result)
    }
    reader.readAsDataURL(file)
  }

  // Handle camera capture
  const handleCameraCapture = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedPhoto(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result)
    }
    reader.readAsDataURL(file)
  }

  // Analisis foto
  const handleAnalyzePhoto = async () => {
    if (!selectedPhoto) {
      alert('Silakan pilih foto terlebih dahulu!')
      return
    }

    setIsAnalyzing(true)
    
    try {
      // TODO: Implementasi API untuk analisis foto
      // const formData = new FormData()
      // formData.append('photo', selectedPhoto)
      // const response = await analyzePhoto(formData)
      
      alert('Analisis foto sedang diproses...')
      // Simulasi proses analisis
      setTimeout(() => {
        setIsAnalyzing(false)
        alert('Foto berhasil dianalisis!')
        setSelectedPhoto(null)
        setPhotoPreview(null)
      }, 2000)
    } catch (error) {
      console.error('Error analyzing photo:', error)
      alert('Gagal menganalisis foto: ' + error.message)
      setIsAnalyzing(false)
    }
  }

  // Bersihkan preview
  const handleClearPhoto = () => {
    setSelectedPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="page page-with-padding page-shell">
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Analisis Penyakit Tanaman (AI)</div>
          <div className="page-caption page-caption-lg">
            Hasil analisis AI dari foto daun menggunakan Computer Vision
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <section className="u-mb-1">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button 
            type="button" 
            className="btn-primary btn-pill-primary"
            onClick={() => cameraInputRef.current?.click()}
            style={{
              padding: '16px 20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '12px',
              transition: 'all 0.3s'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📷</span>
            <span>Buka Kamera</span>
          </button>

          <button 
            type="button" 
            className="btn-pill-outline"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '16px 20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '12px',
              transition: 'all 0.3s'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📁</span>
            <span>Pilih Galeri</span>
          </button>
        </div>
      </section>

      {/* Hidden File Input - Camera */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCameraCapture}
      />

      {/* Hidden File Input - Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Information Cards */}
      <section className="card-grid-2 u-mb-1">
        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">📷 Ambil Foto Langsung</div>
              <div className="card-subtitle card-subtitle-lg">Dari kamera perangkat Anda</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="small-text" style={{ marginBottom: '12px' }}>
              ✓ Capture langsung dari kamera HP/Tablet
            </div>
            <div className="small-text" style={{ marginBottom: '12px' }}>
              ✓ Format: Semua format foto
            </div>
            <div className="small-text text-sm-muted">
              Tekan tombol "🎥 Buka Kamera" untuk mulai
            </div>
          </div>
        </div>

        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">📁 Pilih dari Galeri</div>
              <div className="card-subtitle card-subtitle-lg">Foto yang sudah tersimpan</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="small-text" style={{ marginBottom: '12px' }}>
              ✓ JPG, PNG format
            </div>
            <div className="small-text" style={{ marginBottom: '12px' }}>
              ✓ Maksimal 5MB
            </div>
            <div className="small-text text-sm-muted">
              Tekan tombol "📁 Pilih Galeri" untuk browse
            </div>
          </div>
        </div>
      </section>

      {/* Photo Preview & Analysis */}
      {photoPreview && (
        <section className="card card-animate card-elevated u-mb-1">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Preview Foto</div>
              <div className="card-subtitle card-subtitle-lg">Nama file: {selectedPhoto?.name}</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <img 
                src={photoPreview} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-primary btn-pill-primary"
                style={{ flex: 1 }}
                onClick={handleAnalyzePhoto}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '⏳ Menganalisis...' : '✓ Analisis Foto'}
              </button>
              <button
                type="button"
                className="btn-pill-outline"
                style={{ flex: 1 }}
                onClick={handleClearPhoto}
                disabled={isAnalyzing}
              >
                ✕ Batal
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Analysis Results */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Riwayat Analisis</div>
            <div className="card-subtitle card-subtitle-lg">10 analisis terakhir</div>
          </div>
        </div>
        <div className="table-wrapper u-mt-05">
          <table className="table table-compact">
            <thead>
              <tr style={{ borderBottom: '3px solid #27ae60' }}>
                <th style={{ color: '#27ae60' }}>Tanggal</th>
                <th style={{ color: '#27ae60' }}>File</th>
                <th style={{ color: '#27ae60' }}>Penyakit</th>
                <th style={{ color: '#27ae60' }}>Confidence</th>
                <th style={{ color: '#27ae60' }}>Status</th>
                <th style={{ color: '#27ae60' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {analysisHistory.map((result) => (
                <tr key={result.id}>
                  <td>{result.date}</td>
                  <td>{result.image}</td>
                  <td>{result.disease}</td>
                  <td>{result.confidence}</td>
                  <td style={{ fontWeight: 'bold', color: result.status === 'Sehat' ? '#27ae60' : '#e74c3c' }}>
                    {result.status}
                  </td>
                  <td>
                    <button type="button" className="btn-pill-outline" style={{ padding: '4px 8px', fontSize: '0.85rem' }}>
                      Lihat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="small-text text-sm-muted u-mt-05" style={{ textAlign: 'center', padding: '12px', color: '#95a5a6' }}>
            Riwayat analisis AI penyakit
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="card card-animate card-elevated u-mt-1">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Rekomendasi</div>
            <div className="card-subtitle card-subtitle-lg">Berdasarkan analisis terbaru</div>
          </div>
        </div>
        <div className="simple-list u-mt-05">
          {analysisHistory.slice(0, 2).map((result) => (
            <div
              key={result.id}
              style={{
                padding: '12px',
                marginBottom: '12px',
                borderLeft: '4px solid #f39c12',
                backgroundColor: '#fef5e7',
                borderRadius: '4px',
              }}
            >
              <div className="small-text" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {result.disease} ({result.date})
              </div>
              <div className="small-text" style={{ fontSize: '0.9rem' }}>
                {result.recommendation}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AnalysisPage
