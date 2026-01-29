import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import Layout from './components/layout/Layout'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage' // Keeps user dashboard logic if needed elsewhere
import BackofficeDashboard from './pages/BackofficeDashboard' // Import Admin Dashboard
import BackofficeDetail from './pages/BackofficeDetail' // [NEW]
import PolizasPage from './pages/PolizasPage'
import MisPolizasPage from './pages/MisPolizasPage'
import PagosPage from './pages/PagosPage'
import SiniestrosPage from './pages/SiniestrosPage'
import ModulesPage from './pages/ModulesPage' // New
import ReportesPage from './pages/admin/ReportesPage.jsx' // [NEW] Reports Module
import FacturasPage from './pages/admin/FacturasPage.jsx' // [NEW] Facturas Module
import ReglasPage from './pages/admin/ReglasPage.jsx' // [NEW] Business Rules Module
import PerfilPage from './pages/PerfilPage'
import InfoPage from './pages/InfoPage'

import { ROLES } from './constants/roles.js'
// ...

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Redirect root: if admin -> dashboard, if user -> info */}
            <Route index element={<Navigate to="/info" replace />} />

            {/* Accessible by ALL Logged In */}
            <Route path="info" element={<InfoPage />} />
            <Route path="siniestros" element={<SiniestrosPage />} />
            <Route path="perfil" element={<PerfilPage />} />

            {/* ADMIN ONLY */}
            <Route path="dashboard" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <BackofficeDashboard />
              </PrivateRoute>
            } />
            <Route path="backoffice/siniestros/:id" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <BackofficeDetail />
              </PrivateRoute>
            } />
            <Route path="polizas" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <PolizasPage />
              </PrivateRoute>
            } />
            <Route path="pagos" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <PagosPage />
              </PrivateRoute>
            } />
            <Route path="mis-polizas" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <MisPolizasPage />
              </PrivateRoute>
            } />
            {/* Removed Usuarios Page as per request */}
            <Route path="modules" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <ModulesPage />
              </PrivateRoute>
            } />
            <Route path="reportes" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <ReportesPage />
              </PrivateRoute>
            } />
            <Route path="facturas" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <FacturasPage />
              </PrivateRoute>
            } />
            <Route path="reglas" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <ReglasPage />
              </PrivateRoute>
            } />

          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/info" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
