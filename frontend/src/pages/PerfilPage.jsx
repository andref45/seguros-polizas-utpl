import { useState, useEffect } from 'react'
import { useAuth } from '../store/AuthContext'
import { supabase } from '../services/supabaseClient'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaBirthdayCake, FaEdit, FaSave, FaTimes } from 'react-icons/fa'

export default function PerfilPage() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: ''
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setPerfil(data)
      setFormData({
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        fecha_nacimiento: data.fecha_nacimiento || ''
      })
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          direccion: formData.direccion,
          fecha_nacimiento: formData.fecha_nacimiento
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess('Perfil actualizado exitosamente')
      setEditing(false)
      await loadProfile()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setError('')
    setSuccess('')
    if (perfil) {
      setFormData({
        nombres: perfil.nombres || '',
        apellidos: perfil.apellidos || '',
        telefono: perfil.telefono || '',
        direccion: perfil.direccion || '',
        fecha_nacimiento: perfil.fecha_nacimiento || ''
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaEdit />
            Editar Perfil
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Nombres
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBirthdayCake className="inline mr-2" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <FaSave />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                <FaTimes />
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <FaIdCard className="inline mr-2" />
                  Cédula
                </p>
                <p className="text-lg font-medium text-gray-900">{perfil?.cedula || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <FaEnvelope className="inline mr-2" />
                  Email
                </p>
                <p className="text-lg font-medium text-gray-900">{perfil?.email || user?.email || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <FaUser className="inline mr-2" />
                  Nombres
                </p>
                <p className="text-lg font-medium text-gray-900">{perfil?.nombres || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <FaUser className="inline mr-2" />
                  Apellidos
                </p>
                <p className="text-lg font-medium text-gray-900">{perfil?.apellidos || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <FaPhone className="inline mr-2" />
                  Teléfono
                </p>
                <p className="text-lg font-medium text-gray-900">{perfil?.telefono || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <FaBirthdayCake className="inline mr-2" />
                  Fecha de Nacimiento
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {perfil?.fecha_nacimiento ? new Date(perfil.fecha_nacimiento).toLocaleDateString('es-EC') : 'N/A'}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Dirección
                </p>
                <p className="text-lg font-medium text-gray-900">{perfil?.direccion || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
