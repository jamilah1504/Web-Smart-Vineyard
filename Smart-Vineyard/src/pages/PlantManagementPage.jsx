import { useState, useEffect } from 'react'

function PlantManagementPage() {
  const [varietasList, setVarietasList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    nama_varietas: '',
    min_n: 10,
    min_p: 10,
    min_k: 10,
    min_ph: 5.5,
    min_moisture: 40,
    max_ph: 7.0
  })

  // Fetch varietas on mount
  useEffect(() => {
    fetchVarietas()
  }, [])

  const fetchVarietas = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/varietas', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const result = await response.json()
      if (result.status === 'success') {
        setVarietasList(result.data)
      }
    } catch (error) {
      console.error('Error fetching varietas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({
      nama_varietas: '',
      min_n: 10,
      min_p: 10,
      min_k: 10,
      min_ph: 5.5,
      min_moisture: 40,
      max_ph: 7.0
    })
    setShowForm(true)
  }

  const handleEditClick = (v) => {
    setEditingId(v.id)
    setFormData(v)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validasi form
      if (!formData.nama_varietas || formData.nama_varietas.trim() === '') {
        alert('Nama varietas tidak boleh kosong!')
        return
      }

      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `http://localhost:5000/api/varietas/${editingId}`
        : 'http://localhost:5000/api/varietas'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        alert(editingId ? 'Varietas berhasil diperbarui!' : 'Varietas berhasil ditambahkan!')
        await fetchVarietas()
        setShowForm(false)
      } else {
        alert(`Error: ${result.message || 'Gagal menyimpan varietas'}`)
      }
    } catch (error) {
      console.error('Error submitting varietas:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus varietas ini?')) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/varietas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      
      const result = await response.json()
      if (result.status === 'success') {
        await fetchVarietas()
      }
    } catch (error) {
      console.error('Error deleting varietas:', error)
    }
  }

  return (
    <div className="page page-with-padding page-shell">
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Manajemen Tanaman</div>
          <div className="page-caption page-caption-lg">
            Atur varietas anggur dan parameter target untuk kontrol otomatis.
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="u-mb-1">
        <button 
          onClick={handleAddClick}
          className="btn-primary btn-pill-primary"
          style={{ backgroundColor: '#27ae60', borderColor: '#27ae60' }}
        >
          ➕ Tambah Varietas
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <section className="card card-animate card-elevated u-mb-15">
          <div className="card-header card-header-top-md">
            <div>
              <div className="card-title card-title-lg">
                {editingId ? 'Edit Varietas' : 'Tambah Varietas Baru'}
              </div>
              <div className="card-subtitle card-subtitle-lg">
                Isikan data lengkap untuk varietas anggur
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="simple-card-list form-grid-2 u-mt-05">
            <div>
              <label className="small-text text-sm-muted">Nama Varietas *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Jupiter, Alpha..."
                value={formData.nama_varietas}
                onChange={(e) => setFormData({...formData, nama_varietas: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">Min Nitrogen (mg/kg)</label>
              <input
                type="number"
                className="form-control"
                value={formData.min_n}
                onChange={(e) => setFormData({...formData, min_n: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">Min Fosfor (mg/kg)</label>
              <input
                type="number"
                className="form-control"
                value={formData.min_p}
                onChange={(e) => setFormData({...formData, min_p: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">Min Kalium (mg/kg)</label>
              <input
                type="number"
                className="form-control"
                value={formData.min_k}
                onChange={(e) => setFormData({...formData, min_k: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">pH Minimum</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={formData.min_ph}
                onChange={(e) => setFormData({...formData, min_ph: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">pH Maksimum</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={formData.max_ph}
                onChange={(e) => setFormData({...formData, max_ph: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">Min Soil Moisture (%)</label>
              <input
                type="number"
                className="form-control"
                value={formData.min_moisture}
                onChange={(e) => setFormData({...formData, min_moisture: parseFloat(e.target.value)})}
              />
            </div>

            <div></div>

            <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
              <button 
                type="submit" 
                className="btn-primary btn-pill-primary"
                style={{ backgroundColor: '#27ae60', borderColor: '#27ae60', flex: 1 }}
              >
                {editingId ? '💾 Simpan Perubahan' : '➕ Buat Varietas'}
              </button>
              <button 
                type="button" 
                className="btn-pill-outline"
                style={{ flex: 1 }}
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Varietas List */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top-md">
          <div>
            <div className="card-title card-title-lg">Daftar Varietas ({varietasList.length})</div>
            <div className="card-subtitle card-subtitle-lg">
              Semua varietas anggur yang terdaftar
            </div>
          </div>
        </div>

        {loading ? (
          <div className="u-mt-1" style={{ textAlign: 'center', padding: '20px', color: '#95a5a6' }}>
            Memuat data...
          </div>
        ) : varietasList.length === 0 ? (
          <div className="u-mt-1" style={{ textAlign: 'center', padding: '20px', color: '#95a5a6' }}>
            Belum ada varietas. Tambahkan varietas pertama Anda sekarang.
          </div>
        ) : (
          <div className="table-wrapper u-mt-05">
            <table className="table table-compact">
              <thead>
                <tr style={{ borderBottom: '3px solid #27ae60' }}>
                  <th style={{ color: '#27ae60' }}>Nama Varietas</th>
                  <th style={{ color: '#27ae60' }}>Min N</th>
                  <th style={{ color: '#27ae60' }}>Min P</th>
                  <th style={{ color: '#27ae60' }}>Min K</th>
                  <th style={{ color: '#27ae60' }}>pH Range</th>
                  <th style={{ color: '#27ae60' }}>Min Moisture</th>
                  <th style={{ color: '#27ae60' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {varietasList.map((varietas) => (
                  <tr key={varietas.id}>
                    <td><strong>{varietas.nama_varietas}</strong></td>
                    <td>{varietas.min_n} mg/kg</td>
                    <td>{varietas.min_p} mg/kg</td>
                    <td>{varietas.min_k} mg/kg</td>
                    <td>{varietas.min_ph} - {varietas.max_ph}</td>
                    <td>{varietas.min_moisture}%</td>
                    <td>
                      <button
                        className="btn-pill-outline"
                        style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: '4px' }}
                        onClick={() => handleEditClick(varietas)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-pill-outline"
                        style={{ padding: '4px 8px', fontSize: '0.85rem', color: '#e74c3c', borderColor: '#e74c3c' }}
                        onClick={() => handleDelete(varietas.id)}
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="small-text text-sm-muted u-mt-05" style={{ textAlign: 'center', padding: '12px', color: '#95a5a6' }}>
              Daftar varietas anggur yang tersedia
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default PlantManagementPage

