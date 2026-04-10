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

  // DAFTAR PERANGKAT YANG DIPANTAU (Agar semua data terbaca)
  const DEVICES = ["ESP32-MAC-A001", "ESPCAM-001"]; 
  const DEVICE_ID_DEFAULT = "ESP32-MAC-A001"; // ID untuk upload dari Web
  const BASE_URL = "https://d34f3d5l-5000.asse.devtunnels.ms"; // Sesuaikan URL Backend

  // Load Initial Data
  useEffect(() => {
    fetchInitialData();
    // Auto-refresh tiap 30 detik agar data dari ESP32-CAM masuk otomatis
    const interval = setInterval(fetchInitialData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. Ambil riwayat dari semua perangkat secara paralel
      const historyPromises = DEVICES.map(id => getDiagnosisHistory(id));
      const results = await Promise.all(historyPromises);
      
      // 2. Gabungkan data
      let allHistory = [];
      results.forEach(res => {
        if (res.status === 'success' && res.data) {
          allHistory = [...allHistory, ...res.data];
        }
      });

      // 3. Urutkan berdasarkan waktu terbaru
      allHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setHistory(allHistory);
      
      // 4. Set diagnosis terakhir dari siapa pun yang paling baru
      if (allHistory.length > 0) {
        setLatest(allHistory[0]);
      }
    } catch (err) {
      console.error("Gagal ambil data gabungan AI:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA KAMERA ---
  const handleOpenCamera = async () => {
    try {
      setShowCamera(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      }
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.oncanplay = () => resolve();
        });
        await videoRef.current.play();
      }
    } catch (error) {
      setShowCamera(false);
      alert('❌ Gagal akses kamera: ' + error.message);
    }
  };

  const handleCapturePhoto = () => {
    try {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      setPhotoPreview(base64);
      
      fetch(base64)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setSelectedPhoto(file);
        });

      handleCloseCamera();
    } catch (error) {
      alert('❌ Gagal mengambil foto: ' + error.message);
    }
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowCamera(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyzePhoto = async () => {
    if (!photoPreview) return;
    setIsAnalyzing(true);
    const token = localStorage.getItem('token'); // Menggunakan 'token' sesuai notifikasi sebelumnya

    try {
      const response = await axios.post(`${BASE_URL}/api/diagnosis/detect`, {
        perangkat_id: DEVICE_ID_DEFAULT,
        image_base64: photoPreview 
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        alert(`Analisis Berhasil: ${response.data.diagnosis}`);
        fetchInitialData(); // Refresh semua data
        handleClearPhoto();
      }
    } catch (error) {
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

  if (loading && history.length === 0) return <div className="page page-with-padding">Memuat Data Vision...</div>;

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">🔬 Smart Vision (AI Diagnosis)</div>
          <div className="page-caption page-caption-lg">Deteksi kesehatan daun secara real-time dari semua perangkat.</div>
        </div>
      </div>

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

      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ flex: 1, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', display: 'flex', justifyContent: 'center', gap: '20px', backgroundColor: 'rgba(51, 51, 51, 0.95)' }}>
            <button className="btn-primary btn-pill-primary" onClick={handleCapturePhoto} style={{ borderRadius: '50%', width: '70px', height: '70px', fontSize: '24px', flex: 'none' }}>📸</button>
            <button className="btn-pill-outline" onClick={handleCloseCamera} style={{ color: '#fff', padding: '15px 30px', flex: 'none' }}>Batal</button>
          </div>
        </div>
      )}

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

      <section className="card-grid-2 grid-2-wide u-mb-1">
        <div className="card card-elevated">
          <div className="card-header">
            <div className="card-title">Diagnosis Terakhir</div>
            <div className="card-subtitle">{latest ? new Date(latest.createdAt).toLocaleString('id-ID') : '-'}</div>
          </div>
          <div className="u-p-1 u-text-center">
            {latest ? (
              <>
                <img src={`${BASE_URL}${latest.image_url}`} className="u-img-fluid" style={{ borderRadius: '8px', maxHeight: '200px' }} />
                <div className={`ai-label u-mt-1 ${latest.hasil_diagnosis === 'Sehat' || latest.hasil_diagnosis === 'Healthy' ? 'ai-label-pill-success' : 'ai-label-pill-critical'}`}>
                  {latest.hasil_diagnosis}
                </div>
                <div className="small-text u-mt-05">ID: {latest.perangkat_id} | Akurasi: {(latest.confidence_score * 100).toFixed(1)}%</div>
              </>
            ) : <p>Belum ada riwayat.</p>}
          </div>
        </div>

        <div className="card card-elevated" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1, fontSize: '80px' }}>💡</div>
          <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="card-title" style={{ color: 'white' }}>💡 Rekomendasi</div>
            <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>{latest ? 'Saran perawatan otomatis' : 'Ambil foto untuk mendapat saran'}</div>
          </div>
          <div className="u-p-1" style={{ fontSize: '0.95rem', lineHeight: '1.7', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(10px)', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {latest ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {latest.hasil_diagnosis === 'Sehat' || latest.hasil_diagnosis === 'Healthy' ? '✅ Tanaman Sehat' : '⚠️ Perlu Perhatian'}
                </div>
                <div>{latest.saran_tindakan}</div>
              </div>
            ) : <div style={{ textAlign: 'center', opacity: 0.9 }}>📷 Gunakan fitur kamera untuk mendapatkan saran perawatan</div>}
          </div>
        </div>
      </section>

      <section className="card card-elevated">
        <div className="card-header"><div className="card-title">Riwayat Deteksi (Semua Node)</div></div>
        <div className="u-overflow-x">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px' }}>Foto</th>
                <th style={{ padding: '12px' }}>Sumber</th>
                <th style={{ padding: '12px' }}>Hasil</th>
                <th style={{ padding: '12px' }}>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '8px' }}>
                    <img src={`${BASE_URL}${item.image_url}`} style={{ width: '45px', height: '45px', borderRadius: '4px', objectFit: 'cover' }} />
                  </td>
                  <td style={{ padding: '8px', fontSize: '0.75rem', color: '#666' }}>{item.perangkat_id}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.hasil_diagnosis}</td>
                  <td style={{ padding: '8px', fontSize: '0.8rem' }}>{new Date(item.createdAt).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default SmartVisionPage;