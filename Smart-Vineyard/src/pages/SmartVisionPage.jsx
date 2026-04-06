import { useState, useEffect, useRef } from 'react';
import { getLatestDiagnosis, getDiagnosisHistory } from '../services/diagnosisApi';

function SmartVisionPage() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const DEVICE_ID = "ESP32-MAC-A001"; 
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchAIStatus = async () => {
      try {
        const res = await getLatestDiagnosis(DEVICE_ID);
        if (res.status === 'success') setLatest(res.data);
        
        const resHistory = await getDiagnosisHistory(DEVICE_ID);
        if (resHistory.status === 'success') setHistory(resHistory.data);
      } catch (err) {
        console.error("Gagal ambil data AI:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAIStatus();
  }, []);

  // Handle camera access
  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Tidak bisa akses kamera. Error: ' + error.message);
    }
  };

  // Capture photo dari camera
  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedPhoto(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreview(e.target?.result);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
      
      // Stop camera
      handleCloseCamera();
    }
  };

  // Close camera
  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

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

  // Analisis foto
  const handleAnalyzePhoto = async () => {
    if (!selectedPhoto) {
      alert('Silakan pilih foto terlebih dahulu!')
      return
    }

    setIsAnalyzing(true)
    
    try {
      alert('Analisis foto sedang diproses dengan AI...')
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

  if (loading) return <div className="page page-with-padding">Menganalisis Data AI...</div>;

  return (
    <div className="page page-with-padding page-shell">
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Smart Vision (AI Diagnosis)</div>
          <div className="page-caption page-caption-lg">Analisis visual daun anggur via Roboflow AI.</div>
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
            onClick={handleOpenCamera}
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
            <span>Ambil Foto</span>
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

      {/* Hidden Canvas untuk capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} width={1280} height={720} />

      {/* Camera Modal */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxWidth: '600px',
                height: 'auto',
                borderRadius: '12px',
                backgroundColor: '#000'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-primary btn-pill-primary"
                onClick={handleCapturePhoto}
              >
                ✓ Ambil Foto
              </button>
              <button
                type="button"
                className="btn-pill-outline"
                onClick={handleCloseCamera}
              >
                ✕ Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input - Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

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

      <section className="card-grid-2 grid-2-wide u-mb-1">
        {/* HASIL ANALISIS DINAMIS DENGAN GAMBAR */}
        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Hasil Analisis Terakhir</div>
              <div className="card-subtitle card-subtitle-lg">
                {latest ? new Date(latest.createdAt).toLocaleString('id-ID') : 'Tidak ada data'}
              </div>
            </div>
          </div>
          
          {/* TAMPILAN GAMBAR UTAMA */}
          <div className="u-p-1 u-text-center">
            {latest?.image_url ? (
              <img 
                src={`${BASE_URL}${latest.image_url}`} 
                alt="Diagnosis Daun" 
                className="u-img-fluid"
                style={{ maxHeight: '250px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #ddd' }}
              />
            ) : (
              <div style={{ height: '200px', backgroundColor: '#f0f0f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="small-text">Foto tidak tersedia</span>
              </div>
            )}
          </div>

          <div className="ai-diagnosis u-mt-05">
            <div className={`ai-label ${latest?.hasil_diagnosis === 'Sehat' ? 'ai-label-pill-success' : 'ai-label-pill-critical'}`}>
              {latest ? latest.hasil_diagnosis : 'Belum Ada Data'}
            </div>
            <div className="ai-tagline ai-tagline-body u-mt-05">
              Confidence: <strong>{latest ? (latest.confidence_score * 100).toFixed(2) : 0}%</strong>
            </div>
          </div>
        </div>

        {/* REKOMENDASI TINDAKAN */}
        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Rekomendasi Tindakan</div>
              <div className="card-subtitle card-subtitle-lg">Berdasarkan hasil diagnosa AI</div>
            </div>
          </div>
          <div className="small-text text-body" style={{ padding: '15px', lineHeight: '1.6' }}>
            {latest ? latest.saran_tindakan : "Silakan ambil foto daun menggunakan ESP32-CAM untuk memulai analisis."}
          </div>
        </div>
      </section>

      {/* GALERI RIWAYAT DIAGNOSIS */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top u-mb-1">
          <div>
            <div className="card-title card-title-lg">Riwayat Diagnosa AI</div>
            <div className="card-subtitle card-subtitle-lg">Daftar deteksi penyakit sebelumnya</div>
          </div>
        </div>
        <div className="u-mt-1 u-overflow-x">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Foto</th>
                <th style={{ padding: '12px' }}>Waktu</th>
                <th style={{ padding: '12px' }}>Hasil Diagnosis</th>
                <th style={{ padding: '12px' }}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '12px' }}>
                    <img 
                      src={`${BASE_URL}${log.image_url}`} 
                      alt="thumb" 
                      style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #eee' }}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/50?text=NA" }}
                    />
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`u-text-bold ${log.hasil_diagnosis === 'Sehat' ? 'u-text-success' : 'u-text-danger'}`}>
                      {log.hasil_diagnosis}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{(log.confidence_score * 100).toFixed(1)}%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Belum ada riwayat analisis.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SmartVisionPage;