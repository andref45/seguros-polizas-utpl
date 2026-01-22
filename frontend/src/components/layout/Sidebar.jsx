import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaHome, FaFileContract, FaExclamationTriangle, FaSignOutAlt, FaThLarge, FaMoneyBillWave, FaChartLine, FaCogs } from 'react-icons/fa'
import { useAuth } from '../../store/AuthContext'

export default function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/siniestros', label: 'Gestión Siniestros', icon: <FaExclamationTriangle /> },
        { path: '/polizas', label: 'Gestión Pólizas', icon: <FaFileContract /> },
        { path: '/pagos', label: 'Gestión Pagos', icon: <FaMoneyBillWave /> },
        { path: '/reportes', label: 'Reportes e Inteligencia', icon: <FaChartLine /> },
        { path: '/reglas', label: 'Reglas de Negocio', icon: <FaCogs /> },
        { path: '/modules', label: 'Todos los Módulos', icon: <FaThLarge /> },
    ]

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard'
        return location.pathname.startsWith(path)
    }

    return (
        <div className="w-64 bg-utpl-blue min-h-screen text-white flex flex-col shadow-xl z-20">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-utpl-blue-light bg-utpl-blue-dark">
                <span className="text-xl font-bold tracking-tight text-white">Seguros <span className="text-utpl-gold">UTPL</span></span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 border-l-4 
              ${isActive(item.path)
                                ? 'bg-utpl-blue-light border-utpl-gold text-white'
                                : 'border-transparent text-gray-400 hover:bg-utpl-blue-light hover:text-gray-100'
                            }`}
                    >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Footer / User Profile Summary */}
            <div className="p-4 border-t border-utpl-blue-light bg-utpl-blue-dark">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-utpl-gold flex items-center justify-center text-utpl-blue font-bold">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Administrador</p>
                        <p className="text-xs text-gray-400">admin@segurosutpl.edu.ec</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md text-xs font-medium text-gray-300 hover:bg-utpl-blue-light hover:text-white transition-colors"
                >
                    <FaSignOutAlt className="mr-2" /> Cerrar Sesión
                </button>
            </div>
        </div>
    )
}

