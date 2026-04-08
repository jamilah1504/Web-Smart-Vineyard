import { useState, useEffect } from 'react'

function DeviceManagementPage() {
  const [perangkatList, setPeangkatList] = useState([])
  const [varietasList, setVarietasList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    id: '',
    nama_node: '',
    lokasi_blok: '',
    varietas_id: '',
  })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Fetch perangkat
      const deviceResponse = await fetch('http://localhost:5000/api/perangkat', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const deviceResult = await deviceResponse.json()
      if (deviceResult.status === 'success') {
        setPeangkatList(deviceResult.data)
      }
      
      // Fetch varietas
      const varietasResponse = await fetch('http://localhost:5000/api/varietas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const varietasResult = await varietasResponse.json()
      if (varietasResult.status === 'success') {
        setVarietasList(varietasResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({
      id: '',
      nama_node: '',
      lokasi_blok: '',
      varietas_id: ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/perangkat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          user_id: localStorage.getItem('user_id')
        })
      })
      
      const result = await response.json()
      if (result.status === 'success') {
        await fetchAll()
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error submitting perangkat:', error)
    }
  }

  const getStatusColor = (status) => {
    return status === 'Online' ? '#1B5E20' : status === 'Offline' ? '#d9534f' : '#f39c12'
  }

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">Manajemen Perangkat IoT</div>
          <div className="page-caption page-caption-lg">
            Pantau status ESP32, kamera, dan sensor di kebun. Kelola lahan dan perangkat.
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="u-mb-1">
        <button 
          onClick={handleAddClick}
          className="btn-primary btn-pill-primary"
          style={{ backgroundColor: '#1B5E20', borderColor: '#1B5E20' }}
        >
          ➕ Daftarkan Perangkat Baru
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <section className="card card-animate card-elevated u-mb-15">
          <div className="card-header card-header-top-md">
            <div>
              <div className="card-title card-title-lg">Daftarkan Perangkat IoT</div>
              <div className="card-subtitle card-subtitle-lg">
                Tambahkan perangkat baru untuk monitoring dan kontrol
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="simple-card-list form-grid-2 u-mt-05">
            <div>
              <label className="small-text text-sm-muted">MAC Address Perangkat *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: AA:BB:CC:DD:EE:FF"
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value.toUpperCase()})}
                required
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">Nama Node/Lahan *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Blok A1, Ladang Utama..."
                value={formData.nama_node}
                onChange={(e) => setFormData({...formData, nama_node: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">Lokasi Blok *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Blok A, B, C..."
                value={formData.lokasi_blok}
                onChange={(e) => setFormData({...formData, lokasi_blok: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="small-text text-sm-muted">Varietas Anggur *</label>
              <select
                className="form-control"
                value={formData.varietas_id}
                onChange={(e) => setFormData({...formData, varietas_id: e.target.value})}
                required
              >
                <option value="">-- Pilih Varietas --</option>
                {varietasList.map(v => (
                  <option key={v.id} value={v.id}>{v.nama_varietas}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
              <button 
                type="submit" 
                className="btn-primary btn-pill-primary"
                style={{ backgroundColor: '#1B5E20', borderColor: '#1B5E20', flex: 1 }}
              >
                ✓ Daftarkan Perangkat
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

      {/* Device Status Summary */}
      <section className="card-grid-3 u-mb-1">
        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Total Perangkat</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="big-number">{perangkatList.length}</div>
            <div className="small-text text-sm-muted">Perangkat terdaftar</div>
          </div>
        </div>

        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Online</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="big-number" style={{ color: '#1B5E20' }}>
              {perangkatList.filter(p => p.status_koneksi === 'Online').length}
            </div>
            <div className="small-text text-sm-muted">Siap beroperasi</div>
          </div>
        </div>

        <div className="card card-animate card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Offline</div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            <div className="big-number" style={{ color: '#d9534f' }}>
              {perangkatList.filter(p => p.status_koneksi === 'Offline').length}
            </div>
            <div className="small-text text-sm-muted">Perlu dicek</div>
          </div>
        </div>
      </section>

      {/* Device List */}
      <section className="card card-animate card-elevated">
        <div className="card-header card-header-top-md">
          <div>
            <div className="card-title card-title-lg">Daftar Perangkat</div>
            <div className="card-subtitle card-subtitle-lg">
              Status dan informasi semua perangkat IoT
            </div>
          </div>
        </div>

        {loading ? (
          <div className="u-mt-1" style={{ textAlign: 'center', padding: '20px', color: '#95a5a6' }}>
            Memuat data...
          </div>
        ) : perangkatList.length === 0 ? (
          <div className="u-mt-1" style={{ textAlign: 'center', padding: '20px', color: '#95a5a6' }}>
            Belum ada perangkat terdaftar. Daftarkan perangkat pertama Anda sekarang.
          </div>
        ) : (
          <div className="table-wrapper u-mt-05">
            <table className="table table-compact">
              <thead>
                <tr style={{ borderBottom: '3px solid #1B5E20' }}>
                  <th style={{ color: '#1B5E20' }}>Nama Node</th>
                  <th style={{ color: '#1B5E20' }}>MAC Address</th>
                  <th style={{ color: '#1B5E20' }}>Blok/Lahan</th>
                  <th style={{ color: '#1B5E20' }}>Varietas</th>
                  <th style={{ color: '#1B5E20' }}>Status</th>
                  <th style={{ color: '#1B5E20' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {perangkatList.map((perangkat) => (
                  <tr key={perangkat.id}>
                    <td><strong>{perangkat.nama_node}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{perangkat.id}</td>
                    <td>{perangkat.lokasi_blok}</td>
                    <td>{perangkat.VarietasAnggur?.nama_varietas || '-'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: getStatusColor(perangkat.status_koneksi) === '#1B5E20' ? '#f5ede3' : getStatusColor(perangkat.status_koneksi) === '#d9534f' ? '#fadbd8' : '#fef5e7',
                        color: getStatusColor(perangkat.status_koneksi),
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {perangkat.status_koneksi}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-pill-outline"
                        style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                        title="Lihat detail dan kontrol"
                      >
                        👁️ Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="small-text text-sm-muted u-mt-05" style={{ textAlign: 'center', padding: '12px', color: '#95a5a6' }}>
              Daftar perangkat IoT dan status koneksi real-time
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default DeviceManagementPage


