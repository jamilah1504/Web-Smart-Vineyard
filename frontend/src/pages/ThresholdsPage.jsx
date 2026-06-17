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

  const MinMaxInput = ({ label, fieldMin, fieldMax, step = '1', icon = '📊', color = '#3498db', unit = '' }) => {
    const minVal = selectedVarietas[fieldMin] || 0
    const maxVal = selectedVarietas[fieldMax] || 0
    const range = maxVal - minVal
  return (
    <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{label}</span>
        <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '600', color, backgroundColor: `${color}15`, padding: '2px 8px', borderRadius: '20px' }}>
          Rentang: {minVal}{unit} – {maxVal}{unit}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>Min</div>
          <input
            type="number" step={step}
            value={minVal}
            onChange={(e) => setSelectedVarietas({ ...selectedVarietas, [fieldMin]: parseFloat(e.target.value) })}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '600', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>Max</div>
          <input
            type="number" step={step}
            value={maxVal}
            onChange={(e) => setSelectedVarietas({ ...selectedVarietas, [fieldMax]: parseFloat(e.target.value) })}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '600', boxSizing: 'border-box' }}
          />
        </div>
      </div>
      <div style={{ backgroundColor: '#e2e8f0', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
        <div style={{
          marginLeft: `${Math.min(90, Math.max(0, (minVal / (maxVal || 1)) * 50))}%`,
          width: `${Math.min(100, Math.max(5, (range / (maxVal || 1)) * 80))}%`,
          height: '100%', backgroundColor: color, borderRadius: '20px', transition: 'all 0.3s',
        }} />
      </div>
    </div>
  )}

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
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">⚙️ Konfigurasi Threshold</div>
          <div className="page-caption page-caption-lg">Sesuaikan ambang batas sensor untuk setiap varietas anggur</div>
        </div>
        {selectedVarietas && (
          <div style={{ backgroundColor: '#fff', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>Varietas Aktif</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#2c3e50' }}>🍇 {selectedVarietas.nama_varietas}</div>
          </div>
        )}
      </div>

      {/* Panduan */}
      <section style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '20px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#2c3e50', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea, #764ba2)', fontSize: '14px' }}>📖</span>
          Panduan Threshold Bibit Anggur
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
          {[
            { icon: '💧', label: 'Moisture', desc: `${selectedVarietas?.min_moisture ?? 40}%–${selectedVarietas?.max_moisture ?? 80}% — batas sebelum pompa aktif` },
            { icon: '🌡️', label: 'Suhu', desc: `${selectedVarietas?.min_suhu ?? 20}°C–${selectedVarietas?.max_suhu ?? 35}°C — rentang optimal pertumbuhan` },
            { icon: '🧪', label: 'Nutrisi NPK', desc: 'Pastikan nilai NPK tidak di bawah standar fase vegetatif' },
            { icon: '⚗️', label: 'pH & EC', desc: 'Jaga keasaman & salinitas agar penyerapan nutrisi optimal' },
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #764ba2' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>{item.icon} {item.label}</div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pilih Varietas */}
      <section style={{ backgroundColor: '#ffffff', padding: '24px', marginBottom: '24px', borderRadius: '15px', border: '1px solid #e0e0e0' }}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50' }}>🌾 Pilih Varietas</div>
          <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '2px' }}>Cari atau pilih varietas untuk dikonfigurasi</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#7f8c8d', display: 'block', marginBottom: '6px' }}>Cari Varietas</label>
            <input
              type="text" placeholder="Ketik nama varietas..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#7f8c8d', display: 'block', marginBottom: '6px' }}>Pilih dari Daftar</label>
            <select
              value={selectedVarietas?.id || ''}
              onChange={(e) => {
                const selected = varietasList.find(v => v.id === e.target.value)
                setSelectedVarietas(selected)
                setSearchTerm('')
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
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
            style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', boxShadow: '0 2px 6px rgba(39,174,96,0.3)' }}
          >
            ➕ Tambah Varietas
          </button>
        </div>

        {filteredList.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {filteredList.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => { setSelectedVarietas(v); setSearchTerm('') }}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  border: selectedVarietas?.id === v.id ? '2px solid #764ba2' : '1px solid #e2e8f0',
                  backgroundColor: selectedVarietas?.id === v.id ? '#764ba215' : '#fff',
                  color: selectedVarietas?.id === v.id ? '#764ba2' : '#64748b',
                }}
              >
                🍇 {v.nama_varietas}
              </button>
            ))}
          </div>
        )}
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

      {selectedVarietas && (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '24px', border: '1px solid #e0e0e0' }}>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #84fab0, #8fd3f4)', fontSize: '16px' }}>🌡️</span>
                  Fisik & Lingkungan
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px', marginLeft: '40px' }}>Moisture, Suhu & Keasaman Tanah</div>
              </div>
              <MinMaxInput label="Moisture" fieldMin="min_moisture" fieldMax="max_moisture" icon="💧" color="#3498db" unit="%" />
              <MinMaxInput label="Suhu" fieldMin="min_suhu" fieldMax="max_suhu" step="0.1" icon="🌡️" color="#e67e22" unit="°C" />
              <MinMaxInput label="pH Tanah" fieldMin="min_ph" fieldMax="max_ph" step="0.1" icon="⚗️" color="#9b59b6" unit="" />
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '24px', border: '1px solid #e0e0e0' }}>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #f6d365, #fda085)', fontSize: '16px' }}>🧪</span>
                  Kimiawi & Nutrisi
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px', marginLeft: '40px' }}>EC & NPK (Nitrogen, Fosfor, Kalium)</div>
              </div>
              <MinMaxInput label="EC" fieldMin="min_ec" fieldMax="max_ec" icon="⚡" color="#f39c12" unit=" µS/cm" />
              <MinMaxInput label="Nitrogen" fieldMin="min_n" fieldMax="max_n" icon="🟢" color="#27ae60" unit=" mg/kg" />
              <MinMaxInput label="Fosfor" fieldMin="min_p" fieldMax="max_p" icon="🔵" color="#2980b9" unit=" mg/kg" />
              <MinMaxInput label="Kalium" fieldMin="min_k" fieldMax="max_k" icon="🟣" color="#8e44ad" unit=" mg/kg" />
            </div>
          </section>

          <div style={{
            marginTop: '20px', padding: '16px 20px', borderRadius: '12px',
            backgroundColor: '#fff', border: '1px solid #e0e0e0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
          }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Mengubah threshold untuk <strong style={{ color: '#2c3e50' }}>{selectedVarietas.nama_varietas}</strong>
            </div>
            <button
              type="button"
              onClick={() => handleSave(selectedVarietas.id, selectedVarietas)}
              style={{
                backgroundColor: '#3498db', color: 'white', border: 'none',
                padding: '12px 28px', borderRadius: '10px', fontWeight: '700',
                cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(52,152,219,0.3)',
              }}
            >
              💾 Simpan Semua Threshold
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ThresholdsPage