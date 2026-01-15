import { useState, useEffect } from 'react'
import api from '../services/api'
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
    </div>
  )
}
