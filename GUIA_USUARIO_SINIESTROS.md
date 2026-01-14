# 🏥 Guía de Siniestros (Explicación para Dummies)

Esta guía explica cómo funciona el módulo de **Reclamaciones (Siniestros)** en el sistema de Seguros UTPL. Está diseñada para que cualquier persona entienda qué necesita y qué pasará con su trámite, siguiendo las reglas oficiales de la institución.

---

## 📋 ¿Qué necesito antes de empezar?

Para que el sistema te permita registrar un siniestro, debes cumplir **3 Reglas de Oro** (basadas en la Arquitectura B1):

1.  **Tener una Póliza Activa**: Debes haber contratado un seguro y este debe estar vigente en el año actual (2026).
2.  **Estar al Día en Pagos (Sin Deudas)**: El sistema revisará automáticamente si has pagado tus primas mensuales.
    *   *Ojo*: Si tienes deudas pendientes, el sistema **te bloqueará** y te mostrará un mensaje de error (RN006). ¡Paga primero!
3.  **Tener las Evidencias en PDF**: No se aceptan fotos ni Word. Debes tener los certificados (defunción, facturas) escaneados en formato `.pdf`.

---

## 🔄 ¿Cómo funciona el proceso? (Paso a Paso)

El trámite es automático y transparente. Aquí te explicamos qué hace el sistema por ti:

### 1. El Registro (El sistema hace las cuentas)
Cuando entras a **"Nuevo Siniestro"** y llenas los datos, el sistema te pedirá el **Monto Total** de la pérdida.
En ese momento, aplicará la regla del **Coaseguro 80/20**:

*   **El Seguro Paga (80%)**: La mayor parte la cubre la póliza.
*   **Tú Pagas (20%)**: Este es tu deducible o coaseguro.

> **Ejemplo**: Si el reclamo es de **$100.00**:
> *   Verás en verde: **$80.00** (Cobertura).
> *   Verás en naranja: **$20.00** (Tu parte).

### 2. La Validación (Candados de Seguridad)
Al hacer clic en "Registrar", el sistema verifica en milisegundos:
*   ¿El año fiscal está abierto? (Si no, te rechaza).
*   ¿Tienes deudas? (Si sí, te rechaza).
*   ¿El monto es válido?

Si todo está bien, tu siniestro se guarda con estado: 🟡 **REPORTADO**.

### 3. La Evidencia (Obligatorio)
Tu trámite **NO** avanzará si no subes los papeles.
*   Busca tu siniestro en el **Historial**.
*   Verás un botón para **Subir PDF**.
*   Hasta que no subas el archivo, el sistema (o un administrativo) no podrá cambiar el estado a "En Trámite". Es un candado de seguridad (RN007).

### 4. El Seguimiento
Una vez subido el documento, el área administrativa revisa y cambia el estado:
*   🔵 **EN TRÁMITE**: Están analizando tu caso.
*   🟢 **PAGADO**: El dinero (el 80%) ha sido desembolsado.
*   🔴 **RECHAZADO**: Algo no cumplió las normas.

---

## 🧠 En Resumen (Para Expertos)

Si te preguntan por la parte técnica, así funciona "por debajo":

| Concepto | Cómo se aplicó | Regla de Negocio |
| :--- | :--- | :--- |
| **Coaseguro** | Cálculo automático en Backend y Frontend antes de guardar. | **Regla 80/20** |
| **Morosidad** | `AccessControlService` consulta si hay facturas vencidas. | **RN006** |
| **Año Fiscal** | `VigenciaDAO` verifica que `2026` esté `abierto`. | **RN001** |
| **Workflow** | Máquina de Estados: `Reportado` -> `En_tramite` -> `Pagado`. | **FSM Estricta** |

¡Así de simple es gestionar tus seguros con el nuevo sistema! 🚀
