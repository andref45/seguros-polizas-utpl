import { useState, useEffect } from 'react'
import { useAuth } from '../store/AuthContext'
import api from '../services/api'
import PagoForm from '../components/pagos/PagoForm'
import PagosTable from '../components/pagos/PagosTable'
import { FaMoneyBillWave, FaChartLine, FaHistory, FaCalendarCheck } from 'react-icons/fa'

export default function PagosPage() {
  const { user } = useAuth()
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalPagado: 0,
    pagosPendientes: 0,
    ultimoPago: null
  })

  useEffect(() => {
    loadPagos()
  }, [user])

  const loadPagos = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/pagos/mis-pagos')
      // Backend: { success: true, data: [...] }
      const data = response.data.data || []

      setPagos(data)

      // Calcular estadísticas
      const totalPagado = data
        ?.filter(p => p.estado === 'pagado')
        .reduce((sum, pago) => sum + Number(pago.monto || 0), 0) || 0

      const pagosPendientes = data?.filter(p => p.estado === 'pendiente').length || 0

      const ultimoPago = data?.find(p => p.estado === 'pagado') || null

      setStats({
        totalPagado,
        pagosPendientes,
        ultimoPago
      })
    } catch (err) {
      console.error('Error loading pagos:', err)
      setError('Error al cargar pagos. Verifique su conexión.')
    } finally {
      setLoading(false)
    }
  }

  const handlePagoSuccess = () => {
    loadPagos()
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagos</h1>
        <p className="text-gray-600">Gestiona los pagos de tus pólizas</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Pagado</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatMoney(stats.totalPagado)}
              </p>
            </div>
            <FaMoneyBillWave className="text-4xl text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pagos Pendientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pagosPendientes}
              </p>
            </div>
            <FaChartLine className="text-4xl text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Último Pago</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {stats.ultimoPago ? formatMoney(stats.ultimoPago.monto) : 'N/A'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {stats.ultimoPago ? formatDate(stats.ultimoPago.fecha_pago) : ''}
              </p>
            </div>
            <FaMoneyBillWave className="text-4xl text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PagoForm onSuccess={handlePagoSuccess} />
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Historial de Pagos</h2>
            <PagosTable pagos={pagos} />
          </div>
        </div>
      </div>
    </div>
  )
}
