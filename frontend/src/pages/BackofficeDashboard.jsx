import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { FaEye, FaFilePdf } from 'react-icons/fa'

export default function BackofficeDashboard() {
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('Todos')
    const navigate = useNavigate()

    useEffect(() => {
        loadClaims()
    }, [])

    const loadClaims = async () => {
        try {
            // Assuming GET /api/siniestros/list is implemented or using a general search
            // Using mock data tailored to the requested API response for now if endpoint strictly not ready
            // But we implemented SiniestroController placeholder? No, we implemented Aviso.
            // We need a GET endpoint. For now, empty list or mock.
            setLoading(false)
        } catch (error) {
            console.error('Error loading claims:', error)
            setLoading(false)
        }
    }

    const maskData = (text) => {
        if (!text || text.length < 4) return '****'
        return text.substring(0, 3) + '****' + text.substring(text.length - 3)
    }

    const filteredClaims = filter === 'Todos'
        ? claims
        : claims.filter(c => c.estado === filter)

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Backoffice - Gestión de Siniestros</h1>

            <div className="flex gap-4 mb-6">
                {['Todos', 'Reportado', 'En_tramite', 'Pagado'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Caso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fallecido (Cédula)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClaims.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No hay casos registrados.
                                </td>
                            </tr>
                        ) : (
                            filteredClaims.map(claim => (
                                <tr key={claim.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {maskData(claim.cedula_fallecido)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(claim.fecha_defuncion).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${claim.estado === 'Reportado' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${claim.estado === 'En_tramite' ? 'bg-blue-100 text-blue-800' : ''}
                                ${claim.estado === 'Pagado' ? 'bg-green-100 text-green-800' : ''}
                            `}>
                                            {claim.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/backoffice/siniestros/${claim.id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                        >
                                            <FaEye /> Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
