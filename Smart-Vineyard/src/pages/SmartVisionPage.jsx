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
      console.log('🎬 Mencoba membuka kamera...');
      setShowCamera(true); // Show modal immediately so video element mounts
      
      // Wait a tick for video element to mount
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try with environment camera first, fallback to any camera
      let stream;
      try {
        console.log('📷 Trying environment camera...');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        console.log('✅ Environment camera berhasil!');
      } catch (err) {
        console.warn('⚠️ Environment camera gagal:', err.name, err.message);
        console.log('📷 Trying any available camera...');
        // Fallback: try any available camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        console.log('✅ Default camera berhasil!');
      }
      
      console.log('📊 Stream info:', {
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('🎥 Setting srcObject to video element...');
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video play timeout'));
          }, 5000);
          
          videoRef.current.oncanplay = () => {
            clearTimeout(timeout);
            console.log('✅ Video ready to play');
            resolve();
          };
        });
        
        // Ensure video plays
        try {
          await videoRef.current.play();
          console.log('▶️ Video playback started');
        } catch (err) {
          console.error('❌ Error playing video:', err);
          throw err;
        }
      }
    } catch (error) {
      console.error('❌ Error detail:', error);
      setShowCamera(false);
      let errorMsg = error.message;
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Silakan izinkan akses kamera di pengaturan browser';
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'Kamera tidak ditemukan pada perangkat ini';
      } else if (error.name === 'NotReadableError') {
        errorMsg = 'Kamera sedang digunakan oleh aplikasi lain';
      } else if (error.message.includes('timeout')) {
        errorMsg = 'Kamera memerlukan waktu terlalu lama untuk terhubung';
      }
      
      alert('❌ Gagal akses kamera: ' + errorMsg);
    }
  };

  const handleCapturePhoto = () => {
    try {
      console.log('📸 Attempting to capture photo...');
      
      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Video atau canvas tidak tersedia');
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Video belum siap. Tunggu sebentar dan coba lagi.');
      }
      
      console.log('📊 Video dimensions:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Gagal mendapatkan canvas context');
      }
      
      // Set canvas size sesuai video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log('📐 Canvas set to:', canvas.width, 'x', canvas.height);
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0);
      
      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      console.log('📷 Photo captured, size:', base64.length, 'bytes');
      
      setPhotoPreview(base64);
      
      // Convert base64 to File object untuk selectedPhoto
      fetch(base64)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setSelectedPhoto(file);
          console.log('✅ File object created:', file.name, file.size, 'bytes');
        })
        .catch(err => {
          console.error('❌ Error converting base64 to file:', err);
        });

      handleCloseCamera();
    } catch (error) {
      console.error('❌ Error capturing photo:', error.message);
      alert('❌ Gagal mengambil foto: ' + error.message);
    }
  };

  const handleCloseCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log('Stopping track:', track.label);
          track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setShowCamera(false);
    } catch (error) {
      console.error('Error closing camera:', error);
      setShowCamera(false);
    }
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <video 
            ref={videoRef} 
            autoPlay={true}
            playsInline={true}
            muted={true}
            style={{ 
              flex: 1, 
              width: '100%', 
              height: '100%',
              objectFit: 'cover',
              backgroundColor: '#000',
              display: 'block'
            }}
            onLoadedMetadata={() => {
              console.log('📊 ✓ Video metadata loaded:', {
                width: videoRef.current?.videoWidth,
                height: videoRef.current?.videoHeight,
                readyState: videoRef.current?.readyState
              });
            }}
            onCanPlay={() => {
              console.log('▶️ ✓ Video can play now');
            }}
            onPlaying={() => {
              console.log('▶️ ✓ Video is playing');
            }}
            onError={(e) => {
              console.error('❌ Video error:', e.target?.error?.code, e.target?.error?.message);
              alert('❌ Error dengan video stream');
            }}
          />
          <div style={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            backgroundColor: 'rgba(51, 51, 51, 0.95)' 
          }}>
            <button 
              className="btn-primary btn-pill-primary" 
              onClick={handleCapturePhoto} 
              style={{ borderRadius: '50%', width: '70px', height: '70px', fontSize: '24px', flex: 'none' }}
              title="Ambil foto"
            >
              📸
            </button>
            <button 
              className="btn-pill-outline" 
              onClick={handleCloseCamera} 
              style={{ color: '#fff', padding: '15px 30px', flex: 'none' }}
              title="Tutup kamera"
            >
              Batal
            </button>
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