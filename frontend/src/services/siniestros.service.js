import api from './api'

const SiniestrosService = {
  // Obtener mis siniestros
  async getMisSiniestros() {
    const response = await api.get('/siniestros/mis-siniestros')
    return response.data
  },

  // Registrar aviso de siniestro
  async registrarAviso(data) {
    const response = await api.post('/siniestros/aviso', data)
    return response.data
  },

  // Subir documento (PDF)
  async subirDocumento(siniestroId, file, tipo) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tipo', tipo)

    const response = await api.post(`/siniestros/${siniestroId}/docs`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Actualizar estado (solo admin)
  async actualizarEstado(siniestroId, estado) {
    const response = await api.patch(`/siniestros/${siniestroId}`, { estado })
    return response.data
  }
}

export default SiniestrosService
