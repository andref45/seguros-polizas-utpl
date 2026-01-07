import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../store/AuthContext'

export default function PagoForm({ onSuccess }) {
  const { user } = useAuth()
  const [polizas, setPolizas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    poliza_id: '',
    monto: '',
    mes_periodo: new Date().getMonth() + 1,
    anio_periodo: new Date().getFullYear()
  })

  useEffect(() => {
    loadPolizasActivas()
  }, [user])

  const loadPolizasActivas = async () => {
    try {
      // Usamos el endpoint de mis-polizas y filtramos en cliente o usamos un endpoint específico
      // Por simplicidad, reusamos /polizas/mis-polizas y filtramos activas
      const response = await api.get('/polizas/mis-polizas')
      const polizasData = response.data.data || []
      const activas = polizasData.filter(p => p.estado === 'activa')
      setPolizas(activas)
    } catch (err) {
      console.error('Error loading polizas:', err)
      setError('Error al cargar pólizas')
    }
  }

  const handlePolizaChange = (e) => {
    const polizaId = e.target.value
    const poliza = polizas.find(p => p.id === polizaId)

    setFormData({
      ...formData,
      poliza_id: polizaId,
      monto: poliza ? poliza.prima_mensual : ''
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/pagos/registrar', {
        poliza_id: formData.poliza_id,
        monto: formData.monto,
        mes_periodo: formData.mes_periodo,
        anio_periodo: formData.anio_periodo
      })

      setFormData({
        poliza_id: '',
        monto: '',
        mes_periodo: new Date().getMonth() + 1,
        anio_periodo: new Date().getFullYear()
      })

      if (onSuccess) {
        onSuccess()
      }
      alert('Pago registrado correctamente')
    } catch (err) {
      console.error('Error registrando pago:', err)
      const msg = err.response?.data?.error || err.message
      setError(msg || 'Error al registrar pago')
    } finally {
      setLoading(false)
    }
  }

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrar Pago</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="poliza_id" className="block text-sm font-medium text-gray-700 mb-2">
            Póliza
          </label>
          <select
            id="poliza_id"
            name="poliza_id"
            value={formData.poliza_id}
            onChange={handlePolizaChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
          >
            <option value="">Selecciona una póliza</option>
            {polizas.map((poliza) => (
              <option key={poliza.id} value={poliza.id}>
                {poliza.numero_poliza} - {poliza.tipos_poliza?.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="mes_periodo" className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <select
              id="mes_periodo"
              name="mes_periodo"
              value={formData.mes_periodo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            >
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="anio_periodo" className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <input
              id="anio_periodo"
              name="anio_periodo"
              type="number"
              value={formData.anio_periodo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="2020"
              max="2030"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
            Monto
          </label>
          <input
            id="monto"
            name="monto"
            type="number"
            step="0.01"
            value={formData.monto}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            required
            disabled={loading}
            readOnly={formData.poliza_id !== ''}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.poliza_id}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registrando...' : 'Registrar Pago'}
        </button>
      </div>
    </form>
  )
}
