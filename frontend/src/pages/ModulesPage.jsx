import { Link } from 'react-router-dom'
import { FaThLarge, FaTools, FaFileInvoice, FaChartBar, FaUsers } from 'react-icons/fa'

export default function ModulesPage() {
    const modules = [
        { title: 'Siniestros', desc: 'Gestión de reportes y aprobaciones', icon: <FaTools />, color: 'bg-red-500', path: '/siniestros' },
        { title: 'Pólizas', desc: 'Administración de contratos', icon: <FaFileInvoice />, color: 'bg-blue-500', path: '/polizas' },
        { title: 'Pagos', desc: 'Control de recaudación', icon: <FaChartBar />, color: 'bg-green-500', path: '/pagos' },
        { title: 'Reportes', desc: 'Inteligencia de Negocio', icon: <FaChartBar />, color: 'bg-purple-500', path: '/reportes' },
        { title: 'Reglas', desc: 'Configuración del sistema', icon: <FaTools />, color: 'bg-orange-500', path: '/reglas' },
    ]

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Módulos del Sistema</h1>
                <p className="text-gray-600">Acceso rápido a todas las funcionalidades operativas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {modules.map((mod, idx) => (
                    <Link key={idx} to={mod.path} className="block group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer h-full">
                            <div className={`${mod.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                <div className="text-xl">{mod.icon}</div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-utpl-blue transition-colors">{mod.title}</h3>
                            <p className="text-sm text-gray-500">{mod.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
