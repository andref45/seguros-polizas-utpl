import { useState } from 'react'
import api from '../../services/api'
import { FaSave, FaTimes } from 'react-icons/fa'

export default function EditarPolizaModal({ poliza, onClose, onUpdated }) {
    const [formData, setFormData] = useState({
        estado: poliza.estado,
        prima_mensual: poliza.prima_mensual,
        fecha_fin: poliza.fecha_fin
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.put(`/polizas/${poliza.id}`, formData)
            alert('Póliza actualizada')
            onUpdated()
            onClose()
        } catch (error) {
            alert('Error al actualizar póliza')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Editar Póliza #{poliza.numero_poliza}</h3>
                    <button onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Estado</label>
                        <select
                            value={formData.estado}
                            onChange={e => setFormData({ ...formData, estado: e.target.value })}
                            className="w-full border p-2 rounded"
                        >
                            <option value="Activa">Activa</option>
                            <option value="Cancelada">Cancelada</option>
                            <option value="Vencida">Vencida</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700">Prima Mensual ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.prima_mensual}
                            onChange={e => setFormData({ ...formData, prima_mensual: e.target.value })}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700">Fecha Fin Vigencia</label>
                        <input
                            type="date"
                            value={formData.fecha_fin}
                            onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                            <FaSave /> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
