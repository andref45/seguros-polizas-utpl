import { useState, useEffect } from 'react'
import api from '../services/api'
<<<<<<< HEAD
import { FaPlus, FaList, FaFilePdf, FaExclamationCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa'

export default function SiniestrosPage() {
  const [activeTab, setActiveTab] = useState('reportar') // 'reportar', 'historial'
  const [polizas, setPolizas] = useState([])
  const [siniestros, setSiniestros] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    poliza_id: '',
    cedula_fallecido: '',
    fecha_defuncion: '',
    causa: '',
    nombre_declarante: '',
    cedula_declarante: '',
    caso_comercial: false
  })
  const [archivo, setArchivo] = useState(null)

  useEffect(() => {
    loadPolizas()
    if (activeTab === 'historial') {
      loadSiniestros()
    }
  }, [activeTab])

  const loadPolizas = async () => {
    try {
      const response = await api.get('/polizas/mis-polizas')
      setPolizas(response.data.data || [])
    } catch (err) {
      console.error('Error cargando pólizas:', err)
      setError('No se pudieron cargar tus pólizas.')
    }
  }

  const loadSiniestros = async () => {
    try {
      setLoading(true)
      const response = await api.get('/siniestros/mis-siniestros')
      setSiniestros(response.data.data || [])
    } catch (err) {
      console.error('Error cargando siniestros:', err)
=======
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
>>>>>>> dev-JeanVillav
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF')
      e.target.value = ''
      setArchivo(null)
      return
    }
    setArchivo(file)
=======
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
>>>>>>> dev-JeanVillav
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
<<<<<<< HEAD
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!archivo) {
        throw new Error('Debe adjuntar la evidencia (PDF)')
      }

      // 1. Registrar Aviso
      const avisoResponse = await api.post('/siniestros/aviso', {
        ...formData,
        // Convert case_comercial logic if needed, backend expects boolean
      })

      const siniestroId = avisoResponse.data.data.id

      // 2. Subir Documento
      const uploadData = new FormData()
      uploadData.append('file', archivo)
      uploadData.append('tipo', 'Evidencia Inicial')

      await api.post(`/siniestros/${siniestroId}/docs`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess('Siniestro reportado y documentos subidos exitosamente.')
      setFormData({
        poliza_id: '',
        cedula_fallecido: '',
        fecha_defuncion: '',
        causa: '',
        nombre_declarante: '',
        cedula_declarante: '',
        caso_comercial: false
      })
      setArchivo(null)
      // Switch to history to show it
      setTimeout(() => setActiveTab('historial'), 1500)

    } catch (err) {
      console.error('Error reportando siniestro:', err)
      const msg = err.response?.data?.error || err.message
      setError('Error: ' + msg)
=======
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
>>>>>>> dev-JeanVillav
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Siniestros</h1>
        <p className="text-gray-600">Reporta y sigue el estado de tus reclamaciones</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === 'reportar'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('reportar')}
        >
          <FaPlus /> Reportar Siniestro
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === 'historial'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('historial')}
        >
          <FaList /> Mis Reportes
        </button>
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded flex items-center gap-2">
            <FaExclamationCircle /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded flex items-center gap-2">
            <FaCheckCircle /> {success}
          </div>
        )}

        {/* Tab: Reportar */}
        {activeTab === 'reportar' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Póliza */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccione Póliza Afectada
                </label>
                <select
                  name="poliza_id"
                  value={formData.poliza_id}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                  <option value="">-- Seleccione una póliza --</option>
                  {polizas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.numero_poliza} - Imp. ${p.prima_mensual} - {p.estado}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Solo pólizas activas y al día pueden reportar siniestros.</p>
              </div>

              {/* Datos Fallecido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula Fallecido</label>
                <input
                  type="text"
                  name="cedula_fallecido"
                  value={formData.cedula_fallecido}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border-gray-300 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Defunción</label>
                <input
                  type="date"
                  name="fecha_defuncion"
                  value={formData.fecha_defuncion}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border-gray-300 p-2 border"
                />
              </div>

              {/* Causa */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Causa de Muerte</label>
                <input
                  type="text"
                  name="causa"
                  value={formData.causa}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej. Accidente de tránsito, Enfermedad natural..."
                  className="w-full rounded-md border-gray-300 p-2 border"
                />
              </div>

              {/* Declarante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Declarante</label>
                <input
                  type="text"
                  name="nombre_declarante"
                  value={formData.nombre_declarante}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border-gray-300 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula Declarante</label>
                <input
                  type="text"
                  name="cedula_declarante"
                  value={formData.cedula_declarante}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border-gray-300 p-2 border"
                />
              </div>

              {/* Evidence File */}
              <div className="col-span-2 border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaFilePdf className="inline mr-1 text-red-500" /> Adjuntar Evidencia (Acta de Defunción / Informe Médico)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Formato PDF obligatorio. Máx 5MB.</p>
              </div>

            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? <span className="flex items-center gap-2"><FaSpinner className="animate-spin" /> Procesando...</span> : 'Registrar Siniestro'}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Historial */}
        {activeTab === 'historial' && (
          <div>
            {loading ? (
              <div className="text-center py-10">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
                <p className="mt-2 text-gray-500">Cargando reclamaciones...</p>
              </div>
            ) : siniestros.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No tienes siniestros registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Reporte</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Causa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {siniestros.map(siniestro => (
                      <tr key={siniestro.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(siniestro.fecha_reporte).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {siniestro.causa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${siniestro.estado === 'Reportado' ? 'bg-yellow-100 text-yellow-800' :
                              siniestro.estado === 'Aprobado' || siniestro.estado === 'Pagado' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'}`}>
                            {siniestro.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {siniestro.documentos && siniestro.documentos.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {siniestro.documentos.map((doc, idx) => (
                                <a
                                  key={idx}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                >
                                  <FaFilePdf /> Evidencia {idx + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">Sin documentos</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
=======
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
>>>>>>> dev-JeanVillav
    </div>
  )
}
