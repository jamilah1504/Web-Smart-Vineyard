import { Route } from 'react-router-dom'
import { OwnerPaths } from './routePaths'
import { RequireRole } from '../core/auth/RequireRole.jsx'
import { RoleLayout } from '../layouts/RoleLayout.jsx'

import DashboardPage from '../pages/DashboardPage.jsx'
import MonitoringPage from '../pages/MonitoringPage.jsx'
import NotificationsPage from '../pages/NotificationsPage.jsx'
import ReportsPage from '../pages/ReportsPage.jsx'
import OwnerUsersPage from '../modules/owner/pages/UsersPage.jsx'
import OwnerAnalysisPage from '../modules/owner/pages/AnalysisPage.jsx'
import OwnerSettingsPage from '../modules/owner/pages/SettingsPage.jsx'
import OwnerTanksPage from '../modules/owner/pages/TanksPage.jsx'
import OwnerManualControlPage from '../modules/owner/pages/ManualControlPage.jsx'
import OwnerThresholdsPage from '../modules/owner/pages/ThresholdsPage.jsx'
import OwnerTrendsPage from '../modules/owner/pages/TrendsPage.jsx'
import OwnerDiagnosaPage from '../modules/owner/pages/DiagnosaPage.jsx'

export function OwnerRoutes() {
  return (
    <Route
      path={`${OwnerPaths.root}/*`}
      element={
        // Sesuaikan allowed dengan huruf besar 'O' (sesuai database ENUM)
        <RequireRole allowed={['Owner', 'owner']}> 
          <RoleLayout role="owner" />
        </RequireRole>
      }
    >
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="users" element={<OwnerUsersPage />} />
      <Route path="sensors" element={<MonitoringPage />} />
      <Route path="tanks" element={<OwnerTanksPage />} />
      <Route path="manual-control" element={<OwnerManualControlPage />} />
      <Route path="thresholds" element={<OwnerThresholdsPage />} />
      <Route path="trends" element={<OwnerTrendsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="analysis" element={<OwnerAnalysisPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="settings" element={<OwnerSettingsPage />} />
    </Route>
  )
}

