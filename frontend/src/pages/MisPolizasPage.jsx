import { useState, useEffect } from 'react'
import { useAuth } from '../store/AuthContext'
import api from '../services/api'
import { FaFileContract, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa'

export default function MisPolizasPage() {
  const { user } = useAuth()
  const [polizas, setPolizas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMisPolizas()
  }, [user])

  const loadMisPolizas = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/polizas/mis-polizas')
      // Backend: { success: true, data: [...] }
      const data = response.data.data || []
      setPolizas(data)

    } catch (err) {
      console.error('Error loading polizas:', err)
      setError('Error al cargar tus pólizas. Verifique su conexión.')
    } finally {
      setLoading(false)
    }
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      activa: {
        icon: FaCheckCircle,
        class: 'bg-green-100 text-green-800 border-green-300',
        text: 'Activa'
      },
      vencida: {
        icon: FaExclamationCircle,
        class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        text: 'Vencida'
      },
      cancelada: {
        icon: FaTimesCircle,
        class: 'bg-red-100 text-red-800 border-red-300',
        text: 'Cancelada'
      }
    }

    const badge = badges[estado] || badges.activa
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${badge.class}`}>
        <Icon />
        {badge.text}
      </span>
    )
  }

  const calcularDiasRestantes = (fechaFin) => {
    const hoy = new Date()
    const fin = new Date(fechaFin)
    const diferencia = fin - hoy
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))
    return dias
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando tus pólizas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pólizas</h1>
        <p className="text-gray-600">Administra tus pólizas contratadas</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {polizas.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 p-8 rounded-lg text-center">
          <FaFileContract className="text-6xl text-blue-300 mx-auto mb-4" />
          <p className="text-blue-900 font-medium mb-2">No tienes pólizas contratadas</p>
          <p className="text-blue-700 mb-4">Comienza a proteger tu futuro contratando una póliza</p>
          <a
            href="/polizas"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Ver Tipos de Pólizas
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {polizas.map((poliza) => {
            const diasRestantes = calcularDiasRestantes(poliza.fecha_fin)

            return (
              <div
                key={poliza.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {poliza.tipos_poliza?.nombre || 'Póliza'}
                    </h3>
                    <p className="text-gray-600 text-sm">N° {poliza.numero_poliza}</p>
                  </div>
                  {getEstadoBadge(poliza.estado)}
                </div>

                <p className="text-gray-600 mb-4">
                  {poliza.tipos_poliza?.descripcion || 'Sin descripción'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Prima Mensual</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatMoney(poliza.prima_mensual)}
                    </p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Cobertura Total</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatMoney(poliza.cobertura_total)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      Fecha Inicio
                    </p>
                    <p className="text-sm font-bold text-purple-600">
                      {formatDate(poliza.fecha_inicio)}
                    </p>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      Fecha Fin
                    </p>
                    <p className="text-sm font-bold text-orange-600">
                      {formatDate(poliza.fecha_fin)}
                    </p>
                  </div>
                </div>

                {poliza.estado === 'activa' && (
                  <div className={`p-3 rounded-lg ${diasRestantes > 30 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-sm ${diasRestantes > 30 ? 'text-green-800' : 'text-yellow-800'}`}>
                      {diasRestantes > 0
                        ? `Vence en ${diasRestantes} días`
                        : 'Póliza vencida'}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
