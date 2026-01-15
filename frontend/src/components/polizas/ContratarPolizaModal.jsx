import { useState } from 'react'
import { FaTimes, FaFileContract, FaDollarSign, FaShieldAlt, FaCalendar } from 'react-icons/fa'

export default function ContratarPolizaModal({ tipoPoliza, onClose, onConfirm, users = [], isAdmin = false }) { // [NEW] added props
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('') // [NEW]

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calcularFechaFin = () => {
    const fechaFin = new Date()
    fechaFin.setFullYear(fechaFin.getFullYear() + 1)
    return fechaFin.toLocaleDateString('es-EC')
  }

  const handleConfirm = async () => {
    if (isAdmin && !selectedUserId) {
      alert('Por favor seleccione un usuario para asignar la póliza.')
      return
    }
    setLoading(true)
    await onConfirm(tipoPoliza.id, selectedUserId || null) // Pass selectedUserId
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Contratar Póliza</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            disabled={loading}
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <FaFileContract className="text-xl" />
              {tipoPoliza.nombre}
            </h3>
            <p className="text-blue-800">{tipoPoliza.descripcion}</p>
          </div>

          {/* ADMIN: Select User */}
          {isAdmin && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">Asignar Póliza a Usuario (Admin)</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Seleccione un usuario --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.apellidos} {u.nombres} ({u.cedula}) - {u.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaDollarSign className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Prima Mensual</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatMoney(tipoPoliza.prima_mensual)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaShieldAlt className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Cobertura Máxima</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatMoney(tipoPoliza.cobertura_maxima)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaShieldAlt className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Coaseguro</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {tipoPoliza.porcentaje_coaseguro}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Pagas el {tipoPoliza.porcentaje_coaseguro}% del siniestro
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaCalendar className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Vigencia</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">1 año</p>
              <p className="text-xs text-gray-600 mt-1">
                Hasta: {calcularFechaFin()}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h4 className="font-bold text-yellow-900 mb-2">Términos y Condiciones</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• La póliza tendrá vigencia de 1 año desde la fecha de contratación</li>
              <li>• El pago de la prima es mensual y debe realizarse antes del día 5 de cada mes</li>
              <li>• En caso de siniestro, el asegurado paga el {tipoPoliza.porcentaje_coaseguro}% del monto</li>
              <li>• La cobertura máxima es de {formatMoney(tipoPoliza.cobertura_maxima)}</li>
              <li>• La póliza se puede cancelar en cualquier momento</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Confirmar Contratación'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
