import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../core/auth/AuthContext.jsx'
import { getDefaultRoleHomePath } from '../../utils/rolePaths.js'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname

  return (
    <div className="login-page">
      <div className="card login-card-enter login-card">
        <div className="login-header">
          <div className="login-logo-circle">S</div>
          <div className="section-title login-title">Smart Vineyard</div>
          <div className="section-description login-subtitle">
            Masuk ke Saung Tinanggur Dashboard
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError('')
            setLoading(true)

            login({ email, password })
              .then((u) => {
                // === LOG UNTUK DEBUGGING ===
                console.log("🟢 LOGIN API SUKSES! Data dari Backend:", u)
                
                const target = from && from !== '/login' ? from : getDefaultRoleHomePath(u?.role)
                
                console.log("🔵 MAU PINDAH KE HALAMAN:", target)
                // =====================================

                navigate(target, { replace: true })
              })
              .catch((err) => {
                // === LOG UNTUK DEBUGGING ===
                console.error("🔴 YAH GAGAL LOGIN:", err)
                // =====================================
                
                setError(err?.message || 'Login gagal')
              })
              .finally(() => setLoading(false))
          }}
          className="login-form"
        >
          {error ? <div className="small-text text-body" style={{ color: 'red', marginBottom: '10px' }}>{error}</div> : null}
          <div className="login-field">
            <label className="login-label">Email / Username</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">@</span>
              <input
                type="email"
                placeholder="admin@tinanggur.com"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="login-remember-row">
            <label className="login-remember-checkbox">
              <input type="checkbox" className="accent-green" /> Ingat saya
            </label>
            <button
              type="button"
              className="login-forgot-btn"
              onClick={() => navigate(PublicPaths.forgotPassword)}
            >
              Lupa password?
            </button>
          </div>
          <button
            type="submit"
            className="btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Memproses...' : <>Masuk Sistem <span>→</span></>}
          </button>
          
          <div className="login-divider-row">
            <div className="login-divider-line" />
            <span>Atau masuk dengan</span>
            <div className="login-divider-line" />
          </div>
          <button
            type="button"
            className="login-google-btn"
          >
            <span className="login-google-icon">G</span>
            <span>Google</span>
          </button>

          {/* === TAMBAHAN TOMBOL REGISTER DI SINI === */}
          <div className="login-divider-row" style={{ marginTop: '20px' }}>
            <div className="login-divider-line" />
            <span>Belum punya akun?</span>
            <div className="login-divider-line" />
          </div>
          <button
            type="button"
            className="login-google-btn" /* Kita pinjam styling button yang sama */
            onClick={() => navigate('/register')}
          >
            Daftar di sini
          </button>
          {/* ======================================== */}

        </form>
      </div>
    </div>
  )
}

export default LoginPage