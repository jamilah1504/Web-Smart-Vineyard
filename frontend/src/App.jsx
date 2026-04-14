import { BrowserRouter, useLocation, Outlet } from 'react-router-dom'
import './assets/styles/App.css'
import { AuthProvider } from './core/auth/AuthContext.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

function PageTransition() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-enter">
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* PageTransition tetap dipakai di bawah (via route tree) jika diperlukan */}
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
