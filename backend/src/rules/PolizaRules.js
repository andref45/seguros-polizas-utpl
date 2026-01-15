class PolizaRules {
    static validarVigencia(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fin > inicio;
    }

    static esElegibleParaSeguro(edad) {
        return edad >= 18 && edad <= 65;
    }

    static calcularPrima(base, edad) {
        // Ejemplo de regla de negocio
        let factor = 1.0;
        if (edad > 40) factor = 1.2;
        if (edad > 50) factor = 1.5;
        return base * factor;
    }
}

export default PolizaRules
