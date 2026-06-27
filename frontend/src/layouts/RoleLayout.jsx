import { useMemo, useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../core/auth/AuthContext'
import { roleNavConfig } from './roleNavConfig'
import { PublicPaths } from '../routes/routePaths'
import { useSystemStatus } from '../hooks/useSystemStatus'

function SidebarLink({ to, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        ['sidebar-link', isActive ? 'active' : ''].join(' ').trim()
      }
      style={{ display: 'block', padding: '10px 16px', textDecoration: 'none' }} // Opsional: Sesuaikan style jika perlu
    >
      <span>{label}</span>
    </NavLink>
  )
}

const STATUS_CHIP_CLASS = {
  online: 'chip',
  partial: 'chip chip-warning',
  offline: 'chip chip-offline',
  error: 'chip chip-offline',
  unknown: 'chip chip-warning',
  loading: 'chip',
}

export function RoleLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const systemStatus = useSystemStatus(15000)

  // 1. UPDATE DI SINI: Ubah default fallback menjadi menuGroups: []
  const config = useMemo(() => {
    return roleNavConfig[role] ?? { title: 'Smart Vineyard', subtitle: '', menuGroups: [] }
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
        
        {/* 2. UPDATE DI SINI: Render berdasarkan menuGroups */}
        <nav className="sidebar-nav">
          {config.menuGroups.map((group, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              
              {/* Render Subtitle (Group Title) */}
              <div style={{ 
                fontSize: '11px', 
                color: '#95a5a6', 
                fontWeight: '800', 
                letterSpacing: '1px', 
                padding: '8px 16px', 
                textTransform: 'uppercase' 
              }}>
                {group.groupTitle}
              </div>

              {/* Render Link di dalam Grup Tersebut */}
              {group.links.map((l) => (
                <SidebarLink
                  key={l.to}
                  to={l.to}
                  label={l.label}
                  onNavigate={() => setSidebarOpen(false)}
                />
              ))}
              
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
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
            <div
              className={STATUS_CHIP_CLASS[systemStatus.level] || 'chip'}
              title={
                systemStatus.totalCount > 0
                  ? `${systemStatus.onlineCount} dari ${systemStatus.totalCount} perangkat online`
                  : 'Status koneksi perangkat IoT'
              }
            >
              <span className="chip-dot" />
              {systemStatus.label}
            </div>
            <span className="small-text">
              User <strong>{currentUser?.nama_lengkap ?? '-'}</strong>
            </span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  )
}