import { Route } from 'react-router-dom'
import { AgronomisPaths } from './routePaths'
import { RequireRole } from '../core/auth/RequireRole.jsx'
import { RoleLayout } from '../layouts/RoleLayout.jsx'

import DashboardPage from '../pages/DashboardPage.jsx'
import MonitoringPage from '../pages/MonitoringPage.jsx'
import AgronomisAnalysisPage from '../modules/agronomis/pages/AnalysisPage.jsx'
import AgronomisRecommendationPage from '../modules/agronomis/pages/RecommendationPage.jsx'
import AgronomisHistoryPage from '../modules/agronomis/pages/HistoryPage.jsx'

export function AgronomisRoutes() {
  return (
    <Route
      path={`${AgronomisPaths.root}/*`}
      element={
        <RequireRole allowed={['agronomis']}>
          <RoleLayout role="agronomis" />
        </RequireRole>
      }
    >
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="monitoring" element={<MonitoringPage />} />
      <Route path="sensors" element={<MonitoringPage />} />
      <Route path="analysis" element={<AgronomisAnalysisPage />} />
      <Route path="recommendation" element={<AgronomisRecommendationPage />} />
      <Route path="history" element={<AgronomisHistoryPage />} />
    </Route>
  )
}

