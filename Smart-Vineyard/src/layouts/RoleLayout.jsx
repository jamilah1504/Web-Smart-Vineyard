import { useMemo, useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../core/auth/AuthContext'
import { roleNavConfig } from './roleNavConfig'
import { PublicPaths } from '../routes/routePaths'

function SidebarLink({ to, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        ['sidebar-link', isActive ? 'active' : ''].join(' ').trim()
      }
    >
      <span>{label}</span>
    </NavLink>
  )
}

export function RoleLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const config = useMemo(() => {
    return roleNavConfig[role] ?? { title: 'Smart Vineyard', subtitle: '', links: [] }
  }, [role])

  useEffect(() => {
    const el = document.querySelector('.main-content')
    if (el) el.scrollTop = 0
  }, [location])

  return (
    <div className="app-root">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-logo">{config.title}</div>
          <div className="sidebar-subtitle">{config.subtitle}</div>
        </div>
        <nav className="sidebar-nav">
          {config.links.map((l) => (
            <SidebarLink
              key={l.to}
              to={l.to}
              label={l.label}
              onNavigate={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div>Login sebagai: <strong>{user?.name ?? 'User'}</strong></div>
          <div className="u-mt-04">
            <button
              type="button"
              className="btn-pill-outline"
              onClick={() => {
                logout()
                navigate(PublicPaths.login)
              }}
            >
              Logout
            </button>
          </div>
          <div className="u-mt-04">© {new Date().getFullYear()} Smart Vineyard</div>
        </div>

        <button
          type="button"
          className="menu-close sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Buka menu navigasi"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="topbar-title">
            <h1>Smart Vineyard</h1>
            <span>Role: {role}</span>
          </div>

          <div className="topbar-status">
            <div className="chip">
              <span className="chip-dot" />
              System Online
            </div>
            <span className="small-text">
              User <strong>{user?.name ?? '-'}</strong>
            </span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  )
}


