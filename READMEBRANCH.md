# Sistema de Gestión de Pólizas de Seguros (Seguros UTPL)

Bienvenido. Este documento describe la arquitectura, funcionalidad y alcance del sistema web para la gestión de seguros de vida estudiantil de la UTPL.

## 🌟 Visión General

El proyecto es una **Plataforma Web Integral** diseñada para automatizar y gestionar el ciclo de vida de las pólizas de seguros (Vida, Accidentes, Becas). Su objetivo es eliminar los procesos manuales, centralizar la información y aplicar reglas de negocio estrictas para evitar errores financieros y operativos.

### Actores Principales
1.  **Nancy (Administradora)**: Gestiona todo el sistema. Puede ver reportes, aprobar siniestros, gestionar vigencias y crear usuarios.
2.  **Usuario (Estudiante/Empleados)**: Tiene acceso de "solo lectura" a sus pólizas y pagos. Su única acción de escritura es **Reportar un Siniestro** cuando ocurre un evento.

## 🏗 Arquitectura del Sistema

El sistema sigue una arquitectura robusta **3-Tier (Tres Capas)**:

1.  **Backend (Lógica de Negocio)**
    *   **Tecnología**: Node.js + Express.
    *   **Función**: Procesa reglas de negocio, validaciones, cálculos financieros y seguridad.
    *   **Seguridad**: Autenticación RBAC (Roles) y Tokens JWT.
2.  **Frontend (Interfaz de Usuario)**
    *   **Tecnología**: React + Vite + TailwindCSS.
    *   **Función**: Presenta datos de formar amigable. Se adapta según el rol (Admin ve más opciones que Usuario).
    *   **Conexión**: Consume la API del backend; no toca la base de datos directamente.
3.  **Base de Datos (Persistencia)**
    *   **Tecnología**: PostgreSQL (vía Supabase).
    *   **Función**: Almacena usuarios, pólizas, siniestros y documentos de forma relacional y segura.

---

## 📦 Módulos Principales

### 1. Gestión de Pólizas (Vigencias)
Controla quién está asegurado y cuándo.
*   **Regla de Oro (RN001/RN002)**: No se puede crear ni contratar una póliza si no existe un **Periodo de Vigencia Activo** (definido por el año académico).
*   **Flujo**: El usuario contrata -> El sistema valida fechas -> Se genera la póliza.

### 2. Gestión Financiera (Pagos y Nómina)
Maneja los cobros mensuales por descuento de rol.
*   **Copago**: Calcula automáticamente cuánto paga la institución (ej. 70%) y cuánto el empleado (30%).
*   **Corte de Nómina (RN005)**: Los pagos deben registrarse antes del día 5. Pasado ese día, se marcan como "Extemporáneos".
*   **Reportes (RN008)**: Genera listados de descuento para nómina con corte al día 15.

### 3. Gestión de Siniestros (Reclamos)
Permite a los usuarios reportar eventos (fallecimiento, accidente) para cobrar el seguro.
*   **Aviso de Siniestro**: Formulario público simple.
*   **Evidencias (RN007)**: Exige carga de documentos PDF (Partidas de defunción, facturas).
*   **Auditoría**: Valida la integridad de los archivos (Hash SHA-256) y tipos MIME.
*   **Estados**: `Reportado` -> `En Trámite` -> `Pagado`.

### 4. Seguridad y Privacidad
*   **Data Masking (RN009)**: Los datos sensibles (Cédulas completas) se ocultan en los reportes si quien consulta no es Administrador.
*   **Sesión Única (RN010)**: Un usuario no puede tener sesiones abiertas en dos navegadores simultáneamente.

---

## 🛠 Tecnologías

*   **Lenguaje**: JavaScript (ES6+)
*   **Runtime**: Node.js
*   **Framework Frontend**: React 18
*   **Base de Datos**: PostgreSQL 15
*   **Almacenamiento Archivos**: Supabase Storage Buckets
*   **Control de Versiones**: Git

---

## 🚀 Próximos Pasos (Roadmap)

Este proyecto está en su fase de entrega final (MVP). Las funcionalidades descritas están implementadas y operativas. Para instrucciones de instalación, consulte `STARTUP_GUIDE.md`.
