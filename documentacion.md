# DOCUMENTACIÓN PROFUNDA DEL SISTEMA (SGV-APS)

Este documento contiene la información detallada para llenar los archivos solicitados: "Ficha Técnica" y "Manual de Usuario".

---

# ARCHIVO 1: FICHA TÉCNICA
**Proyecto:** SISTEMA DE GESTIÓN DE SEGUROS DE VIDA Y SINIESTROS (SGV-APS)
**Versión:** 1.0.0

## 1. Autores
- [Tu Nombre / Equipo de Desarrollo]

## 2. Descripción del Producto
El **Sistema de Gestión de Seguros de Vida y Siniestros (SGV-APS)** es una aplicación web integral diseñada para transformar el proceso manual de gestión de seguros universitarios. Su propósito principal es automatizar el ciclo de vida de los siniestros, desde la declaración inicial por parte del beneficiario hasta la liquidación financiera y el cálculo de siniestralidad. Utiliza técnicas de desarrollo moderno basadas en contenedores y servicios en la nube para garantizar escalabilidad y seguridad.

**Funcionalidades Principales:**
- Digitalización del expediente de siniestros (eliminación de gestión por Excel).
- Validación automática de reglas de negocio (morosidad, vigencia, plazos).
- Repositorio seguro de documentación legal (Actas, Informes Médicos).
- Generación automática de reportes financieros y nómina.

## 3. Objetivos
1.  **Centralización de la Información:** Unificar datos de usuarios, pólizas y siniestros en una sola fuente de verdad para garantizar la continuidad operativa ("Bus Factor").
2.  **Transparencia Financiera:** Calcular automáticamente montos de primas vs. siniestros recuperados para justificar presupuestos.
3.  **Eficiencia Operativa:** Reducir el tiempo de revisión de expedientes mediante validaciones automáticas y flujos de estado claros.
4.  **Seguridad y Auditoría:** Garantizar que solo usuarios autorizados accedan a información sensible mediante roles y URLs firmadas.

## 4. Plataforma y Tecnologías Utilizadas

### Plataforma
- **Web:** Aplicación accesible desde cualquier navegador moderno.

### Tecnologías

**Frontend (Interfaz de Usuario)**
-   **Framework:** React 18 (Vite)
-   **Lenguaje:** JavaScript (ES6+)
-   **Estilos:** TailwindCSS (Diseño responsivo y moderno)
-   **Cliente HTTP:** Axios / Fetch
-   **Iconos:** Lucide React

**Backend (Lógica del Servidor)**
-   **Entorno:** Node.js v18+
-   **Framework:** Express.js (Arquitectura MVC)
-   **Seguridad:** Helmet, CORS, JWT (JSON Web Tokens)
-   **Logs:** Winston

**Base de Datos y Almacenamiento (BaaS)**
-   **Supabase:**
    -   **PostgreSQL:** Base de datos relacional.
    -   **Auth:** Gestión de identidad y sesiones.
    -   **Storage:** Almacenamiento de evidencias (PDFs) con políticas de seguridad.

**Infraestructura**
-   **Docker:** Contenedorización de servicios y Nginx.
-   **Docker Compose:** Orquestación de servicios locales.

## 5. Requisitos del Sistema

### Para el Servidor (Despliegue)
-   **Sistema Operativo:** Linux (Ubuntu 20.04+), Windows Server, o cualquier OS con soporte Docker.
-   **RAM:** Mínimo 2GB (Recomendado 4GB).
-   **Almacenamiento:** 10GB libres.
-   **Software:** Docker Egnine & Docker Compose, o Node.js v18+.

### Para el Cliente (Usuario Final)
-   **Dispositivo:** Computadora, Tablet o Smartphone.
-   **Navegador:** Google Chrome (v90+), Firefox, Edge, Safari.
-   **Conexión:** Acceso a Internet estable para conectar con Supabase y Backend.

## 6. Arquitectura y Estructura

El sistema sigue una arquitectura **Cliente-Servidor RESTful** desacoplada.

**Diagrama Descriptivo:**
1.  **Capa Cliente (Frontend):** React SPA que consume la API. Gestiona la vista y validaciones de formulario.
2.  **Capa Gateway (Backend API):** Servidor Express que actúa como intermediario seguro.
    -   Valida tokens de sesión.
    -   Ejecuta reglas de negocio complejas (verificación de pagos, fechas límite).
    -   Sanitiza datos antes de ir a la BD.
3.  **Capa de Datos (Supabase):**
    -   Almacena la información relacional.
    -   Provee autenticación y almacenamiento de archivos planos.

**Esquema de Base de Datos (Principales Tablas):**
-   `usuarios`: Datos personales y roles.
-   `polizas`: Vincula usuarios con coberturas.
-   `siniestros`: Cabecera del trámite.
-   `documentos`: Evidencias adjuntas (1 a N).
-   `facturas`: Registro de pagos globales a la aseguradora.

## 7. Funcionalidades Principales

