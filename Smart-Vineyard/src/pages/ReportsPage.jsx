import { useState } from 'react';
import * as reportApi from '../services/reportApi';

function ReportsPage() {
  // State untuk menyimpan pilihan user
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    type: 'Data sensor harian' // Default sesuai <select>
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async (format) => {
    if (!filter.startDate || !filter.endDate) {
      alert("Harap pilih rentang tanggal terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      await reportApi.downloadReport(filter, format);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-responsive {
          animation: slideIn 0.5s ease-out;
          transition: all 0.3s ease;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .card-responsive:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      <div className="page-header u-mb-2" style={{ marginBottom: '30px' }}>
        <div>
          <div className="page-title page-title-lg" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>📊 Laporan & Export</div>
          <div className="page-caption page-caption-lg" style={{ fontSize: '1.1rem', color: '#7f8c8d' }}>Generate dan download laporan data sensor, aktivitas, dan analisis trend</div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card-responsive" style={{
        backgroundColor: '#ffffff',
        padding: '28px',
        marginBottom: '30px',
        border: '1px solid #ecf0f1'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>📝 Generate Laporan Baru</div>
          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Pilih rentang tanggal & format laporan yang diinginkan</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>📅 Mulai Dari</label>
            <input 
              type="date" 
              name="startDate"
              className="form-control"
              value={filter.startDate}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #ecf0f1',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>📅 Sampai</label>
            <input 
              type="date" 
              name="endDate"
              className="form-control"
              value={filter.endDate}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #ecf0f1',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>📋 Jenis Laporan</label>
            <select 
              name="type"
              className="form-control"
              value={filter.type}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #ecf0f1',
                fontSize: '14px'
              }}
            >
              <option value="Data sensor harian">📊 Data sensor harian</option>
              <option value="Aktivitas pompa">💧 Aktivitas pompa</option>
              <option value="Analisis tren">📈 Analisis tren</option>
            </select>
          </div>
        </div>

        {!filter.startDate || !filter.endDate ? (
          <div style={{
            padding: '16px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107',
            color: '#856404',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>Silakan pilih tanggal mulai dan tanggal akhir untuk generate laporan</span>
          </div>
        ) : null}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          <button
            type="button"
            className="btn-primary btn-pill-primary"
            disabled={loading || !filter.startDate || !filter.endDate}
            onClick={() => handleExport('excel')}
            style={{
              backgroundColor: loading ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              if (!loading && filter.startDate && filter.endDate) {
                e.target.style.backgroundColor = '#229954'
              }
            }}
            onMouseOut={(e) => {
              if (!loading && filter.startDate && filter.endDate) {
                e.target.style.backgroundColor = '#27ae60'
              }
            }}
          >
            <span>📥</span>
            <span>{loading ? 'Exporting...' : 'Export Excel'}</span>
          </button>

          <button
            type="button"
            className="btn-pill-outline"
            disabled={loading || !filter.startDate || !filter.endDate}
            onClick={() => {
              if (filter.startDate && filter.endDate) {
                handleExport('pdf');
              } else {
                alert('Pilih tanggal terlebih dahulu!');
              }
            }}
            style={{
              backgroundColor: 'white',
              color: filter.startDate && filter.endDate ? '#e74c3c' : '#95a5a6',
              border: `1px solid ${filter.startDate && filter.endDate ? '#e74c3c' : '#bdc3c7'}`,
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: (loading || !filter.startDate || !filter.endDate) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <span>📄</span>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
          color: 'white',
          padding: '24px',
          boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Laporan Data Sensor</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Mencakup soil moisture, pH, dan NPK harian</div>
        </div>

        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          color: 'white',
          padding: '24px',
          boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>💧</div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Laporan Aktivitas Pompa</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Durasi dan frekuensi penyiraman per hari</div>
        </div>

        <div className="card-responsive" style={{
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          color: 'white',
          padding: '24px',
          boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Laporan Analisis Trend</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Prediksi dan pola parameter sensor</div>
        </div>
      </section>
    </div>
  );
}

export default ReportsPage;