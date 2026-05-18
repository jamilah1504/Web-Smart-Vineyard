import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { getDiagnosisHistory } from '../services/diagnosisApi';

function SmartVisionPage() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  // State untuk modal detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [expandedHistoryTable, setExpandedHistoryTable] = useState(false);
  
  // Fitur Filter dari Kode 2
  const DEVICES = ["SEMUA", "ESP32-MAC-A001", "ESPCAM-001"]; 
  const [filterDevice, setFilterDevice] = useState("SEMUA");
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const DEVICE_ID_DEFAULT = "ESP32-MAC-A001"; // ID untuk upload manual
  const BASE_URL = "https://d34f3d5l-5000.asse.devtunnels.ms";

  // --- 1. LOGIKA PENGAMBILAN DATA (GABUNGAN) ---
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const historyPromises = DEVICES.filter(id => id !== "SEMUA").map(id => getDiagnosisHistory(id));
      const results = await Promise.all(historyPromises);
      
      let allHistory = [];
      results.forEach(res => {
        if (res.status === 'success' && res.data) {
          allHistory = [...allHistory, ...res.data];
        }
      });

      allHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(allHistory);
      if (allHistory.length > 0) setLatest(allHistory[0]);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Logika Filter UI
  const filteredHistory = useMemo(() => {
    if (filterDevice === "SEMUA") return history;
    return history.filter(item => item.perangkat_id === filterDevice);
  }, [history, filterDevice]);

  // --- 2. LOGIKA KAMERA & GALERI (DARI KODE 1) ---
  const handleOpenCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setShowCamera(false);
      alert('❌ Kamera Error: ' + error.message);
    }
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoPreview(base64);
    handleCloseCamera();
  };

  const handleCloseCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // --- 3. LOGIKA UPLOAD (DARI KODE 1) ---
  const handleAnalyzePhoto = async () => {
    if (!photoPreview) return;
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/diagnosis/detect`, {
        perangkat_id: DEVICE_ID_DEFAULT,
        image_base64: photoPreview 
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.status === 'success' || response.data.status === 'invalid') {
        alert(response.data.message || `Hasil: ${response.data.diagnosis}`);
        fetchInitialData();
        setPhotoPreview(null);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Modal detail handler
  const openDetailModal = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAnalysis(null);
  };

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">🔬 Smart Vision (AI)</div>
          <div className="page-caption">Analisis kesehatan daun otomatis.</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <button className="btn-primary" onClick={handleOpenCamera} style={{ padding: '15px', borderRadius: '12px' }}>📷 Kamera</button>
        <button className="btn-pill-outline" onClick={() => fileInputRef.current.click()} style={{ padding: '15px', borderRadius: '12px', backgroundColor: '#fff' }}>📁 Galeri</button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
      </div>

      {/* Overlay Kamera */}
      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
          <video ref={videoRef} autoPlay playsInline style={{ flex: 1, objectFit: 'cover' }} />
          <div style={{ padding: '30px', display: 'flex', justifyContent: 'center', gap: '20px', background: '#222' }}>
            <button className="btn-primary" onClick={handleCapturePhoto} style={{ width: '70px', height: '70px', borderRadius: '50%' }}>📸</button>
            <button className="btn-pill-outline" onClick={handleCloseCamera} style={{ color: '#fff' }}>Batal</button>
          </div>
        </div>
      )}

      {/* Preview Sebelum Analisis */}
      {photoPreview && (
        <div className="card card-elevated u-mb-1 u-p-1 u-text-center">
          <img src={photoPreview} style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '300px' }} />
          <div className="u-mt-1">
            <button className="btn-primary" onClick={handleAnalyzePhoto} disabled={isAnalyzing}>
              {isAnalyzing ? 'Proses AI...' : 'Mulai Analisis'}
            </button>
            <button className="btn-pill-outline u-ml-1" onClick={() => setPhotoPreview(null)}>Hapus</button>
          </div>
        </div>
      )}

      {/* Unified Card (Gaya Kode 2) */}
      <section className="u-mb-1">
        <div className="card card-elevated" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
            <div className="card-title">Diagnosis & Rekomendasi</div>
            <div className="card-subtitle">{latest ? new Date(latest.createdAt).toLocaleString('id-ID') : 'Belum ada data'}</div>
          </div>
          
          {latest ? (
            <div style={{ padding: '20px' }}>
              <img src={`${BASE_URL}${latest.image_url}`} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }} />
              
              <div style={{ 
                backgroundColor: (latest.hasil_diagnosis === 'Healthy' || latest.hasil_diagnosis === 'Sehat') ? '#e8f5e9' : '#fff3e0',
                padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '15px'
              }}>
                <div style={{ fontWeight: '800', color: (latest.hasil_diagnosis === 'Healthy' || latest.hasil_diagnosis === 'Sehat') ? '#2e7d32' : '#d32f2f' }}>
                  {latest.hasil_diagnosis.toUpperCase()} ({(latest.confidence_score * 100).toFixed(1)}%)
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '15px', borderRadius: '12px', color: '#fff' }}>
                <strong>Saran:</strong> {latest.saran_tindakan}
              </div>
            </div>
          ) : <p className="u-p-1 u-text-center">Silakan ambil foto untuk diagnosa.</p>}
        </div>
      </section>

      {/* Riwayat & Filter */}
      <section className="card card-elevated">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div className="card-title">Riwayat Log {filteredHistory.length > 0 && `(${filteredHistory.length} data)`}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {filteredHistory.length > 10 && (
              <button
                onClick={() => setExpandedHistoryTable(!expandedHistoryTable)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: expandedHistoryTable ? '#e74c3c' : '#27ae60',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                {expandedHistoryTable ? '🔽 Tutup' : '🔼 Lihat Semua'}
              </button>
            )}
            <select value={filterDevice} onChange={(e) => setFilterDevice(e.target.value)} style={{ padding: '5px', borderRadius: '8px' }}>
              {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="u-overflow-x">
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '10px' }}>Foto</th>
                <th style={{ padding: '10px' }}>Hasil</th>
                <th style={{ padding: '10px'}}>Akurasi</th>
                <th style={{ padding: '10px' }}>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {(expandedHistoryTable ? filteredHistory : filteredHistory.slice(0, 10)).map(item => (
                <tr 
                  key={item.id} 
                  style={{ 
                    borderBottom: '1px solid #f9f9f9',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => openDetailModal(item)}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <td style={{ padding: '10px' }}><img src={`${BASE_URL}${item.image_url}`} style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover', cursor: 'pointer' }} /></td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.hasil_diagnosis}</td>
                  <td style={{ padding: '10px' }}>{(item.confidence_score * 100).toFixed(1)}%</td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* MODAL DETAIL ANALYSIS */}
      {showDetailModal && selectedAnalysis && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #eee',
              position: 'sticky',
              top: 0,
              backgroundColor: '#f9f9f9'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                📊 Detail Analisis {selectedAnalysis.hasil_diagnosis}
              </h2>
              <button
                onClick={closeDetailModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {/* Foto */}
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src={`${BASE_URL}${selectedAnalysis.image_url}`} 
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    objectFit: 'cover'
                  }}
                  alt="Analysis"
                />
              </div>

              {/* Info Box */}
              <div style={{
                backgroundColor: selectedAnalysis.hasil_diagnosis === 'Healthy' || selectedAnalysis.hasil_diagnosis === 'Sehat' ? '#e8f5e9' : '#fff3e0',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: `2px solid ${selectedAnalysis.hasil_diagnosis === 'Healthy' || selectedAnalysis.hasil_diagnosis === 'Sehat' ? '#2e7d32' : '#f57c00'}`
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: selectedAnalysis.hasil_diagnosis === 'Healthy' || selectedAnalysis.hasil_diagnosis === 'Sehat' ? '#2e7d32' : '#d32f2f',
                  marginBottom: '8px'
                }}>
                  {selectedAnalysis.hasil_diagnosis.toUpperCase()}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  Akurasi: {(selectedAnalysis.confidence_score * 100).toFixed(1)}%
                </div>
              </div>

              {/* Metadata */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Perangkat</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedAnalysis.perangkat_id}</div>
                </div>
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Waktu Analisis</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {new Date(selectedAnalysis.createdAt).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Rekomendasi */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                  💡 REKOMENDASI TINDAKAN:
                </div>
                <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
                  {selectedAnalysis.saran_tindakan}
                </div>
              </div>

              {/* Detail Confidence */}
              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>📈 Detail Akurasi:</div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#ddd',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${selectedAnalysis.confidence_score * 100}%`,
                    backgroundColor: selectedAnalysis.confidence_score > 0.8 ? '#4caf50' : selectedAnalysis.confidence_score > 0.6 ? '#ff9800' : '#f44336',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  {(selectedAnalysis.confidence_score * 100).toFixed(1)}% kepercayaan
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeDetailModal}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartVisionPage;