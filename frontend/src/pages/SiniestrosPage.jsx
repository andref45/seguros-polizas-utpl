import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../store/AuthContext'
import { FaPlus, FaList, FaFilePdf, FaExclamationCircle, FaCheckCircle, FaSpinner, FaShieldAlt, FaFileUpload } from 'react-icons/fa'

export default function SiniestrosPage() {
  const { user } = useAuth()
  const isAdmin = user?.email === 'nancy@segurosutpl.edu.ec' || user?.role === 'admin'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'gestionar' : 'reportar') // 'reportar', 'historial', 'gestionar'
  const [polizas, setPolizas] = useState([])
  const [siniestros, setSiniestros] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('') // [NEW] Search state
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
    if (activeTab === 'reportar') {
      loadPolizas()
    } else if (activeTab === 'historial') {
      loadSiniestros()
    } else if (activeTab === 'gestionar' && isAdmin) {
      loadAllSiniestros()
    }
  }, [activeTab, isAdmin])

  // Auto-fill Declarante info from logged-in user
  useEffect(() => {
    if (user && !isAdmin) {
      setFormData(prev => ({
        ...prev,
        nombre_declarante: user.nombres && user.apellidos ? `${user.nombres} ${user.apellidos}` : prev.nombre_declarante,
        cedula_declarante: user.cedula || prev.cedula_declarante
      }))
    }
  }, [user, isAdmin])

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
      setError('No se pudieron cargar tus siniestros.')
    } finally {
      setLoading(false)
    }
  }

  const loadAllSiniestros = async () => {
    try {
      setLoading(true)
      const response = await api.get('/siniestros/') // Admin route
      setSiniestros(response.data.data || [])
    } catch (err) {
      console.error('Error cargando gestión siniestros:', err)
      setError('Error cargando todos los siniestros.')
    } finally {
      setLoading(false)
    }
  }

  const handleEstadoChange = async (id, nuevoEstado) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a: ${nuevoEstado}?`)) return
    try {
      setLoading(true)
      await api.put(`/siniestros/${id}/estado`, { estado: nuevoEstado })
      alert('Estado actualizado correctamente')
      loadAllSiniestros() // Reload
    } catch (err) {
      alert('Error actualizando estado: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Siniestros</h1>
        <p className="text-gray-600">Reporta y sigue el estado de tus reclamaciones</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {!isAdmin && (
          <button
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === 'reportar'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('reportar')}
          >
            <FaPlus /> Reportar Siniestro
          </button>
        )}
        <button
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === 'historial'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('historial')}
        >
          <FaList /> {isAdmin ? 'Todos los Reportes (Historial)' : 'Mis Reportes'}
        </button>
        {isAdmin && (
          <button
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === 'gestionar'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('gestionar')}
          >
            <FaShieldAlt /> Gestionar Reclamaciones
          </button>
        )}
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

              {/* Póliza (Hidden Internal Logic) */}
              <input type="hidden" name="poliza_id" value={formData.poliza_id} />

              {/* Datos Fallecido + Verificación */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula Fallecido</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="cedula_fallecido"
                    value={formData.cedula_fallecido}
                    onChange={(e) => {
                      handleInputChange(e)
                      // Reset verification on change
                      if (formData.poliza_id) {
                        setFormData(prev => ({ ...prev, poliza_id: '' }))
                        // We could also reset a 'verified' state here if we had one separate
                      }
                    }}
                    required
                    className="flex-1 rounded-md border-gray-300 p-2 border"
                    placeholder="Ingrese cédula para verificar"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const cedula = formData.cedula_fallecido
                      if (!cedula) return alert('Ingrese la cédula del fallecido')
                      try {
                        setLoading(true)
                        const res = await api.get(`/polizas/buscar?cedula=${cedula}`)
                        const encontradas = res.data.data
                        if (encontradas && encontradas.length > 0) {
                          // Auto-select first policy securely (Blind)
                          setFormData(prev => ({ ...prev, poliza_id: encontradas[0].id }))
                          alert('✅ Cobertura Confirmada: El usuario tiene pólizas vigentes.')
                        } else {
                          setFormData(prev => ({ ...prev, poliza_id: '' }))
                          alert('❌ No se encontraron pólizas activas para esta cédula.')
                        }
                      } catch (err) {
                        alert('Error verificando: ' + (err.response?.data?.error || err.message))
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors
                      ${formData.poliza_id ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {formData.poliza_id ? <FaCheckCircle /> : <FaShieldAlt />}
                  </button>
                </div>
                {formData.poliza_id ? (
                  <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                    <FaCheckCircle /> Cobertura Vigente Identificada
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Debe verificar la cobertura antes de continuar.
                  </p>
                )}
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

              {/* Declarante (Auto-filled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Declarante</label>
                <input
                  type="text"
                  name="nombre_declarante"
                  value={formData.nombre_declarante}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="w-full rounded-md border-gray-300 p-2 border bg-gray-100 text-gray-600 cursor-not-allowed"
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
                  readOnly
                  className="w-full rounded-md border-gray-300 p-2 border bg-gray-100 text-gray-600 cursor-not-allowed"
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

        {/* Tab: Gestionar (Admin) */}
        {activeTab === 'gestionar' && isAdmin && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-lg font-semibold text-gray-800">Bandeja de Entrada de Siniestros</h2>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por cédula, nombre o ID..."
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={loadAllSiniestros} className="text-sm text-blue-600 hover:underline shrink-0">Refrescar</button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
                <p className="mt-2 text-gray-500">Cargando todos los siniestros...</p>
              </div>
            ) : siniestros.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No hay siniestros reportados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Fecha / ID</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Declarante</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Fallecido / Causa</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Evidencia</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {siniestros
                      .filter(s => {
                        const term = searchTerm.toLowerCase()
                        const declaranteName = `${s.polizas?.usuarios?.nombres || ''} ${s.polizas?.usuarios?.apellidos || ''}`.toLowerCase()
                        const declaranteCedula = s.polizas?.usuarios?.cedula || ''
                        const fallecidoCedula = s.cedula_fallecido || ''
                        const siniestroId = s.numero_siniestro?.toLowerCase() || ''

                        return declaranteName.includes(term) ||
                          declaranteCedula.includes(term) ||
                          fallecidoCedula.includes(term) ||
                          siniestroId.includes(term)
                      })
                      .map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {new Date(s.fecha_reporte).toLocaleDateString()}<br />
                            <span className="text-xs text-gray-500">{s.numero_siniestro || 'S/N'}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <p className="font-medium">
                              {s.polizas?.usuarios?.nombres} {s.polizas?.usuarios?.apellidos}
                            </p>
                            <p className="text-xs text-gray-500">CI: {s.polizas?.usuarios?.cedula}</p>
                            <p className="text-xs font-semibold text-blue-700">Cel: {s.polizas?.usuarios?.telefono || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{s.polizas?.usuarios?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <p>Muerte: {new Date(s.fecha_defuncion).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500 italic">{s.causa}</p>
                            <p className="text-xs font-bold text-gray-700">CI Fall: {s.cedula_fallecido}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${s.estado === 'Reportado' ? 'bg-blue-100 text-blue-800' :
                                s.estado === 'En_tramite' ? 'bg-yellow-100 text-yellow-800' :
                                  s.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'}`}>
                              {s.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {s.documentos?.length > 0 ? (
                              s.documentos.map((d, i) => (
                                <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline block text-xs mb-1">
                                  <FaFilePdf className="inline" /> Ver PDF
                                </a>
                              ))
                            ) : <span className="text-gray-400 text-xs">Pendiente</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                            {s.estado === 'Reportado' && (
                              <>
                                <button
                                  onClick={() => handleEstadoChange(s.id, 'En_tramite')}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  Tramitar
                                </button>
                              </>
                            )}
                            {s.estado === 'En_tramite' && (
                              <>
                                <button
                                  onClick={() => handleEstadoChange(s.id, 'Aprobado')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                >
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleEstadoChange(s.id, 'Rechazado')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                >
                                  Rechazar
                                </button>
                              </>
                            )}
                            {s.estado === 'Aprobado' && (
                              <span className="text-green-600 text-xs font-bold"><FaCheckCircle className="inline" /> Finalizado</span>
                            )}
                            <button
                              onClick={async () => {
                                if (!confirm('¿Estás seguro de ELIMINAR este siniestro? Esta acción es irreversible.')) return
                                try {
                                  await api.delete(`/siniestros/${s.id}`)
                                  alert('Siniestro eliminado')
                                  loadAllSiniestros()
                                } catch (e) {
                                  alert('Error al eliminar')
                                }
                              }}
                              className="bg-gray-200 hover:bg-red-600 hover:text-white text-gray-700 px-2 py-1 rounded text-xs ml-2"
                              title="Eliminar Siniestro (Admin)"
                            >
                              Eliminar
                            </button>
                            {s.estado === 'Aprobado' && (
                              <span className="text-green-600 text-xs font-bold"><FaCheckCircle className="inline" /> Finalizado</span>
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
    </div >
  )
}
