import { useState, useEffect } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaSearch, FaFilter, FaCheckCircle, FaClock, FaMoneyBillWave, FaExclamationCircle } from 'react-icons/fa'

export default function BackofficeDashboard() {
    // Mock data for initial visualization matching new enterprise style
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('Todos')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                setLoading(true)
                const response = await api.get('/siniestros')
                if (response.data.success) {
                    setClaims(response.data.data)
                }
            } catch (error) {
                console.error('Error fetching claims:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchClaims()
    }, [])

    const maskData = (text) => {
        if (!text || text.length < 4) return '****'
        return text.substring(0, 3) + '****' + text.substring(text.length - 3)
    }

    const filteredClaims = filter === 'Todos'
        ? claims
        : claims.filter(c => c.estado === filter)

    // Calculate Stats
    const stats = {
        total: claims.length,
        reportado: claims.filter(c => c.estado === 'Reportado').length,
        tramite: claims.filter(c => c.estado === 'En_tramite').length,
        pagado: claims.filter(c => c.estado === 'Pagado').length
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8 ">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Siniestros</h1>
                <p className="text-gray-500 mt-1">Monitoreo y atención de reclamaciones recientes.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card border-l-4 border-l-utpl-blue flex items-center p-4">
                    <div className="p-3 rounded-full bg-blue-50 text-utpl-blue mr-4">
                        <FaExclamationCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Casos</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>
                <div className="card border-l-4 border-l-yellow-500 flex items-center p-4">
                    <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4">
                        <FaClock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pendientes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.reportado}</p>
                    </div>
                </div>
                <div className="card border-l-4 border-l-blue-500 flex items-center p-4">
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <FaFilter size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">En Trámite</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.tramite}</p>
                    </div>
                </div>
                <div className="card border-l-4 border-l-green-500 flex items-center p-4">
                    <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                        <FaMoneyBillWave size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pagados</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pagado}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['Todos', 'Reportado', 'En_tramite', 'Pagado'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === status
                                ? 'bg-white text-utpl-blue shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Buscar por cédula..."
                        className="input-field pl-10"
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white shadow-soft rounded-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Caso</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fallecido</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Declarante</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : filteredClaims.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron siniestros con este filtro.
                                    </td>
                                </tr>
                            ) : (
                                filteredClaims.map(claim => (
                                    <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-utpl-blue">
                                            {claim.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {maskData(claim.cedula_fallecido)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {claim.polizas?.usuarios ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{claim.polizas.usuarios.nombres} {claim.polizas.usuarios.apellidos}</span>
                                                    <span className="text-xs text-gray-400">{claim.polizas.usuarios.email}</span>
                                                </div>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(claim.fecha_defuncion).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${claim.estado === 'Reportado' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : ''}
                                                ${claim.estado === 'En_tramite' ? 'bg-blue-50 text-blue-800 border-blue-200' : ''}
                                                ${claim.estado === 'Pagado' ? 'bg-green-50 text-green-800 border-green-200' : ''}
                                            `}>
                                                {claim.estado.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/backoffice/siniestros/${claim.id}`)}
                                                className="text-utpl-blue hover:text-utpl-gold transition-colors flex items-center justify-end gap-1 ml-auto"
                                            >
                                                <FaEye /> Gestionar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
