// Constantes de Reglas de Negocio

export const BusinessRules = {
  // Coaseguro: Porcentaje que paga el usuario en un siniestro
  COASEGURO_PORCENTAJE: 20,

  // Vigencia de pólizas en días
  POLIZA_VIGENCIA_DIAS: 365,

  // Día de vencimiento de pagos mensuales
  PAGO_DIA_VENCIMIENTO: 5,

  // Estados de pólizas
  ESTADOS_POLIZA: {
    ACTIVA: 'activa',
    VENCIDA: 'vencida',
    CANCELADA: 'cancelada'
  },

  // Estados de pagos
  ESTADOS_PAGO: {
    PENDIENTE: 'pendiente',
    PAGADO: 'pagado',
    VENCIDO: 'vencido'
  },

  // Estados de siniestros
  ESTADOS_SINIESTRO: {
    PENDIENTE: 'pendiente',
    EN_REVISION: 'en_revision',
    APROBADO: 'aprobado',
    RECHAZADO: 'rechazado',
    PAGADO: 'pagado'
  },

  // Tipos de usuario
  TIPOS_USUARIO: {
    CLIENTE: 'cliente',
    ADMIN: 'admin'
  }
}

export default BusinessRules
