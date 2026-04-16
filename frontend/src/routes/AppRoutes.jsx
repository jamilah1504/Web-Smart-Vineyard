import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicRoutes } from './publicRoutes.jsx'
import { OwnerRoutes } from './ownerRoutes.jsx'
import { AgronomisRoutes } from './agronomisRoutes.jsx'
import { StaffRoutes } from './staffRoutes.jsx'
import { PublicPaths } from './routePaths.js'
import { RequireAuth } from '../core/auth/RequireAuth.jsx'
import { AuthRedirect } from '../core/auth/AuthRedirect.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {PublicRoutes()}

      <Route element={<RequireAuth />}>
        {OwnerRoutes()}
        {AgronomisRoutes()}
        {StaffRoutes()}
      </Route>

      <Route path="/" element={<Navigate to={PublicPaths.landing} replace />} />
      <Route path="/app" element={<AuthRedirect />} />
      <Route path="*" element={<Navigate to={PublicPaths.landing} replace />} />
    </Routes>
  )
}

