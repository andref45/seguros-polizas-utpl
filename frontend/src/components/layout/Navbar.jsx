import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { FaUser, FaFileContract, FaMoneyBillWave, FaClipboardList, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate('/login')
    }
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

  return (
    <nav className="bg-utpl-blue shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-utpl-gold font-bold text-xl hover:text-utpl-gold-light transition">
              Sistema de Pólizas UTPL
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <FaTachometerAlt />
                <span>Dashboard</span>
              </Link>

              <Link to="/polizas" className={navLinkClass('/polizas')}>
                <FaFileContract />
                <span>Pólizas</span>
              </Link>

              <Link to="/mis-polizas" className={navLinkClass('/mis-polizas')}>
                <FaClipboardList />
                <span>Mis Pólizas</span>
              </Link>

              <Link to="/pagos" className={navLinkClass('/pagos')}>
                <FaMoneyBillWave />
                <span>Pagos</span>
              </Link>

              <Link to="/siniestros" className={navLinkClass('/siniestros')}>
                <FaClipboardList />
                <span>Siniestros</span>
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
      </div>
    </nav>
  )
}
