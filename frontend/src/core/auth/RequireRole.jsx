import { Navigate, Outlet, useLocation} from 'react-router-dom'
import { useAuth } from './AuthContext'
import { getDefaultRoleHomePath } from "../../utils/rolePaths.js";

export function RequireRole({ allowed, children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // 1. Cek apakah user sudah login
  if (!currentUser) {
    console.log("🔴 [RequireRole] User belum login, tendang ke /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Samakan format huruf besar/kecil (Ubah semua jadi lowercase)
  const userRole = currentUser?.role?.toLowerCase();
  const allowedRoles = allowed.map(role => role.toLowerCase());

  // 3. Cek apakah role user ada di dalam daftar yang diizinkan
  if (!allowedRoles.includes(userRole)) {
    console.log(`🔴 [RequireRole] Akses ditolak! Role user: ${userRole}, Dibutuhkan:`, allowedRoles);
    // Jika tidak punya akses, kembalikan ke login (atau ke halaman 403 Forbidden)
    return <Navigate to="/login" replace />; 
  }

  console.log(`🟢 [RequireRole] Akses diizinkan untuk: ${userRole}`);
  return children;
}