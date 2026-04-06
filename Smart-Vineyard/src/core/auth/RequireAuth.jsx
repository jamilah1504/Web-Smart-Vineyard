import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { PublicPaths } from '../../routes/routePaths'

export function RequireAuth() {
  // 1. Ganti isAuthenticated menjadi currentUser
  const { currentUser } = useAuth()
  const location = useLocation()

  // 2. Jika currentUser tidak ada (null/undefined), berarti belum login
  if (!currentUser) {
    console.log("🔴 [RequireAuth] Dicegat! Kembali ke halaman Login.");
    return <Navigate to={PublicPaths.login} replace state={{ from: location }} />
  }

  // 3. Jika currentUser ada, silakan masuk!
  console.log("🟢 [RequireAuth] Lolos pengecekan Auth.");
  return <Outlet />
}