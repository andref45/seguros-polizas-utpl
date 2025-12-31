import { FaExclamationTriangle } from 'react-icons/fa'

export default function SiniestrosPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Siniestros</h1>
        <p className="text-gray-600">Gestiona tus reclamaciones de siniestros</p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-8 rounded-lg">
        <div className="flex items-start gap-4">
          <FaExclamationTriangle className="text-4xl text-yellow-600 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-yellow-900 mb-2">
              Funcionalidad en Desarrollo
            </h2>
            <p className="text-yellow-800 mb-4">
              La gestión de siniestros estará disponible en el Sprint 2 del proyecto.
            </p>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-2">Funcionalidades Próximas:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Registrar nuevos siniestros</li>
                <li>Ver historial de siniestros</li>
                <li>Seguimiento del estado de reclamaciones</li>
                <li>Cálculo automático de coaseguro (20%)</li>
                <li>Documentación de siniestros</li>
                <li>Aprobación y procesamiento de pagos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="font-bold text-gray-900 mb-2">¿Qué es un Siniestro?</h3>
          <p className="text-gray-600 text-sm">
            Un siniestro es un evento cubierto por tu póliza que genera una reclamación al seguro.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="font-bold text-gray-900 mb-2">Coaseguro</h3>
          <p className="text-gray-600 text-sm">
            El asegurado paga el 20% del monto del siniestro. El seguro cubre el 80% restante.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="font-bold text-gray-900 mb-2">Proceso de Reclamación</h3>
          <p className="text-gray-600 text-sm">
            Registra el siniestro, adjunta documentación, espera aprobación y recibe el pago.
          </p>
        </div>
      </div>
    </div>
  )
}
