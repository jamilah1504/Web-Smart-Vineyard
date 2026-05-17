import { useState, useEffect } from 'react'
import { getAllVarietas, updateVarietas, createVarietas } from '../services/varietasApi'
import { getAllDevices } from '../services/controlApi' 

function ThresholdsPage() {
  const [varietasList, setVarietasList] = useState([])
  const [perangkatList, setPerangkatList] = useState([]) 
  const [selectedVarietas, setSelectedVarietas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newVarietasName, setNewVarietasName] = useState('')
  const [newPerangkatId, setNewPerangkatId] = useState('') 
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredList, setFilteredList] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resVarietas = await getAllVarietas()
        if (resVarietas.status === 'success') {
          setVarietasList(resVarietas.data)
          setFilteredList(resVarietas.data)
          if (resVarietas.data.length > 0) setSelectedVarietas(resVarietas.data[0])
        }

        const resPerangkat = await getAllDevices()
        if (resPerangkat && resPerangkat.data) {
          setPerangkatList(resPerangkat.data)
        }
      } catch (error) {
        console.error("Gagal meload data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = varietasList.filter(v =>
      v.nama_varietas.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredList(filtered)
  }, [searchTerm, varietasList])

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
    
    if (varietasList.some(v => v.nama_varietas.toLowerCase() === newVarietasName.toLowerCase())) {
      alert('Varietas sudah ada!')
      return
    }
    
    try {
      // 🌟 DEFAULTS DIPERBARUI: Menambahkan default untuk semua parameter min & max
      const newVarietasData = {
        nama_varietas: newVarietasName,
        min_moisture: 40, max_moisture: 80,
        min_suhu: 20, max_suhu: 35,
        min_ph: 5.5, max_ph: 7.0,
        min_ec: 100, max_ec: 1000,
        min_n: 10, max_n: 100,
        min_p: 10, max_p: 100,
        min_k: 10, max_k: 100,
        perangkat_id: newPerangkatId 
      }
      
      const response = await createVarietas(newVarietasData)
      
      if (response.status === 'success') {
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
      setNewPerangkatId('') 
      setShowAddModal(false)
    }
  }

  // --- KOMPONEN INPUT BANTUAN UNTUK MIN/MAX ---
  // Membuat komponen kecil agar kode tidak terlalu panjang di bawah
  const MinMaxInput = ({ label, fieldMin, fieldMax, step = "1" }) => (
    <div className="form-grid-2 u-mt-05" style={{ gap: '10px', marginBottom: '15px' }}>
      <div>
        <div className="small-text text-sm-muted">Min {label}</div>
        <input
          type="number" step={step} className="form-control"
          value={selectedVarietas[fieldMin] || 0}
          onChange={(e) => setSelectedVarietas({...selectedVarietas, [fieldMin]: parseFloat(e.target.value)})}
        />
      </div>
      <div>
        <div className="small-text text-sm-muted">Max {label}</div>
        <input
          type="number" step={step} className="form-control"
          value={selectedVarietas[fieldMax] || 0}
          onChange={(e) => setSelectedVarietas({...selectedVarietas, [fieldMax]: parseFloat(e.target.value)})}
        />
      </div>
    </div>
  )

  if (loading) return (
    <div className="page page-with-padding" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#95a5a6' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
        <div>Memuat konfigurasi sistem...</div>
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
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      `}</style>

      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">⚙️ Atur Threshold Varietas</div>
          <div className="page-caption page-caption-lg">Sesuaikan ambang batas sensor untuk setiap varietas anggur</div>
        </div>
      </div>

      {/* Info & Guidelines */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Panduan Threshold Bibit Anggur Pilihan</div>
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
      {/* Bagian Selector Varietas & Modal (Sama seperti kode aslimu) */}
      <section className="card-responsive" style={{ backgroundColor: '#ffffff', padding: '24px', marginBottom: '30px', border: '1px solid #ecf0f1' }}>
        {/* ... Kode Selector ... */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>🌾 Pilih Varietas</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>Cari Varietas</label>
            <input
              type="text" className="form-control" placeholder="Ketik nama varietas..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ecf0f1' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>Atau Pilih</label>
            <select 
              className="form-control" value={selectedVarietas?.id || ''}
              onChange={(e) => {
                const selected = varietasList.find(v => v.id === e.target.value)
                setSelectedVarietas(selected)
                setSearchTerm('')
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ecf0f1' }}
            >
              <option value="">-- Pilih Varietas --</option>
              {filteredList.map(v => (
                <option key={v.id} value={v.id}>{v.nama_varietas}</option>
              ))}
            </select>
          </div>

          <button 
            type="button" 
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
          >
            ➕ Tambah Varietas
          </button>
        </div>
      </section>

      {/* Modal Tambah */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '15px', padding: '28px', maxWidth: '420px', width: '90%' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2c3e50' }}>🌱 Tambah Varietas Baru</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>Nama Varietas</label>
              <input
                type="text" value={newVarietasName} onChange={(e) => setNewVarietasName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ecf0f1', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '8px' }}>Tugaskan ke Perangkat</label>
              <select
                value={newPerangkatId} onChange={(e) => setNewPerangkatId(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ecf0f1', boxSizing: 'border-box' }}
              >
                <option value="">-- Opsional --</option>
                {perangkatList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_node || p.id}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleAddVarietas} style={{ flex: 1, backgroundColor: '#27ae60', color: 'white', padding: '11px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>✓ Simpan</button>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, backgroundColor: '#ecf0f1', color: '#2c3e50', padding: '11px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>✕ Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 THRESHOLD SETTINGS CARDS */}
      {selectedVarietas && (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            
            {/* Card 1: Fisik Lingkungan */}
            <div className="card card-animate card-elevated">
              <div className="card-header card-header-top">
                <div>
                  <div className="card-title card-title-lg">Fisik & Lingkungan</div>
                  <div className="card-subtitle card-subtitle-lg">Moisture, Suhu & Keasaman Tanah</div>
                </div>
              </div>
              <div className="simple-card-list u-mt-05">
                <MinMaxInput label="Moisture (%)" fieldMin="min_moisture" fieldMax="max_moisture" />
                <MinMaxInput label="Suhu (°C)" fieldMin="min_suhu" fieldMax="max_suhu" step="0.1" />
                <MinMaxInput label="pH Tanah" fieldMin="min_ph" fieldMax="max_ph" step="0.1" />
              </div>
            </div>

            {/* Card 2: Nutrisi & Elektrolit */}
            <div className="card card-animate card-elevated">
              <div className="card-header card-header-top">
                <div>
                  <div className="card-title card-title-lg">Kondisi Kimiawi & Nutrisi</div>
                  <div className="card-subtitle card-subtitle-lg">EC & NPK (Nitrogen, Fosfor, Kalium)</div>
                </div>
              </div>
              <div className="simple-card-list u-mt-05">
                <MinMaxInput label="EC (µS/cm)" fieldMin="min_ec" fieldMax="max_ec" />
                <MinMaxInput label="Nitrogen (mg/kg)" fieldMin="min_n" fieldMax="max_n" />
                <MinMaxInput label="Fosfor (mg/kg)" fieldMin="min_p" fieldMax="max_p" />
                <MinMaxInput label="Kalium (mg/kg)" fieldMin="min_k" fieldMax="max_k" />
              </div>
            </div>
          </section>

          {/* Tombol Simpan Global */}
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
             <button 
                type="button" 
                onClick={() => handleSave(selectedVarietas.id, selectedVarietas)}
                style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 6px rgba(52, 152, 219, 0.3)' }}
              >
                💾 Simpan Semua Threshold "{selectedVarietas.nama_varietas}"
              </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ThresholdsPage