import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import PolizaCard from '../components/polizas/PolizaCard'
import ContratarPolizaModal from '../components/polizas/ContratarPolizaModal'
import { useAuth } from '../store/AuthContext'
import { FaShieldAlt, FaStar, FaGem, FaCrown } from 'react-icons/fa'

export default function PolizasPage() {
  const { user } = useAuth()
  const [tiposPoliza, setTiposPoliza] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPoliza, setSelectedPoliza] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadTiposPoliza()
  }, [])

  const loadTiposPoliza = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/polizas/tipos')
      setTiposPoliza(response.data.data || [])

      // [NEW] If Admin, fetch users for selection
      if (user?.role === 'admin') {
        const usersResponse = await api.get('/auth/users')
        setUsers(usersResponse.data.data || [])
      }
    } catch (err) {
      console.error('Error loading tipos poliza:', err)
      setError('Error al cargar tipos de pólizas. Verifique su conexión.')
    } finally {
      setLoading(false)
    }
  }

  const handleContratar = (tipoPoliza) => {
    setSelectedPoliza(tipoPoliza)
  }

  const handleConfirmContratar = async (tipoPolizaId, targetUserId = null) => {
    try {
      // Llamada al backend para contratar
      await api.post('/polizas/contratar', {
        tipo_poliza_id: tipoPolizaId,
        usuario_id: targetUserId
      })

      setSelectedPoliza(null)
      alert('¡Póliza contratada exitosamente!')
      navigate('/mis-polizas')
    } catch (err) {
      console.error('Error contratando póliza:', err)
      // Display safer error message if available
      const msg = err.response?.data?.error || err.message
      alert('Error al contratar póliza: ' + msg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando tipos de pólizas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tipos de Pólizas</h1>
        <p className="text-gray-600">Explora y contrata nuestras pólizas de seguros</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {tiposPoliza.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <p className="text-yellow-800">No hay tipos de pólizas disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiposPoliza.map((tipoPoliza) => (
            <PolizaCard
              key={tipoPoliza.id}
              tipoPoliza={tipoPoliza}
              onContratar={handleContratar}
            />
          ))}
        </div>
      )}

      {selectedPoliza && (
        <ContratarPolizaModal
          tipoPoliza={selectedPoliza}
          users={users} // [NEW]
          isAdmin={user?.role === 'admin'} // [NEW]
          onClose={() => setSelectedPoliza(null)}
          onConfirm={handleConfirmContratar}
        />
      )}
    </div>
  )
}
