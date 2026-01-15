import { useState, useEffect } from 'react'
import api from '../services/api'
import { FaPlus, FaHistory, FaFileUpload, FaFilePdf, FaCheck, FaMoneyBillWave, FaTimes } from 'react-icons/fa'
import { useAuth } from '../store/AuthContext'

export default function SiniestrosPage() {
  const { user } = useAuth() // [NEW] Use Auth Context
  const [activeTab, setActiveTab] = useState('list') // 'list' or 'new'
  const [siniestros, setSiniestros] = useState([])
  const [polizas, setPolizas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false) // Nancy Check

  // Form State (Simple)
  const [formData, setFormData] = useState({
    cedula_fallecido: '',
    nombre_declarante: '',
    cedula_declarante: '',
    fecha_defuncion: '',
    causa: '',
    monto_reclamo: '', // Solo informativo/solicitado
    poliza_id: '',
    caso_comercial: false
  })

  // Admin Inputs
  const [adminInputs, setAdminInputs] = useState({})

  // Calculated values (removed as per new form structure)

  useEffect(() => {
    checkRoleAndFetch()
  }, [])

  const checkRoleAndFetch = async () => {
    try {
      setLoading(true)

      // 1. Determine Role and Fetch Data
      if (user?.role === 'admin' || user?.app_metadata?.role === 'admin') {
        try {
          const adminRes = await api.get('/siniestros/todos')
          setSiniestros(adminRes.data.data)
          setIsAdmin(true)
        } catch (e) {
          console.error('Admin Fetch Error:', e)
          // Fallback if admin fetch fails (unlikely if role is correct)
          const userRes = await api.get('/siniestros/mis-siniestros')
          setSiniestros(userRes.data.data)
          setIsAdmin(false)
        }
      } else {
        // Regular User
        const userRes = await api.get('/siniestros/mis-siniestros')
        setSiniestros(userRes.data.data)
        setIsAdmin(false)
      }

      // 2. Fetch Polizas (Common)
      const polizasRes = await api.get('/polizas/mis-polizas')
      setPolizas(polizasRes.data.data)
      if (polizasRes.data.data && polizasRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, poliza_id: polizasRes.data.data[0].id }))
      }

    } catch (err) {
      console.error(err)
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminAction = async (id, action) => {
    try {
      let payload = {}
      if (action === 'approve') {
        payload = { estado: 'En_tramite', monto_autorizado: adminInputs[id]?.autorizado }
      } else if (action === 'pay') {
        payload = { estado: 'Pagado', monto_pagado: adminInputs[id]?.pagado }
      } else if (action === 'reject') {
        payload = { estado: 'Rechazado' }
      }

      await api.patch(`/siniestros/${id}`, payload)
      // Refresh
      const res = await api.get('/siniestros/todos')
      setSiniestros(res.data.data)
      alert(`Acción ${action} ejecutada correctamente`)
    } catch (err) {
      alert(err.response?.data?.error || 'Error al ejecutar acción')
    }
  }

  const handleUpload = async (id, file) => {
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/siniestros/${id}/docs`, form)
      alert('Documento subido correctamente')
      checkRoleAndFetch() // Refresh status/eligibility
    } catch (err) {
      alert(err.response?.data?.error || 'Error al subir documento')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)
      // Remove poliza_id and amount from payload. Backend auto-selects.
      await api.post('/siniestros/aviso', {
        ...formData,
        // Override redundant fields to be safe or remove them from state
        poliza_id: undefined,
        monto_reclamo: undefined
      })
      alert('Siniestro registrado exitosamente. POR FAVOR SUBA LOS DOCUMENTOS REQUERIDOS AHORA.')
      setFormData({
        cedula_fallecido: '',
        fecha_defuncion: '',
        causa: '',
        caso_comercial: false
      })
      checkRoleAndFetch()
      setActiveTab('list')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar siniestro')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      'Reportado': 'bg-yellow-100 text-yellow-800',
      'En_tramite': 'bg-blue-100 text-blue-800',
      'Pagado': 'bg-green-100 text-green-800',
      'Rechazado': 'bg-red-100 text-red-800'
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gestión de Siniestros (Admin Nancy)' : 'Mis Siniestros'}
          </h1>
          <p className="text-gray-500">
            {isAdmin ? 'Bandeja de entrada de reclamaciones' : 'Registra y da seguimiento a tus trámites'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <FaHistory /> {isAdmin ? 'Bandeja' : 'Historial'}
          </button>
          {!isAdmin && (
            <button onClick={() => setActiveTab('new')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'new' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <FaPlus /> Nuevo Siniestro
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 mb-4"><p>{error}</p></div>}

      {activeTab === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID / Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {siniestros.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No hay siniestros registrados</td></tr>
              ) : (
                siniestros.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.numero_siniestro || 'SIN-N/A'}<br />
                      {new Date(s.fecha_reporte).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <p className="font-medium">{s.causa}</p>
                      <p className="text-gray-500 text-xs">Fallecido: {s.cedula_fallecido}</p>
                      {isAdmin && s.polizas?.usuarios && (
                        <p className="text-blue-600 text-xs">Declarante: {s.polizas.usuarios.nombres} {s.polizas.usuarios.apellidos}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(s.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Reclamado: ${s.monto_reclamado}</div>
                      {s.monto_autorizado && <div className="text-blue-600">Aut: ${s.monto_autorizado}</div>}
                      {s.monto_pagado && <div className="text-green-600">Pagado: ${s.monto_pagado}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(s.estado === 'Reportado' || isAdmin) && (!s.documentos || s.documentos.length === 0) && (
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700 flex items-center justify-center gap-1 mb-2">
                          <FaFileUpload /> Subir PDF
                          <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleUpload(s.id, e.target.files[0])} />
                        </label>
                      )}
                      {s.documentos?.length > 0 && (
                        <a href={s.documentos[0].url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900 flex items-center gap-1 mb-2">
                          <FaFilePdf /> Ver PDF
                        </a>
                      )}

                      {/* ADMIN ACTIONS */}
                      {isAdmin && (
                        <div className="flex flex-col gap-2 mt-2 border-t pt-2">
                          {s.estado === 'Reportado' && (
                            <div className="flex gap-1 items-center">
                              <input
                                type="number"
                                className="w-20 p-1 text-xs border rounded"
                                placeholder="$$ Aut"
                                onChange={(e) => setAdminInputs({ ...adminInputs, [s.id]: { ...adminInputs[s.id], autorizado: e.target.value } })}
                              />
                              <button onClick={() => handleAdminAction(s.id, 'approve')} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700" title="Aprobar"><FaCheck /></button>
                              <button onClick={() => handleAdminAction(s.id, 'reject')} className="bg-red-600 text-white p-1 rounded hover:bg-red-700" title="Rechazar"><FaTimes /></button>
                            </div>
                          )}
                          {s.estado === 'En_tramite' && (
                            <div className="flex gap-1 items-center">
                              <input
                                type="number"
                                className="w-20 p-1 text-xs border rounded"
                                placeholder="$$ Pagado"
                                onChange={(e) => setAdminInputs({ ...adminInputs, [s.id]: { ...adminInputs[s.id], pagado: e.target.value } })}
                              />
                              <button onClick={() => handleAdminAction(s.id, 'pay')} className="bg-green-600 text-white p-1 rounded hover:bg-green-700" title="Pagar"><FaMoneyBillWave /></button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* FORMULARIO PÚBLICO (Simplificado) */
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Datos del Siniestro</h3>

            {/* User Info Read-Only */}
            <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200">
              <h4 className="text-sm font-bold text-blue-900 mb-2">Información del Reportante (Usted)</h4>
              <p className="text-sm text-blue-800">
                <strong>Nombre:</strong> {user?.nombres} {user?.apellidos}<br />
                <strong>Cédula:</strong> {user?.cedula || user?.user_metadata?.cedula || 'N/A'}<br />
                <strong>Email:</strong> {user?.email}<br />
                <strong>Teléfono:</strong> {user?.telefono || 'No registrado'}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                * Estos datos se registrarán automáticamente con su reporte.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula Fallecido</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.cedula_fallecido}
                  onChange={e => setFormData({ ...formData, cedula_fallecido: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Defunción</label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.fecha_defuncion}
                  onChange={e => setFormData({ ...formData, fecha_defuncion: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Causa de Fallecimiento</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.causa}
                onChange={e => setFormData({ ...formData, causa: e.target.value })}
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
              <p><strong>Nota Importante:</strong> Al registrar este siniestro, se le solicitará obligatoriamente subir un documento habilitante (Certificado de Defunción, Copia de Cédula, etc.) en el siguiente paso.</p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrar Aviso'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
