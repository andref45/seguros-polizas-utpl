import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import Layout from './components/layout/Layout'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PolizasPage from './pages/PolizasPage'
import MisPolizasPage from './pages/MisPolizasPage'
import PagosPage from './pages/PagosPage'
import SiniestrosPage from './pages/SiniestrosPage'
import PerfilPage from './pages/PerfilPage'

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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="polizas" element={<PolizasPage />} />
            <Route path="mis-polizas" element={<MisPolizasPage />} />
            <Route path="pagos" element={<PagosPage />} />
            <Route path="siniestros" element={<SiniestrosPage />} />
            <Route path="perfil" element={<PerfilPage />} />
          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
