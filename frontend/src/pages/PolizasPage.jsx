import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import PolizaCard from '../components/polizas/PolizaCard'
import ContratarPolizaModal from '../components/polizas/ContratarPolizaModal'
import { useAuth } from '../store/AuthContext'
import { FaShieldAlt, FaStar, FaGem, FaCrown, FaList, FaPlus } from 'react-icons/fa'

export default function PolizasPage() {
  const { user } = useAuth()
  const isAdmin = user?.email === 'nancy@segurosutpl.edu.ec' || user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('catalogo') // 'catalogo', 'gestion'
  const [tiposPoliza, setTiposPoliza] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPoliza, setSelectedPoliza] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadTiposPoliza()
    if (isAdmin) {
      // Default to gestion for admin? Or stick to catalogo?
      // Let's stick to catalogo or whatever user prefers. 
    }
  }, [isAdmin])

  const loadTiposPoliza = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/polizas/tipos')
      setTiposPoliza(response.data.data || [])

      if (isAdmin) {
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
      await api.post('/polizas/contratar', {
        tipo_poliza_id: tipoPolizaId,
        usuario_id: targetUserId
      })

      setSelectedPoliza(null)
      alert('¡Póliza contratada exitosamente!')
      if (!isAdmin) navigate('/mis-polizas')
      // If admin, maybe reload admin table?
      // For now stay here.
    } catch (err) {
      console.error('Error contratando póliza:', err)
      const msg = err.response?.data?.error || err.message
      alert('Error al contratar póliza: ' + msg)
    }
  }

  if (loading && !tiposPoliza.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pólizas y Seguros</h1>
        <p className="text-gray-600">Gestiona y contrata coberturas</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === 'catalogo'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('catalogo')}
        >
          <FaStar /> Catálogo de Pólizas
        </button>
        {isAdmin && (
          <button
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === 'gestion'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('gestion')}
          >
            <FaShieldAlt /> Gestión Total (Admin)
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tab: Catálogo */}
      {activeTab === 'catalogo' && (
        <div>
          {isAdmin && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded border border-blue-100 text-sm">
              <strong>Modo Admin:</strong> Para crear una póliza para un usuario, haga clic en "Contratar" en cualquiera de las opciones abajo y seleccione el usuario en el modal.
            </div>
          )}

          {tiposPoliza.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
              <p className="text-yellow-800">No hay tipos de pólizas disponibles.</p>
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
        </div>
      )}

      {/* Tab: Gestión Admin */}
      {activeTab === 'gestion' && isAdmin && (
        <AdminPolizasTable />
      )}

      {selectedPoliza && (
        <ContratarPolizaModal
          tipoPoliza={selectedPoliza}
          users={users}
          isAdmin={isAdmin}
          onClose={() => setSelectedPoliza(null)}
          onConfirm={handleConfirmContratar}
        />
      )}
    </div>
  )
}

import EditarPolizaModal from '../components/polizas/EditarPolizaModal'

function AdminPolizasTable() {
  const [polizas, setPolizas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPoliza, setEditingPoliza] = useState(null)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const res = await api.get('/polizas')
      setPolizas(res.data.data)
    } catch (e) {
      alert('Error cargando pólizas admin')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar póliza permanentemente?')) return
    try {
      await api.delete(`/polizas/${id}`)
      alert('Póliza eliminada')
      loadAll()
    } catch (e) {
      alert('Error al eliminar')
    }
  }

  if (loading) return <div>Cargando gestión...</div>

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <div className="p-4 bg-blue-50 text-blue-800 text-sm mb-2 rounded">
        <span className="font-bold">Nota:</span> Para crear una nueva póliza, seleccione una tarjeta del catálogo arriba y elija el usuario destino.
      </div>

      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 uppercase text-xs font-bold text-gray-600">
          <tr>
            <th className="px-4 py-3">Póliza ID</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {polizas.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-gray-500">{p.numero_poliza}</td>
              <td className="px-4 py-3">
                <div className="font-bold">{p.usuarios?.nombres} {p.usuarios?.apellidos}</div>
                <div className="text-xs text-gray-400">{p.usuarios?.cedula}</div>
              </td>
              <td className="px-4 py-3">{p.tipos_poliza?.nombre}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs text-white ${p.estado === 'Activa' ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {p.estado}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => setEditingPoliza(p)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 mr-2">
                  Editar
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingPoliza && (
        <EditarPolizaModal
          poliza={editingPoliza}
          onClose={() => setEditingPoliza(null)}
          onUpdated={loadAll}
        />
      )}
    </div>
  )
}
