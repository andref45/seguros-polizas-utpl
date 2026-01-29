import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FaFileInvoiceDollar, FaPlus, FaSpinner, FaCloudUploadAlt } from 'react-icons/fa'

export default function FacturasPage() {
    const [facturas, setFacturas] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        numero_factura: '',
        plan: 'Vida',
        periodo_mes: new Date().getMonth() + 1,
        periodo_anio: new Date().getFullYear(),
        monto_total: '',
        fecha_emision: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        loadFacturas()
    }, [])

    const loadFacturas = async () => {
        try {
            setLoading(true)
            const res = await api.get('/facturas')
            setFacturas(res.data.data || [])
        } catch (error) {
            console.error('Error loading facturas', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            await api.post('/facturas', formData)
            alert('Factura registrada correctamente')
            setShowModal(false)
            loadFacturas()
            setFormData({
                numero_factura: '',
                plan: 'Vida',
                periodo_mes: new Date().getMonth() + 1,
                periodo_anio: new Date().getFullYear(),
                monto_total: '',
                fecha_emision: new Date().toISOString().split('T')[0]
            })
        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || error.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaFileInvoiceDollar /> Facturas de Primas (Globales)
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                >
                    <FaPlus /> Nueva Factura
                </button>
            </div>

            {loading && <p className="text-center text-gray-500 my-4"><FaSpinner className="animate-spin inline" /> Cargando...</p>}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factura #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Emisión</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {facturas.map(f => (
                            <tr key={f.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{f.numero_factura}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.plan}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.periodo_mes} / {f.periodo_anio}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">${f.monto_total}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{new Date(f.fecha_emision).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {facturas.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No hay facturas registradas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Registrar Factura Mensual</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Número Factura</label>
                                <input type="text" required className="w-full border p-2 rounded"
                                    value={formData.numero_factura}
                                    onChange={e => setFormData({ ...formData, numero_factura: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Mes</label>
                                    <input type="number" min="1" max="12" required className="w-full border p-2 rounded"
                                        value={formData.periodo_mes}
                                        onChange={e => setFormData({ ...formData, periodo_mes: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Año</label>
                                    <input type="number" min="2020" required className="w-full border p-2 rounded"
                                        value={formData.periodo_anio}
                                        onChange={e => setFormData({ ...formData, periodo_anio: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Monto Total ($)</label>
                                <input type="number" step="0.01" required className="w-full border p-2 rounded"
                                    value={formData.monto_total}
                                    onChange={e => setFormData({ ...formData, monto_total: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Plan</label>
                                <select className="w-full border p-2 rounded"
                                    value={formData.plan}
                                    onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                                    <option value="Vida">Seguro de Vida</option>
                                    <option value="Accidentes">Accidentes Personales</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
