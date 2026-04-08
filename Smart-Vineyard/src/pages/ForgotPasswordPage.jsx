import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicPaths } from '../routes/routePaths'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="login-header">
          <div className="login-logo-circle">S</div>
          <div className="section-title login-title">Reset Password</div>
          <div className="section-description login-subtitle">
            Masukkan email yang terdaftar. Kami akan mengirim tautan untuk mengatur ulang password.
          </div>
        </div>

        {!submitted ? (
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault()
              // Placeholder: di tahap ini belum ada backend, jadi hanya simulasi sukses
              if (!email) return
              setSubmitted(true)
            }}
          >
            <div className="login-field">
              <label className="login-label">Email</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">@</span>
                <input
                  type="email"
                  className="login-input"
                  placeholder="admin@tinanggur.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary login-submit-btn">
              Kirim tautan reset
            </button>
          </form>
        ) : (
          <div className="login-form">
            <p className="text-body">
              Jika email terdaftar, tautan untuk mengatur ulang password sudah dikirim ke{' '}
              <strong>{email}</strong>.
            </p>
          </div>
        )}

        <button
          type="button"
          className="login-secondary-btn"
          onClick={() => navigate(PublicPaths.login)}
        >
          Kembali ke halaman login
        </button>
      </div>
    </div>
  )
}


