import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { getDefaultRoleHomePath } from "../../utils/rolePaths.js";

export function AuthRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={getDefaultRoleHomePath(user?.role)} replace />
}

