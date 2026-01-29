import FacturasDAO from '../dao/FacturasDAO.js'
import logger from '../config/logger.js'

class FacturasController {

    static async createFactura(req, res, next) {
        try {
            const { numero_factura, plan, periodo_mes, periodo_anio, monto_total, fecha_emision, archivo_url } = req.body

            // Basic Validation
            if (!numero_factura || !plan || !periodo_mes || !periodo_anio || !monto_total || !fecha_emision) {
                return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' })
            }

            // Check duplicate
            const existing = await FacturasDAO.findByNumero(numero_factura)
            if (existing) {
                return res.status(409).json({ success: false, error: 'Número de factura ya registrado' })
            }

            const newFactura = await FacturasDAO.create({
                numero_factura,
                plan,
                periodo_mes,
                periodo_anio,
                monto_total,
                fecha_emision,
                archivo_url
            })

            logger.info({
                action: 'REGISTRAR_FACTURA_PRIMA',
                user: req.user.id,
                resource: newFactura.id
            })

            res.status(201).json({ success: true, data: newFactura })
        } catch (error) {
            next(error)
        }
    }

    static async getFacturas(req, res, next) {
        try {
            const facturas = await FacturasDAO.findAll()
            res.status(200).json({ success: true, data: facturas })
        } catch (error) {
            next(error)
        }
    }
}

export default FacturasController
