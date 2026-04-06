import { useState, useEffect } from 'react'
import { getAllVarietas, updateVarietas, createVarietas } from '../services/varietasApi'

function ThresholdsPage() {
  const [varietasList, setVarietasList] = useState([])
  const [selectedVarietas, setSelectedVarietas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newVarietasName, setNewVarietasName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredList, setFilteredList] = useState([])

  // Load data varietas dari database saat halaman dibuka
  useEffect(() => {
    const fetchVarietas = async () => {
      try {
        const response = await getAllVarietas()
        if (response.status === 'success') {
          setVarietasList(response.data)
          setFilteredList(response.data)
          // Set varietas pertama sebagai default jika ada
          if (response.data.length > 0) setSelectedVarietas(response.data[0])
        }
      } catch (error) {
        console.error("Gagal load varietas:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchVarietas()
  }, [])

  // Filter varietas berdasarkan search term
  useEffect(() => {
    const filtered = varietasList.filter(v =>
      v.nama_varietas.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredList(filtered)
  }, [searchTerm, varietasList])

  // Fungsi untuk update nilai ke database
  const handleSave = async (id, updatedData) => {
    try {
      const response = await updateVarietas(id, updatedData)
      if (response.status === 'success') {
        alert(`Threshold ${updatedData.nama_varietas} berhasil diperbarui!`)
      }
    } catch (error) {
      alert("Gagal menyimpan: " + error.message)
    }
  }

  const handleAddVarietas = async () => {
    if (!newVarietasName.trim()) {
      alert('Nama varietas tidak boleh kosong!')
      return
    }
    
    // Cek apakah varietas sudah ada
    if (varietasList.some(v => v.nama_varietas.toLowerCase() === newVarietasName.toLowerCase())) {
      alert('Varietas sudah ada!')
      return
    }
    
    try {
      const newVarietasData = {
        nama_varietas: newVarietasName,
        min_n: 10,
        min_p: 10,
        min_k: 10,
        min_ph: 5.5,
        max_ph: 7.0,
        min_moisture: 40
      }
      
      const response = await createVarietas(newVarietasData)
      
      if (response.status === 'success') {
        // Tambahkan varietas baru ke state
        setVarietasList([...varietasList, response.data])
        setSelectedVarietas(response.data)
        alert(`Varietas "${newVarietasName}" berhasil ditambahkan!`)
      } else {
        alert(`Gagal menambahkan varietas: ${response.message || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error("Error adding varietas:", error)
      alert("Gagal menambahkan varietas: " + error.message)
    } finally {
      setNewVarietasName('')
      setShowAddModal(false)
    }
  }

  if (loading) return (
    <div className="page page-with-padding" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      color: '#95a5a6'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
        <div>Memuat konfigurasi varietas...</div>
      </div>
    </div>
  )

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
          <div className="page-title page-title-lg" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>⚙️ Atur Threshold Varietas</div>
          <div className="page-caption page-caption-lg" style={{ fontSize: '1.1rem', color: '#7f8c8d' }}>Sesuaikan ambang batas sensor untuk setiap varietas anggur</div>
        </div>
      </div>

      {/* Selector Varietas */}
      <section className="card-responsive" style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        marginBottom: '30px',
        border: '1px solid #ecf0f1'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>🌾 Pilih Varietas</div>
          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Kelola ambang batas untuk setiap jenis</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          alignItems: 'flex-end'
        }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>Cari Varietas</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ketik nama varietas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>Atau Pilih</label>
            <select 
              className="form-control"
              value={selectedVarietas?.id || ''}
              onChange={(e) => {
                const selected = varietasList.find(v => v.id === e.target.value)
                setSelectedVarietas(selected)
                setSearchTerm('')
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #ecf0f1',
                fontSize: '14px'
              }}
            >
              <option value="">-- Pilih Varietas --</option>
              {filteredList.map(v => (
                <option key={v.id} value={v.id}>{v.nama_varietas}</option>
              ))}
            </select>
          </div>

          <button 
            type="button" 
            className="btn-primary btn-pill-primary"
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
          >
            ➕ Tambah Varietas
          </button>
        </div>

        {searchTerm && filteredList.length === 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107',
            fontSize: '13px',
            color: '#856404'
          }}>
            📭 Tidak ada varietas yang cocok. Klik "➕ Tambah Varietas" untuk membuat baru.
          </div>
        )}
      </section>

      {/* Modal Tambah Varietas */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '15px',
            padding: '28px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2c3e50', marginBottom: '4px' }}>🌱 Tambah Varietas Baru</div>
              <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Masukkan nama varietas anggur baru</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>Nama Varietas</label>
              <input
                type="text"
                placeholder="Contoh: Probolinggo Black"
                value={newVarietasName}
                onChange={(e) => setNewVarietasName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddVarietas()
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ecf0f1',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleAddVarietas}
                style={{
                  flex: 1,
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
              >
                ✓ Tambah
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setNewVarietasName('')
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#bdc3c7'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ecf0f1'}
              >
                ✕ Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threshold Settings */}
      {selectedVarietas && (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Card Moisture & pH */}
          <div className="card card-animate card-elevated">
            <div className="card-header card-header-top">
              <div>
                <div className="card-title card-title-lg">Fisik Tanah</div>
                <div className="card-subtitle card-subtitle-lg">Moisture & Keasaman</div>
              </div>
            </div>
            <div className="simple-card-list u-mt-05">
              <div>
                <div className="small-text text-sm-muted">Min Moisture (%) - Trigger Pompa</div>
                <input
                  type="number"
                  className="form-control u-mt-05"
                  value={selectedVarietas.min_moisture}
                  onChange={(e) => setSelectedVarietas({...selectedVarietas, min_moisture: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-grid-2 u-mt-05">
                <div>
                  <div className="small-text text-sm-muted">Min pH</div>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={selectedVarietas.min_ph}
                    onChange={(e) => setSelectedVarietas({...selectedVarietas, min_ph: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <div className="small-text text-sm-muted">Max pH</div>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={selectedVarietas.max_ph}
                    onChange={(e) => setSelectedVarietas({...selectedVarietas, max_ph: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card Nutrisi (NPK) */}
          <div className="card card-animate card-elevated">
            <div className="card-header card-header-top">
              <div>
                <div className="card-title card-title-lg">Nutrisi Makro (Min)</div>
                <div className="card-subtitle card-subtitle-lg">Ambang batas peringatan pemupukan</div>
              </div>
            </div>
            <div className="simple-card-list u-mt-05 form-grid-3">
              <div>
                <div className="small-text text-sm-muted">Min N</div>
                <input
                  type="number"
                  className="form-control"
                  value={selectedVarietas.min_n}
                  onChange={(e) => setSelectedVarietas({...selectedVarietas, min_n: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <div className="small-text text-sm-muted">Min P</div>
                <input
                  type="number"
                  className="form-control"
                  value={selectedVarietas.min_p}
                  onChange={(e) => setSelectedVarietas({...selectedVarietas, min_p: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <div className="small-text text-sm-muted">Min K</div>
                <input
                  type="number"
                  className="form-control"
                  value={selectedVarietas.min_k}
                  onChange={(e) => setSelectedVarietas({...selectedVarietas, min_k: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <button 
              type="button" 
              className="btn-primary btn-pill-primary u-mt-1"
              onClick={() => handleSave(selectedVarietas.id, selectedVarietas)}
            >
              Simpan Threshold {selectedVarietas.nama_varietas}
            </button>
          </div>
        </section>
      )}

      {/* Info & Guidelines */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Panduan Threshold Anggur</div>
            <div className="card-subtitle card-subtitle-lg">Rekomendasi nilai ideal</div>
          </div>
        </div>
        <div className="simple-list u-mt-05">
          <div className="small-text" style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
            <strong>Moisture:</strong> {selectedVarietas?.min_moisture}% – Batas bawah sebelum pompa aktif.
          </div>
          <div className="small-text" style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
            <strong>Nutrisi:</strong> Pastikan nilai NPK tidak di bawah standar agar fase vegetatif tidak terganggu.
          </div>
        </div>
      </section>
    </div>
  )
}

export default ThresholdsPage
