class Poliza {
    constructor(id, numero_poliza, usuario_id, tipo_poliza_id, fecha_inicio, fecha_fin, estado, prima_mensual, cobertura_total) {
        this.id = id;
        this.numero_poliza = numero_poliza;
        this.usuario_id = usuario_id;
        this.tipo_poliza_id = tipo_poliza_id;
        this.fecha_inicio = fecha_inicio;
        this.fecha_fin = fecha_fin;
        this.estado = estado;
        this.prima_mensual = prima_mensual;
        this.cobertura_total = cobertura_total;
    }

    isActive() {
        return this.estado === 'activa';
    }
}

module.exports = Poliza;
