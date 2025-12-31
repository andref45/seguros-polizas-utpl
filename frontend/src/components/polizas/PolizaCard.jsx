import { FaFileContract, FaDollarSign, FaShieldAlt } from 'react-icons/fa'

export default function PolizaCard({ tipoPoliza, onContratar }) {
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-t-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaFileContract className="text-3xl text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">{tipoPoliza.nombre}</h3>
        </div>
      </div>

      <p className="text-gray-600 mb-6 min-h-12">{tipoPoliza.descripcion}</p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FaDollarSign className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Prima Mensual</span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {formatMoney(tipoPoliza.prima_mensual)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">Cobertura Máxima</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {formatMoney(tipoPoliza.cobertura_maxima)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Coaseguro</span>
          </div>
          <span className="text-lg font-bold text-purple-600">
            {tipoPoliza.porcentaje_coaseguro}%
          </span>
        </div>
      </div>

      <button
        onClick={() => onContratar(tipoPoliza)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Contratar Póliza
      </button>
    </div>
  )
}
