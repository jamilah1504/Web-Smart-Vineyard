import { Route } from 'react-router-dom'
import { StaffPaths } from './routePaths'
import { RequireRole } from '../core/auth/RequireRole.jsx'
import { RoleLayout } from '../layouts/RoleLayout.jsx'

import DashboardPage from '../pages/DashboardPage.jsx'
import MonitoringPage from '../pages/MonitoringPage.jsx'
import StaffUploadImagePage from '../modules/staff/pages/UploadImagePage.jsx'

export function StaffRoutes() {
  return (
    <Route
      path={`${StaffPaths.root}/*`}
      element={
        <RequireRole allowed={['staff']}>
          <RoleLayout role="staff" />
        </RequireRole>
      }
    >
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="upload-image" element={<StaffUploadImagePage />} />
      <Route path="sensors" element={<MonitoringPage />} />
    </Route>
  )
}

