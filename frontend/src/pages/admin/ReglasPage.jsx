import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FaCogs, FaEdit, FaCheck, FaTimes, FaCalendarAlt, FaPercentage } from 'react-icons/fa'

export default function ReglasPage() {
    const [vigencias, setVigencias] = useState([])
    const [copagos, setCopagos] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('vigencias')
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await api.get('/reglas')
            setVigencias(res.data.data.vigencias)
            setCopagos(res.data.data.copagos)
        } catch (error) {
            console.error('Error loading rules:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (item) => {
        setEditingId(item.id)
        setEditForm({ ...item })
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditForm({})
    }

    const saveVigencia = async (id) => {
        try {
            await api.put(`/reglas/vigencias/${id}`, { estado: editForm.estado })
            loadData()
            setEditingId(null)
        } catch (error) {
            alert('Error al actualizar vigencia')
        }
    }

    const saveCopago = async (id) => {
        try {
            await api.put(`/reglas/copagos/${id}`, {
                porcentaje_usuario: parseFloat(editForm.porcentaje_usuario),
                porcentaje_institucion: parseFloat(editForm.porcentaje_institucion)
            })
            loadData()
            setEditingId(null)
        } catch (error) {
            alert('Error al actualizar copago')
        }
    }

    if (loading) return <div className="p-8 text-center">Cargando reglas...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FaCogs className="text-utpl-blue" />
                Configuración de Reglas de Negocio
            </h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'vigencias' ? 'border-b-2 border-utpl-blue text-utpl-blue' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('vigencias')}
                >
                    <FaCalendarAlt className="inline mr-2" /> Vigencias (RN001)
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'copagos' ? 'border-b-2 border-utpl-blue text-utpl-blue' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('copagos')}
                >
                    <FaPercentage className="inline mr-2" /> Esquemas de Pago (RN003)
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                {activeTab === 'vigencias' && (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">Periodo</th>
                                <th className="px-6 py-3">Inicio</th>
                                <th className="px-6 py-3">Fin</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vigencias.map(v => (
                                <tr key={v.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold">{v.descripcion}</td>
                                    <td className="px-6 py-4">{v.fecha_inicio}</td>
                                    <td className="px-6 py-4">{v.fecha_fin}</td>
                                    <td className="px-6 py-4">
                                        {editingId === v.id ? (
                                            <select
                                                value={editForm.estado}
                                                onChange={e => setEditForm({ ...editForm, estado: e.target.value })}
                                                className="border rounded px-2 py-1"
                                            >
                                                <option value="abierto">Abierto</option>
                                                <option value="cerrado">Cerrado</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.estado === 'abierto' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {v.estado.toUpperCase()}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingId === v.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => saveVigencia(v.id)} className="text-green-600 hover:text-green-800"><FaCheck /></button>
                                                <button onClick={handleCancel} className="text-red-600 hover:text-red-800"><FaTimes /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEdit(v)} className="text-utpl-blue hover:text-utpl-gold"><FaEdit /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'copagos' && (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">Esquema</th>
                                <th className="px-6 py-3 text-center">% Usuario</th>
                                <th className="px-6 py-3 text-center">% Institución</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {copagos.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-900">{c.esquema}</td>
                                    <td className="px-6 py-4 text-center">
                                        {editingId === c.id ? (
                                            <input
                                                type="number" step="0.01"
                                                value={editForm.porcentaje_usuario}
                                                onChange={e => setEditForm({ ...editForm, porcentaje_usuario: e.target.value })}
                                                className="border rounded px-2 py-1 w-20 text-center"
                                            />
                                        ) : (
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-mono">
                                                {(c.porcentaje_usuario * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {editingId === c.id ? (
                                            <input
                                                type="number" step="0.01"
                                                value={editForm.porcentaje_institucion}
                                                onChange={e => setEditForm({ ...editForm, porcentaje_institucion: e.target.value })}
                                                className="border rounded px-2 py-1 w-20 text-center"
                                            />
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-mono">
                                                {(c.porcentaje_institucion * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingId === c.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => saveCopago(c.id)} className="text-green-600 hover:text-green-800"><FaCheck /></button>
                                                <button onClick={handleCancel} className="text-red-600 hover:text-red-800"><FaTimes /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEdit(c)} className="text-utpl-blue hover:text-utpl-gold"><FaEdit /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <p className="text-xs text-gray-400 mt-4">
                * Nota: Los cambios en porcentajes afectarán inmediatamente a los cálculos de nómina. Asegúrese de coordinar con Finanzas.
            </p>
        </div>
    )
}
