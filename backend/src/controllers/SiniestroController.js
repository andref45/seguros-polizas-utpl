import SiniestroDAO from '../dao/SiniestroDAO.js'
import VigenciaDAO from '../dao/VigenciaDAO.js'
import AccessControlService from '../services/AccessControlService.js'
import supabase from '../config/supabase.config.js'
import crypto from 'crypto'
import logger from '../config/logger.js'



class SiniestroController {

  // Paso 0: Obtener mis siniestros
  static async getMisSiniestros(req, res) {
    try {
      const userId = req.user.id
      const siniestros = await SiniestroDAO.findByUserId(userId)

      res.status(200).json({
        success: true,
        data: siniestros
      })
    } catch (error) {
      logger.error('Error getMisSiniestros', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // Paso 1: Aviso de Siniestro
  static async registrarAviso(req, res) {
    try {
      const { cedula_fallecido, fecha_defuncion, causa, nombre_declarante, cedula_declarante, poliza_id, caso_comercial } = req.body

      // 1. Validaciones Mínimas
      if (!cedula_fallecido || !fecha_defuncion || !poliza_id) {
        return res.status(400).json({ success: false, error: 'Datos incompletos (Cédula fallecido, Fecha, Póliza)' })
      }

      // 2. Guard Clause: Vigencia Activa
      if (!caso_comercial) {
        const vigencia = await VigenciaDAO.findActive()
        if (!vigencia) {
          return res.status(409).json({
            success: false,
            error: 'No se pueden registrar siniestros: Vigencia Cerrada. Solicite autorización para Caso Comercial.',
            code: 'VIGENCIA_CERRADA'
          })
        }
      } else {
        logger.info(`Registro de Siniestro bajo Caso Comercial (Vigencia ignorada) por usuario ${req.user?.id}`)
      }

      // 3. Validación Estricta: Morosidad (RN006)
      const accessCheck = await AccessControlService.checkMorosity(poliza_id)
      if (!accessCheck.allowed) {
        return res.status(409).json({
          success: false,
          error: accessCheck.reason,
          code: 'BLOQUEO_MOROSIDAD'
        })
      }

      // 4. Verificar duplicados (Constraint en DB lo atrapa, pero podemos chequear antes si queremos mensaje custom)
      // Dejamos que DB maneje la constraint UNIQUE(cedula_fallecido, fecha_defuncion)

      const siniestroData = {
        poliza_id,
        cedula_fallecido,
        fecha_defuncion,
        causa,
        descripcion: `Declarado por ${nombre_declarante} (${cedula_declarante})`,
        monto_reclamado: 0, // Se ajusta luego
        estado: 'Reportado',
        fecha_siniestro: fecha_defuncion // Asumiendo misma fecha por ahora
      }

      const siniestro = await SiniestroDAO.create(siniestroData)

      res.status(201).json({
        success: true,
        data: { id: siniestro.id, estado: siniestro.estado },
        message: 'Aviso registrado correctamente. Proceda a subir documentos.'
      })

    } catch (error) {
      logger.error('Error registrarAviso', error)
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ success: false, error: 'Ya existe un siniestro reportado para esta persona y fecha.' })
      }
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // Paso 2: Subida de Documentos
  static async subirDocumento(req, res) {
    const { id } = req.params
    const file = req.file // Multer file

    if (!file) {
      return res.status(400).json({ success: false, error: 'No se ha subido ningún archivo' })
    }

    // Validación PDF-Only
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, error: 'Solo se permiten archivos PDF' })
    }

    try {
      // Calcular SHA-256 Hash
      const hash = crypto.createHash('sha256').update(file.buffer).digest('hex')

      // Subir a Supabase Storage
      const fileName = `case-${id}-${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('pdf-evidencias') // Bucket debe existir
        .upload(fileName, file.buffer, {
          contentType: 'application/pdf',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obtener URL pública (o firmada)
      const { data: { publicUrl } } = supabase
        .storage
        .from('pdf-evidencias')
        .getPublicUrl(fileName)

      // Registrar en DB Documentos
      const docData = {
        siniestro_id: id,
        tipo: req.body.tipo || 'Evidencia General',
        url: publicUrl,
        hash: hash,
        estado_doc: 'Pendiente'
      }

      const documento = await SiniestroDAO.addDocument(docData)

      res.status(201).json({
        success: true,
        data: documento,
        message: 'Documento subido y validado exitosamente'
      })

    } catch (error) {
      logger.error('Error subirDocumento', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // Paso 3: Cambio de Estado (FSM Estricta)
  static async actualizarEstado(req, res) {
    try {
      const { id } = req.params
      const { estado } = req.body

      const validStates = ['Reportado', 'En_tramite', 'Pagado']
      if (!validStates.includes(estado)) {
        return res.status(400).json({ success: false, error: 'Estado inválido' })
      }

      const siniestro = await SiniestroDAO.findById(id)
      if (!siniestro) return res.status(404).json({ status: false, error: 'Siniestro no encontrado' })

      // FSM Logic
      if (estado === 'En_tramite') {
        // Solo si estaba en Reportado
        if (siniestro.estado !== 'Reportado') {
          return res.status(400).json({ success: false, error: `Transición inválida: de ${siniestro.estado} a ${estado}` })
        }

        // Solo si tiene documentos
        if (!siniestro.documentos || siniestro.documentos.length === 0) {
          return res.status(400).json({ success: false, error: 'Bloqueo: Debe subir al menos un documento PDF para tramitar.' })
        }
      }

      const updated = await SiniestroDAO.update(id, { estado })

      res.status(200).json({
        success: true,
        data: updated,
        message: `Estado actualizado a ${estado}`
      })

    } catch (error) {
      logger.error('Error actualizarEstado', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
}

export default SiniestroController
