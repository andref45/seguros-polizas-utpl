import SiniestroDAO from '../dao/SiniestroDAO.js'
import VigenciaDAO from '../dao/VigenciaDAO.js'
import AccessControlService from '../services/AccessControlService.js'
import supabase from '../config/supabase.config.js'
import crypto from 'crypto'
import BusinessRules from './BusinessRules.js'

class SiniestroService {
    static async getMisSiniestros(userId) {
        return await SiniestroDAO.findByUserId(userId)
    }

    static async registrarAviso(userId, avisoData) {
        const { cedula_fallecido, fecha_defuncion, causa, nombre_declarante, cedula_declarante, poliza_id, caso_comercial } = avisoData

        // 1. Validaciones Mínimas
        if (!cedula_fallecido || !fecha_defuncion || !poliza_id) {
            throw new Error('Datos incompletos (Cédula fallecido, Fecha, Póliza)')
        }

        // 2. Guard Clause: Vigencia Activa
        if (!caso_comercial) {
            const vigencia = await VigenciaDAO.findActive()
            if (!vigencia) {
                throw new Error('No se pueden registrar siniestros: Vigencia Cerrada. Solicite autorización para Caso Comercial.')
            }
        }

        // 3. Validación Estricta: Morosidad (RN006)
        const accessCheck = await AccessControlService.checkMorosity(poliza_id)
        if (!accessCheck.allowed) {
            throw new Error(`BLOQUEO_MOROSIDAD: ${accessCheck.reason}`)
        }

        const siniestroData = {
            poliza_id,
            cedula_fallecido,
            fecha_defuncion,
            causa,
            descripcion: `Declarado por ${nombre_declarante} (${cedula_declarante})`,
            monto_reclamado: 0, // Se ajusta luego
            estado: 'Reportado',
            fecha_siniestro: fecha_defuncion
        }

        return await SiniestroDAO.create(siniestroData)
    }

    static async subirDocumento(siniestroId, file, tipoDocumento) {
        if (!file) throw new Error('No se ha subido ningún archivo')

        // Validación PDF-Only (Double check)
        if (file.mimetype !== 'application/pdf') {
            throw new Error('Solo se permiten archivos PDF')
        }

        // Calcular SHA-256 Hash
        const hash = crypto.createHash('sha256').update(file.buffer).digest('hex')

        // Subir a Supabase Storage (Bucket: evidencias-siniestros)
        const bucketName = 'evidencias-siniestros'

        // Auto-create bucket if it doesn't exist (Lazy initialization)
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName)
        if (bucketError && bucketError.message.includes('not found')) {
            await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 5242880,
                allowedMimeTypes: ['application/pdf']
            })
        }

        const fileName = `case-${siniestroId}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
                contentType: 'application/pdf',
                upsert: false
            })

        if (uploadError) throw new Error(`Supabase Storage Error: ${uploadError.message}`)

        // Obtener URL pública
        const { data: { publicUrl } } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(fileName)

        // Registrar en DB Documentos
        const docData = {
            siniestro_id: siniestroId,
            tipo: tipoDocumento || 'Evidencia General',
            url: publicUrl,
            hash: hash,
            estado_doc: 'Pendiente'
        }

    } catch(error) {
        console.error('SiniestroService Upload Error:', error)
        if (error.cause) console.error('Error Cause:', error.cause)

        // Re-throw with more context
        if (error.message.includes('fetch failed')) {
            throw new Error('Error al conectar con el servidor de almacenamiento (Supabase). Verifique su conexión internet.')
        }
        throw new Error(`SiniestroService Error: ${error.message}`)
    }

    static async actualizarEstado(id, estado) {
        const validStates = ['Reportado', 'En_tramite', 'Pagado']
        if (!validStates.includes(estado)) {
            throw new Error('Estado inválido')
        }

        const siniestro = await SiniestroDAO.findById(id)
        if (!siniestro) throw new Error('Siniestro no encontrado')

        // FSM Logic
        if (estado === 'En_tramite') {
            // Solo si estaba en Reportado
            if (siniestro.estado !== 'Reportado') {
                throw new Error(`Transición inválida: de ${siniestro.estado} a ${estado}`)
            }

            // Solo si tiene documentos
            if (!siniestro.documentos || siniestro.documentos.length === 0) {
                throw new Error('Bloqueo: Debe subir al menos un documento PDF para tramitar.')
            }
        }

        return await SiniestroDAO.update(id, { estado })
    }
}

export default SiniestroService