1.  **Autenticación Segura:** Registro e inicio de sesión con validación de correo corporativo.
2.  **Gestión de Pólizas:** Visualización de mis pólizas activas y estado de cuenta.
3.  **Reporte de Siniestros (Wizard):** Flujo paso a paso para reportar un fallecimiento, validando automáticamente si el usuario es moroso o si la vigencia está cerrada.
4.  **Gestión Documental:** Carga de PDFs (actas, cédulas) con validación de tipo y firma segura de URLs temporal.
5.  **Backoffice Administrativo:**
    -   Bandeja de entrada de casos "Pendientes".
    -   Revisión y Aprobación/Rechazo de trámites.
    -   Registro de Liquidación (Pago de la aseguradora).
6.  **Reportes Ejecutivos:**
    -   **Nómina:** Generación de descuentos por rol.
    -   **Siniestralidad:** Comparativa financiera (Primas vs. Siniestros).

## 8. APIs y Servicios Externos

-   **Supabase Auth API:** Utilizada para crear usuarios, manejar sesiones y recuperar contraseñas.
-   **Supabase Storage API:** Utilizada para subir (upload) y descargar (signedUrl) archivos de evidencia.
-   **Supabase Database (PostgREST):** Consumida indirectamente por el Backend para operaciones CRUD.

---

# ARCHIVO 2: MANUAL DE USUARIO
**Proyecto:** SISTEMA DE GESTIÓN DE SEGUROS DE VIDA Y SINIESTROS
**Versión:** 1.0.0

## 1. Introducción
Bienvenido al Sistema de Gestión de Seguros. Esta plataforma permite a los estudiantes y personal de la universidad gestionar sus pólizas de vida, y en caso de eventualidad, reportar siniestros de manera ágil y digital, eliminando el papeleo físico innecesario y brindando transparencia en el estado de su trámite.

## 2. Requisitos del Sistema
Para usar el sistema, usted solo necesita:
-   Una computadora o dispositivo móvil con acceso a internet.
-   Un navegador web actualizado (Google Chrome recomendado).
-   Tener acceso a su correo electrónico institucional o personal registrado.

## 3. Instalación y Configuración (Para Administradores Técnicos)

### Opción A: Despliegue con Docker (Recomendado)
1.  Asegúrese de tener Docker Desktop instalado y corriendo.
2.  Copie la carpeta del proyecto a su equipo o servidor.
3.  Configure los archivos `.env` en las carpetas `backend` y `frontend` con las credenciales de Supabase proporcionadas.
4.  Abra una terminal en la raíz del proyecto y ejecute:
    ```bash
    docker-compose up --build -d
    ```
5.  El sistema estará disponible en: `http://localhost:8085`.

### Opción B: Ejecución Manual
1.  Instale **Node.js v18**.
2.  **Backend:** Navegue a `/backend`, ejecute `npm install` y luego `npm run dev`. (Puerto 3000)
3.  **Frontend:** Navegue a `/frontend`, ejecute `npm install` y luego `npm run dev`. (Puerto 5173)
4.  Acceda a `http://localhost:5173`.

## 4. Interacción del Sistema

### 4.1. Inicio de Sesión y Registro
-   **Registro:** En la pantalla principal, presione "¿No tienes cuenta?". Ingrese su cédula, correo y contraseña. El sistema validará que su usuario no exista previamente.
-   **Login:** Ingrese sus credenciales para acceder.
-   *(Imagen sugerida: Captura de pantalla del formulario de Login simple y elegante)*

### 4.2. Módulo de Usuario: Mis Pólizas
Al ingresar, verá su "Dashboard". Aquí encontrará:
-   Un resumen de sus pólizas contratadas.
-   Estado actual (Activa/Inactiva).
-   Botón para **Reportar Siniestro**.
-   *(Imagen sugerida: Tabla de pólizas con badges de estado verdes)*

### 4.3. Reportar un Siniestro
Si necesita activar el seguro:
1.  Presione "Reportar Siniestro".
2.  **Paso 1 (Datos):** Llene los datos del fallecido y fecha. El sistema verificará si está dentro del plazo de 60 días.
3.  **Paso 2 (Documentos):** Suba los PDFs requeridos (Acta de defunción, Copia de cédula).
4.  **Confirmación:** Recibirá un mensaje de éxito y un número de caso (ej. `SIN-2026-001`).
-   *(Imagen sugerida: Formulario wizard con pasos 1 y 2)*

### 4.4. Módulo Administrativo (Backoffice)
Accesible solo para usuarios con rol "Admin".
-   **Bandeja de Entrada:** Lista de todos los siniestros reportados ordenados por fecha.
-   **Detalle del Caso:** Al hacer clic en un caso, podrá ver los documentos adjuntos, descargar la evidencia y cambiar el estado (Aprobar/Rechazar).
-   **Liquidación:** Una vez aprobado, el admin registra cuánto pagó la aseguradora y sube el comprobante de liquidación.
-   *(Imagen sugerida: Vista de tabla administrativa con filtros)*

### 4.5. Reportes
En la sección "Reportes":
-   **Siniestralidad:** Gráfico o tabla comparativa que muestra "Total Cobrado en Primas" vs "Total Pagado en Siniestros".
-   **Nómina:** Listado para enviar a Talento Humano con los descuentos a realizar.
