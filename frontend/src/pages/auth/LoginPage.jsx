import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../core/auth/AuthContext.jsx'
import { getDefaultRoleHomePath } from '../../utils/rolePaths.js'
import { PublicPaths } from '../../routes/routePaths.js'
import bg from '../../assets/images/login-bg.jpg'

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import axios from 'axios'

const GOOGLE_CLIENT_ID = "344624239850-l1beqpsi7np2kjsecgv3fu5u1r9uq9mb.apps.googleusercontent.com"

function LoginPage() {
  const { login, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname

  // Pengamat (useEffect) untuk navigasi otomatis
  useEffect(() => {
    if (currentUser) {
      const target = from && from !== '/login' ? from : getDefaultRoleHomePath(currentUser.role);
      navigate(target, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const res = await axios.post('https://d34f3d5l-5000.asse.devtunnels.ms/api/auth/google', {
        token: credentialResponse.credential
      });

      if (res.data.status === 'success') {
        loginWithGoogle(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal login dengan Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* 🌟 1. WRAPPER HALAMAN DENGAN BACKGROUND BLUR */}
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        
        {/* Layer Background Floral dengan efek Blur */}
        <div style={{
          position: 'absolute',
          top: '-20px', left: '-20px', right: '-20px', bottom: '-20px', // Melebihi layar agar pinggiran blur tidak putih
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          zIndex: -2
        }} />

        {/* Layer Overlay Hitam Transparan agar form tetap terbaca jelas */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)', // Sesuaikan tingkat kegelapan di sini (0.45)
          zIndex: -1
        }} />

        {/* 🌟 2. KARTU LOGIN (Ditambahkan efek kaca / Glassmorphism) */}
        <div className="card login-card-enter login-card" style={{ 
          position: 'relative', 
          zIndex: 1, 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Putih sedikit transparan
          backdropFilter: 'blur(10px)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
        }}>

          {/* 🌟 3. TOMBOL KEMBALI (Dipindahkan ke DALAM Card) */}
          <button
            type="button"
            onClick={() => navigate(PublicPaths.landing)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', fontWeight: '600', color: '#7f8c8d',
              padding: '0 0 15px 0', alignSelf: 'flex-start',
              transition: 'color 0.2s', width: 'fit-content'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#27ae60'}
            onMouseOut={(e) => e.currentTarget.style.color = '#7f8c8d'}
          >
            ← Kembali
          </button>

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
                .catch((err) => {
                  setError(err?.message || 'Login gagal')
                })
                .finally(() => setLoading(false))
            }}
            className="login-form"
          >
            {error ? <div className="small-text text-body" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div> : null}
            
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
              style={{ width: '100%' }}
            >
              {loading ? 'Memproses...' : <>Masuk Sistem <span>→</span></>}
            </button>
            
            <div className="login-divider-row">
              <div className="login-divider-line" />
              <span>Atau masuk dengan</span>
              <div className="login-divider-line" />
            </div>

            {/* 🌟 4. TOMBOL GOOGLE (Disesuaikan lebar dan bentuknya) */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Login Google Dibatalkan/Gagal')}
                shape="rectangular" // Membuat sudutnya kotak/sedikit membulat menyesuaikan input form
                size="large"        // Membesarkan ukuran area klik
                width="100%"        // Memaksa lebar penuh sejajar dengan tombol manual
                text="continue_with"
              />
            </div>

            <div className="login-divider-row" style={{ marginTop: '20px' }}>
              <div className="login-divider-line" />
              <span>Belum punya akun?</span>
              <div className="login-divider-line" />
            </div>
            
            <button
              type="button"
              className="login-google-btn" 
              onClick={() => navigate(PublicPaths.register)}
              style={{ width: '100%' }}
            >
              Daftar di sini
            </button>

          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default LoginPage