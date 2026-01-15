import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { FaUser, FaFileContract, FaMoneyBillWave, FaClipboardList, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'
import { ROLES } from '../../constants/roles.js'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navLinkClass = (path) => {
    const baseClass = "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
    return isActive(path)
      ? `${baseClass} bg-utpl-gold text-utpl-blue font-medium`
      : `${baseClass} text-white hover:bg-utpl-blue-light hover:text-utpl-gold`
  }

  const isAdmin = user?.role === ROLES.ADMIN
  const navbarClass = isAdmin ? "bg-gray-900 shadow-lg border-b-4 border-utpl-gold" : "bg-utpl-blue shadow-lg"
  const brandText = isAdmin ? "Administración Seguros UTPL" : "Portal de Seguros UTPL"

  return (
    <nav className={navbarClass}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to={isAdmin ? "/dashboard" : "/info"} className="text-utpl-gold font-bold text-xl hover:text-utpl-gold-light transition">
              {brandText}
            </Link>

            {/* ADMIN ONLY Routes */}
            {isAdmin && (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <FaTachometerAlt />
                  <span>Dashboard</span>
                </Link>

                <Link to="/polizas" className={navLinkClass('/polizas')}>
                  <FaFileContract />
                  <span>Pólizas</span>
                </Link>

                <Link to="/pagos" className={navLinkClass('/pagos')}>
                  <FaMoneyBillWave />
                  <span>Pagos</span>
                </Link>

                {/* Mis Polizas visible for Admin to see their own if needed, or remove? 
                      User asked to hide it for USER. Admin usually doesn't need "Mis Polizas", 
                      but let's keep it restricted or hidden if not needed. 
                      Actually, let's hide "Mis Polizas" for EVERYONE in the menu if it's not relevant for Admin context,
                      OR keep it for Admin if they also have policies.
                      The requirement was "Remove Mis Polizas from Navbar for USER".
                  */}
                <Link to="/mis-polizas" className={navLinkClass('/mis-polizas')}>
                  <FaClipboardList />
                  <span>Mis Pólizas (Admin)</span>
                </Link>
              </>
            )}

            {/* USER ONLY Routes */}
            {!isAdmin && (
              <Link to="/info" className={navLinkClass('/info')}>
                <FaClipboardList /> {/* Icon reusable or change */}
                <span>Información</span>
              </Link>
            )}

            {/* COMMON Routes */}
            <Link to="/siniestros" className={navLinkClass('/siniestros')}>
              <FaClipboardList />
              <span>{isAdmin ? 'Gestión Siniestros' : 'Reportar Siniestro'}</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/perfil"
            className="flex items-center gap-2 text-white hover:text-utpl-gold transition"
          >
            <FaUser />
            <span className="hidden md:inline">
              {user?.email?.split('@')[0] || 'Perfil'}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <FaSignOutAlt />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
