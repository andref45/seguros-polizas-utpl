import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { FaUser, FaFileContract, FaMoneyBillWave, FaClipboardList, FaSignOutAlt, FaTachometerAlt, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa'
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
    const baseClass = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
    return isActive(path)
      ? `${baseClass} text - brand - primary bg - blue - 50`
      : `${baseClass} text - gray - 600 hover: text - brand - primary hover: bg - gray - 50`
  }

  const isAdmin = user?.role === ROLES.ADMIN

  // Enterprise Design Tweaks:
  // User Navbar: White background, clean shadow, brand colors for active state
  // Admin Navbar: (Technically not used if Layout handles it, but good as fallback) Darker
  const navbarClass = "bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30"

  const brandText = "Portal de Seguros UTPL"

  return (
    <nav className={navbarClass}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to={isAdmin ? "/dashboard" : "/info"} className="flex items-center gap-2 group">
              <div className="bg-utpl-blue text-white p-1.5 rounded-lg group-hover:bg-utpl-gold transition-colors">
                <FaShieldAlt className="text-xl" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-utpl-blue transition-colors">
                Seguros <span className="text-utpl-gold">UTPL</span>
              </span>
            </Link>

            {/* SHARED/USER Routes */}
            <Link to="/info" className={navLinkClass('/info')}>
              <FaClipboardList className={isActive('/info') ? "text-utpl-gold" : "text-gray-400"} />
              <span>Información</span>
            </Link>

            <Link to="/siniestros" className={navLinkClass('/siniestros')}>
              <FaExclamationTriangle className={isActive('/siniestros') ? "text-red-500" : "text-gray-400"} />
              <span>Reportar Siniestro</span>
            </Link>

            {/* Restricted Links (Hidden)
             <Link to="/mis-polizas" className={navLinkClass('/mis-polizas')}>
              <FaFileContract className={isActive('/mis-polizas') ? "text-blue-500" : "text-gray-400"} />
              <span>Mis Pólizas</span>
            </Link>

             <Link to="/pagos" className={navLinkClass('/pagos')}>
              <FaMoneyBillWave className={isActive('/pagos') ? "text-green-500" : "text-gray-400"} />
              <span>Pagos</span>
            </Link>
            */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/perfil"
            className="flex items-center gap-2 text-gray-700 hover:text-utpl-blue transition font-medium text-sm"
          >
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-utpl-blue border border-gray-200">
              <FaUser />
            </div>
            <span className="hidden md:inline">
              {user?.nombres?.split(' ')[0] || user?.email?.split('@')[0] || 'Mi Perfil'}
            </span>
          </Link>

          <div className="h-8 w-px bg-gray-200 mx-1"></div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition text-sm font-medium"
            title="Cerrar Sesión"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
