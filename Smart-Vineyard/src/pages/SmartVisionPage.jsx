import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const DEVICE_ID = "ESP32-MAC-A001"; // ID Perangkat Default
  const BASE_URL = "http://localhost:5000";

  // Load Initial Data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
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

  // --- LOGIKA KAMERA ---
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
      alert('Gagal akses kamera: ' + error.message);
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Set canvas size sesuai video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      context.drawImage(videoRef.current, 0, 0);
      
      const base64 = canvasRef.current.toDataURL('image/jpeg');
      setPhotoPreview(base64);
      
      // Convert base64 to File object untuk selectedPhoto
      fetch(base64)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setSelectedPhoto(file);
        });

      handleCloseCamera();
    }
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // --- LOGIKA FILE / GALERI ---
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File terlalu besar (Maks 5MB)');
      return;
    }

    setSelectedPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result);
    reader.readAsDataURL(file);
  };

  // --- INTEGRASI BACKEND (ANALISIS) ---
  const handleAnalyzePhoto = async () => {
    if (!photoPreview) return;

    setIsAnalyzing(true);
    const token = localStorage.getItem('sv_access_token');

    try {
      const response = await axios.post(`${BASE_URL}/api/diagnosis/detect`, {
        perangkat_id: DEVICE_ID,
        image_base64: photoPreview // Mengirim string base64 yang sudah ada di preview
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        alert(`Analisis Berhasil: ${response.data.diagnosis}`);
        
        // Update UI secara instan
        setLatest(response.data.data);
        setHistory(prev => [response.data.data, ...prev]);
        
        // Reset Preview
        handleClearPhoto();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menganalisis: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearPhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) return <div className="page page-with-padding">Memuat Data Vision...</div>;

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Smart Vision (AI Diagnosis)</div>
          <div className="page-caption page-caption-lg">Deteksi kesehatan daun secara real-time.</div>
        </div>
      </div>

      {/* Buttons */}
      <section className="u-mb-1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button className="btn-primary btn-pill-primary" onClick={handleOpenCamera} style={{ padding: '15px' }}>
            📷 Ambil Foto
          </button>
          <button className="btn-pill-outline" onClick={() => fileInputRef.current.click()} style={{ padding: '15px' }}>
            📁 Dari Galeri
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
      </section>

      {/* Camera Modal */}
      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
          <video ref={videoRef} autoPlay playsInline style={{ flex: 1, width: '100%', objectFit: 'cover' }} />
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button className="btn-primary" onClick={handleCapturePhoto} style={{ borderRadius: '50%', width: '70px', height: '70px', fontSize: '24px' }}>📸</button>
            <button className="btn-pill-outline" onClick={handleCloseCamera} style={{ color: '#fff' }}>Batal</button>
          </div>
        </div>
      )}

      {/* Preview Card */}
      {photoPreview && (
        <section className="card card-elevated u-mb-1 card-animate">
          <div className="u-p-1 u-text-center">
            <img src={photoPreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '300px' }} />
            <div className="btn-row u-mt-1">
              <button className="btn-primary btn-pill-primary" onClick={handleAnalyzePhoto} disabled={isAnalyzing}>
                {isAnalyzing ? 'Menganalisis...' : 'Mulai Analisis AI'}
              </button>
              <button className="btn-pill-outline" onClick={handleClearPhoto}>Batal</button>
            </div>
          </div>
        </section>
      )}

      {/* Layout Grid */}
      <section className="card-grid-2 grid-2-wide u-mb-1">
        {/* Latest Result */}
        <div className="card card-elevated">
          <div className="card-header">
            <div className="card-title">Diagnosis Terakhir</div>
            <div className="card-subtitle">{latest ? new Date(latest.createdAt).toLocaleString() : '-'}</div>
          </div>
          <div className="u-p-1 u-text-center">
            {latest ? (
              <>
                <img src={`${BASE_URL}${latest.image_url}`} className="u-img-fluid" style={{ borderRadius: '8px', maxHeight: '200px' }} />
                <div className={`ai-label u-mt-1 ${latest.hasil_diagnosis === 'Sehat' ? 'ai-label-pill-success' : 'ai-label-pill-critical'}`}>
                  {latest.hasil_diagnosis}
                </div>
                <div className="small-text u-mt-05">Akurasi: {(latest.confidence_score * 100).toFixed(1)}%</div>
              </>
            ) : <p>Belum ada riwayat.</p>}
          </div>
        </div>

        {/* Saran */}
        <div className="card card-elevated">
          <div className="card-header"><div className="card-title">Rekomendasi</div></div>
          <div className="u-p-1" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            {latest ? latest.saran_tindakan : "Gunakan fitur kamera untuk mendapatkan saran perawatan."}
          </div>
        </div>
      </section>

      {/* History Table */}
      <section className="card card-elevated">
        <div className="card-header"><div className="card-title">Riwayat Deteksi</div></div>
        <div className="u-overflow-x">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px' }}>Foto</th>
                <th style={{ padding: '12px' }}>Penyakit</th>
                <th style={{ padding: '12px' }}>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '8px' }}>
                    <img src={`${BASE_URL}${item.image_url}`} style={{ width: '45px', height: '45px', borderRadius: '4px', objectFit: 'cover' }} />
                  </td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.hasil_diagnosis}</td>
                  <td style={{ padding: '8px', fontSize: '0.8rem' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default SmartVisionPage;