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

      // Firmar URLs
      for (const s of siniestros) {
        if (s.documentos && s.documentos.length > 0) {
          for (const doc of s.documentos) {
            if (doc.url && !doc.url.startsWith('http')) {
              const { data: signedData } = await supabase
                .storage
                .from('pdf-evidencias')
                .createSignedUrl(doc.url, 3600)
              doc.url = signedData?.signedUrl || null
            }
          }
        }
      }

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
  static async getAllSiniestros(req, res, next) {
    try {
      // Admin only - fetched via middleware
      const { data, error } = await supabase
        .from('siniestros')
        .select(`
          *,
          documentos (*),
          polizas (
            id,
            numero_poliza,
            usuarios (
              id,
              nombres,
              apellidos,
              cedula
            )
          )
        `)
        .order('fecha_reporte', { ascending: false })

      if (error) throw error

      // Firmar URLs de documentos
      for (const s of data) {
        if (s.documentos && s.documentos.length > 0) {
          for (const doc of s.documentos) {
            // Asumimos que si no empieza con http, es un path
            if (doc.url && !doc.url.startsWith('http')) {
              const { data: signedData, error: signError } = await supabase
                .storage
                .from('pdf-evidencias')
                .createSignedUrl(doc.url, 3600) // 1 hora

              if (!signError && signedData?.signedUrl) {
                doc.url = signedData.signedUrl
              }
            }
          }
        }
      }

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  static async registrarAviso(req, res, next) {
    try {
      const { cedula_fallecido, fecha_defuncion, causa, nombre_declarante, cedula_declarante, poliza_id, caso_comercial, monto_reclamo } = req.body

      // 1. Validaciones Mínimas
      if (!cedula_fallecido || !fecha_defuncion || !poliza_id) {
        return res.status(400).json({ success: false, error: 'Datos incompletos (Cédula fallecido, Fecha, Póliza)' })
      }

      // 2. Guard Clause: Vigencia Activa (RN001/002)
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

      // 3. Guard Clause: Morosidad (RN006)
      // Verificar si el usuario está al día en sus pagos
      const poliza = await PolizaDAO.findById(poliza_id)
      if (!poliza) return res.status(404).json({ error: 'Póliza no encontrada' })

      const moroso = await AccessControlService.checkMorosity(poliza.usuario_id)
      if (moroso) {
        return res.status(409).json({
          success: false,
          error: 'No elegible: Usuario presenta deudas pendientes.',
          code: 'USUARIO_MOROSO'
        })
      }

      // 4. Preparar Datos (Sin 80/20)
      const montoReclamado = Number(monto_reclamo) || 0

      const siniestroData = {
        poliza_id,
        cedula_fallecido,
        fecha_defuncion,
        causa,
        descripcion: `Declarado por ${nombre_declarante} (${cedula_declarante})`,
        monto_reclamado: montoReclamado,
        // monto_coaseguro_20: Eliminado
        // monto_cobertura_80: Eliminado
        estado: 'Reportado',
        fecha_siniestro: new Date(), // Fecha de registro del sistema
        source: 'web' // Intake channel
      }

      // 5. Insertar en BD
      const { data, error } = await supabase
        .from('siniestros')
        .insert([siniestroData])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique violation
          return res.status(409).json({ success: false, error: 'Ya existe un siniestro registrado para esta persona y fecha.' })
        }
        throw error
      }

      logger.info({
        action: 'REGISTRAR_SINIESTRO',
        user: req.user?.id || 'public',
        role: req.user?.app_metadata?.role || 'public',
        resource: data.id,
        status: 'SUCCESS'
      })

      res.status(201).json({
        success: true,
        data,
        message: 'Siniestro reportado exitosamente. Por favor suba los documentos habilitantes.'
      })

    } catch (error) {
      next(error)
    }
  }

  // Paso 2: Subida de Documentos
  static async subirDocumento(req, res, next) {
    try {
      const { id } = req.params
      const file = req.file

      if (!file) {
        return res.status(400).json({ success: false, error: 'No se ha proporcionado ningún archivo' })
      }

      // Validación PDF-Only (Reforzada)
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ success: false, error: 'Solo se permiten archivos PDF' })
      }

      // Calcular SHA-256 Hash para integridad/auditoría
      const hash = crypto.createHash('sha256').update(file.buffer).digest('hex')

      // Subir a Supabase Storage
      const fileName = `case-${id}-${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('pdf-evidencias')
        .upload(fileName, file.buffer, {
          contentType: 'application/pdf',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Generar URL Firmada (Signed URL)
      // Nota: Guardamos el path, y generamos la URL al leer, o generamos una temporal larga si el MVP lo permite.
      // Correcto: Guardar el path en la BD.
      // Para este paso, guardaré el path en el campo 'url' para luego firmarlo en el GET.

      const filePath = fileName // `case-${id}-${Date.now()}.pdf`

      // Registrar en tabla documentos (Guardamos PATH en vez de URL pública)
      const { data: docData, error: docError } = await SiniestroDAO.addDocument({
        siniestro_id: id,
        tipo: 'Habilitante',
        url: filePath, // STORE PATH
        hash: hash,
        estado_doc: 'Pendiente'
      })

      if (docError) throw docError

      logger.info({
        action: 'SUBIR_DOCUMENTO',
        user: req.user.id,
        role: req.user.app_metadata?.role,
        resource: id,
        file: fileName,
        status: 'SUCCESS'
      })

      res.status(201).json({
        success: true,
        data: docData,
        message: 'Documento subido correctamente'
      })

    } catch (error) {
      next(error)
    }
  }

  static async actualizarEstado(req, res, next) {
    try {
      const { id } = req.params
      const { estado, monto_autorizado, monto_pagado } = req.body // "Nancy" inputs

      // Validar transición a 'En_tramite' (RN007)
      if (estado === 'En_tramite') {
        // Verificar documentos
        const { count, error } = await supabase
          .from('documentos')
          .select('*', { count: 'exact', head: true })
          .eq('siniestro_id', id)

        if (error) throw error

        if (count === 0) {
          return res.status(400).json({
            success: false,
            error: 'Bloqueo RN007: No se puede pasar a En Trámite sin documentos adjuntos.'
          })
        }
      }

      const updates = { estado }
      if (monto_autorizado !== undefined) updates.monto_autorizado = monto_autorizado
      if (monto_pagado !== undefined) updates.monto_pagado = monto_pagado

      const { data, error } = await supabase
        .from('siniestros')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      logger.info({
        action: 'ACTUALIZAR_ESTADO_SINIESTRO',
        user: req.user.id,
        role: req.user.app_metadata?.role,
        resource: id,
        new_state: estado,
        status: 'SUCCESS'
      })

      res.status(200).json({
        success: true,
        data,
        message: `Estado actualizado a ${estado}`
      })
    } catch (error) {
      next(error)
    }
  }
}

export default SiniestroController
