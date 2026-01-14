import { useState, useEffect } from 'react'
import { FaExclamationTriangle, FaPlus, FaFileUpload, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'
import SiniestrosService from '../services/siniestros.service'
import api from '../services/api'

export default function SiniestrosPage() {
  // Gestión de siniestros actualizada
  const [siniestros, setSiniestros] = useState([])
  const [polizas, setPolizas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [uploadingSiniestroId, setUploadingSiniestroId] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    poliza_id: '',
    cedula_fallecido: '',
    fecha_defuncion: '',
    causa: '',
    nombre_declarante: '',
    cedula_declarante: '',
    caso_comercial: false
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [siniestrosRes, polizasRes] = await Promise.all([
        SiniestrosService.getMisSiniestros(),
        api.get('/polizas/mis-polizas')
      ])

      setSiniestros(siniestrosRes.data || [])
      setPolizas(polizasRes.data.data || [])
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar los datos')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.poliza_id || !formData.cedula_fallecido || !formData.fecha_defuncion) {
      setError('Todos los campos obligatorios deben ser completados')
      return
    }

    try {
      const result = await SiniestrosService.registrarAviso(formData)

      if (result.success) {
        alert('Siniestro registrado exitosamente. Ahora puede subir los documentos requeridos.')
        setShowForm(false)
        setFormData({
          poliza_id: '',
          cedula_fallecido: '',
          fecha_defuncion: '',
          causa: '',
          nombre_declarante: '',
          cedula_declarante: '',
          caso_comercial: false
        })
        cargarDatos()
      }
    } catch (err) {
      console.error('Error registrando siniestro:', err)
      const errorMsg = err.response?.data?.error || 'Error al registrar el siniestro'

      // Manejar errores específicos
      if (err.response?.data?.code === 'VIGENCIA_CERRADA') {
        setError(`${errorMsg}. Marque la casilla de "Caso Comercial" si tiene autorización.`)
      } else if (err.response?.data?.code === 'BLOQUEO_MOROSIDAD') {
        setError(errorMsg)
      } else {
        setError(errorMsg)
      }
    }
  }

  const handleFileUpload = async (siniestroId, event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe superar los 5MB')
      return
    }

    setUploadingSiniestroId(siniestroId)
    setError('')

    try {
      const result = await SiniestrosService.subirDocumento(siniestroId, file, 'Evidencia General')

      if (result.success) {
        const hashPreview = result.data.hash.substring(0, 16)
        alert(`✅ Documento subido y verificado correctamente\n\nHash SHA-256: ${hashPreview}...\n\nEl documento ha sido registrado en el sistema.`)
        // Recargar datos para actualizar contador
        await cargarDatos()
      }
    } catch (err) {
      console.error('Error subiendo documento:', err)
      setError(err.response?.data?.error || 'Error al subir el documento')
    } finally {
      setUploadingSiniestroId(null)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      'Reportado': { icon: FaClock, color: 'bg-yellow-100 text-yellow-800', text: 'Reportado' },
      'En_tramite': { icon: FaClock, color: 'bg-blue-100 text-blue-800', text: 'En Trámite' },
      'Pagado': { icon: FaCheckCircle, color: 'bg-green-100 text-green-800', text: 'Pagado' }
    }

    const badge = badges[estado] || badges['Reportado']
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="text-xs" />
        {badge.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando siniestros...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siniestros</h1>
          <p className="text-gray-600 mt-1">Gestiona tus reclamaciones de siniestros</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaPlus />
          Registrar Siniestro
        </button>
      </div>

      {/* Error global */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start gap-2">
            <FaTimesCircle className="mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Formulario de registro */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Registrar Nuevo Siniestro</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Póliza */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Póliza <span className="text-red-500">*</span>
                </label>
                <select
                  name="poliza_id"
                  value={formData.poliza_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione una póliza</option>
                  {polizas.filter(p => p.estado === 'activa').map(poliza => (
                    <option key={poliza.id} value={poliza.id}>
                      {poliza.numero_poliza} - {poliza.tipos_poliza?.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cédula del fallecido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula del Fallecido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cedula_fallecido"
                  value={formData.cedula_fallecido}
                  onChange={handleInputChange}
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                  placeholder="1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Fecha de defunción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Defunción <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_defuncion"
                  value={formData.fecha_defuncion}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Causa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Causa
                </label>
                <input
                  type="text"
                  name="causa"
                  value={formData.causa}
                  onChange={handleInputChange}
                  placeholder="Ej: Enfermedad, Accidente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Nombre del declarante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Declarante
                </label>
                <input
                  type="text"
                  name="nombre_declarante"
                  value={formData.nombre_declarante}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Cédula del declarante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula del Declarante
                </label>
                <input
                  type="text"
                  name="cedula_declarante"
                  value={formData.cedula_declarante}
                  onChange={handleInputChange}
                  maxLength="10"
                  pattern="[0-9]{10}"
                  placeholder="1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Caso comercial */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="caso_comercial"
                name="caso_comercial"
                checked={formData.caso_comercial}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="caso_comercial" className="text-sm text-gray-700">
                Caso Comercial (Vigencia cerrada con autorización especial)
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Registrar Siniestro
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setError('')
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="font-bold text-gray-900 mb-2">¿Qué es un Siniestro?</h3>
          <p className="text-gray-600 text-sm">
            Un siniestro es un evento cubierto por tu póliza que genera una reclamación al seguro.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="font-bold text-gray-900 mb-2">Coaseguro (20%)</h3>
          <p className="text-gray-600 text-sm">
            El asegurado paga el 20% del monto del siniestro. El seguro cubre el 80% restante.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="font-bold text-gray-900 mb-2">Proceso de Reclamación</h3>
          <p className="text-gray-600 text-sm">
            Registra el siniestro, adjunta documentación PDF, espera aprobación y recibe el pago.
          </p>
        </div>
      </div>

      {/* Lista de siniestros */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Mis Siniestros</h2>
        </div>

        {siniestros.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaExclamationTriangle className="mx-auto text-4xl mb-3 text-gray-400" />
            <p>No tienes siniestros registrados</p>
            <p className="text-sm mt-1">Haz clic en "Registrar Siniestro" para comenzar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {siniestros.map((siniestro) => (
              <div key={siniestro.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      Siniestro #{siniestro.numero_siniestro || siniestro.id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Reportado: {new Date(siniestro.fecha_reporte).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                  {getEstadoBadge(siniestro.estado)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Cédula Fallecido:</span>
                    <span className="ml-2 font-medium">{siniestro.cedula_fallecido}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha Siniestro:</span>
                    <span className="ml-2 font-medium">
                      {new Date(siniestro.fecha_siniestro).toLocaleDateString('es-EC')}
                    </span>
                  </div>
                  {siniestro.causa && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Causa:</span>
                      <span className="ml-2 font-medium">{siniestro.causa}</span>
                    </div>
                  )}
                  {siniestro.descripcion && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Descripción:</span>
                      <span className="ml-2 font-medium">{siniestro.descripcion}</span>
                    </div>
                  )}
                </div>

                {/* Documentos */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Documentos: {siniestro.documentos?.length || 0}
                    </span>
                    {siniestro.estado === 'Reportado' && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFileUpload(siniestro.id, e)}
                          className="hidden"
                          disabled={uploadingSiniestroId === siniestro.id}
                        />
                        <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition text-sm font-medium">
                          {uploadingSiniestroId === siniestro.id ? (
                            <>Subiendo...</>
                          ) : (
                            <>
                              <FaFileUpload />
                              Subir PDF
                            </>
                          )}
                        </span>
                      </label>
                    )}
                  </div>

                  {siniestro.documentos && siniestro.documentos.length > 0 && (
                    <div className="space-y-2">
                      {siniestro.documentos.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                          <FaCheckCircle className="text-green-600" />
                          <span className="flex-1">{doc.tipo}</span>
                          <span className="text-xs text-gray-500">
                            Hash: {doc.hash?.substring(0, 16)}...
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {siniestro.estado === 'Reportado' && (!siniestro.documentos || siniestro.documentos.length === 0) && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      ⚠️ Debe subir al menos un documento PDF para que el siniestro pase a trámite
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
