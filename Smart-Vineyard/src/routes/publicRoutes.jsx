import { Route } from 'react-router-dom'
import { PublicPaths } from './routePaths'
import LandingPage from '../shared/pages/LandingPage.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'

export function PublicRoutes() {
  return (
    <>
      <Route path={PublicPaths.landing} element={<LandingPage />} />
      <Route path={PublicPaths.login} element={<LoginPage />} />
    </>
  )
}

