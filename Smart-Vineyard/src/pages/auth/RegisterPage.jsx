import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerRequest } from '../../services/authApi' // Sesuaikan path ini jika perlu

function RegisterPage() {
  const navigate = useNavigate()

  const [namaLengkap, setNamaLengkap] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Staff') // Default role
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Panggil API Register
      await registerRequest({
        nama_lengkap: namaLengkap,
        email: email,
        password: password,
        role: role
      })

      // Jika sukses, lempar ke halaman login
      alert('Registrasi berhasil! Silakan login dengan akun baru Anda.')
      navigate('/login')
      
    } catch (err) {
      console.error("🔴 Gagal Register:", err)
      setError(err?.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card-enter login-card">
        <div className="login-header">
          <div className="login-logo-circle">S</div>
          <div className="section-title login-title">Buat Akun Baru</div>
          <div className="section-description login-subtitle">
            Daftar untuk mengakses Saung Tinanggur
          </div>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          {error ? <div className="small-text text-body" style={{ color: 'red', marginBottom: '10px' }}>{error}</div> : null}
          
          {/* Field Nama Lengkap */}
          <div className="login-field">
            <label className="login-label">Nama Lengkap</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">👤</span>
              <input
                type="text"
                placeholder="Misal: Budi Petani"
                className="login-input"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Field Email */}
          <div className="login-field">
            <label className="login-label">Email</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">@</span>
              <input
                type="email"
                placeholder="email@tinanggur.com"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Field Role (Dropdown) */}
          <div className="login-field">
            <label className="login-label">Daftar Sebagai</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🏢</span>
              <select 
                className="login-input" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                <option value="Owner">Owner (Pemilik)</option>
                <option value="Agronomis">Agronomis (Ahli Tanaman)</option>
                <option value="Staff">Staff (Pekerja Kebun)</option>
              </select>
            </div>
          </div>

          {/* Field Password */}
          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-submit-btn"
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Memproses...' : <>Daftar Sekarang <span>→</span></>}
          </button>

          <div className="login-divider-row" style={{ marginTop: '20px' }}>
            <div className="login-divider-line" />
            <span>Sudah punya akun?</span>
            <div className="login-divider-line" />
          </div>

          <button
            type="button"
            className="login-google-btn"
            onClick={() => navigate('/login')}
          >
            Masuk di sini
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage