# Sistema de Gestión de Pólizas de Seguros - UTPL

> **Sprint 1 Complete**: Arquitectura Empresarial 3-Tier, Autenticación Segura, Motor de Siniestros y Despliegue Dockerizado.

Este proyecto implementa un sistema para la gestión del ciclo de vida de pólizas de seguros de vida estudiantil, incluyendo módulos de siniestros, copagos y reportes financieros.

## 🚀 Despliegue Rápido (Docker)

El proyecto está contenerizado para una ejecución inmediata.

```bash
docker-compose up --build -d
```

*   **Frontend (Backoffice)**: [http://localhost:8085](http://localhost:8085)
*   **Backend (API)**: [http://localhost:3005](http://localhost:3005)
*   **API Health Check**: [http://localhost:3005/health](http://localhost:3005/health)

---

## 🏗 Arquitectura (Refactor Sprint 1)

Hemos migrado de un prototipo básico a una arquitectura **3-Tier** robusta y segura, alineada con los requisitos empresariales.

1.  **Frontend (Presentación)**: React + Vite + TailwindCSS.
    *   **Seguridad**: No contiene credenciales de BD. Consume exclusivamente la API.
    *   **Cliente**: `src/services/api.js` centraliza peticiones con inyección automática de JWT.
2.  **Backend (Negocio)**: Node.js + Express.
    *   **Middleware**: Autenticación RBAC, Rate Limiting, CORS, Logging (Winston).
    *   **Lógica**: Data Access Objects (DAO), validación de reglas de negocio (Vigencias, FSM).
3.  **Datos (Persistencia)**: PostgreSQL (Supabase).
    *   **Integridad**: Tablas normalizadas, constraints `UNIQUE`, tipos `ENUM` y auditoría.

---

## ✅ Funcionalidades Implementadas (Sprint 1)

### 1. Módulo de Autenticación
*   **Login Seguro**: `POST /auth/login` devuelve JWT.
*   **Sesión Única**: Invalidación automática de sesiones anteriores del mismo usuario (RN010).
*   **Perfil Conectado**: `GET /auth/me` con roles.

### 2. Módulo de Siniestros y Reglas de Negocio
*   **Aviso de Siniestro**:
    *   Validación de datos mínimos (Cédula, Fechas).
    *   **Candado de Vigencia (RN001)**: `POST /siniestros/aviso` bloquea el registro si no hay una vigencia fiscal activa (Code `409`).
*   **Gestión Documental**:
    *   Validación estricta de **PDF-Only** (MIME type).
    *   Cálculo de Hash **SHA-256** para integridad.
*   **Máquina de Estados (FSM)**:
    *   Transición controlada: Reportado -> En Trámite -> Pagado.
    *   **Bloqueo**: No permite pasar a `En Trámite` sin evidencias cargadas.

### 3. Backoffice (Frontend)
*   **Dashboard**: Listado de siniestros con filtros de estado.
*   **Privacidad**: Enmascaramiento visual de datos sensibles (`110****543`) para roles no-admin.
*   **Interfaz de Detalle**: Visualización de estados y carga de documentos.

---

## 📜 Reglas de Negocio Integradas

Basado en el levantamiento de requisitos (Entrevista & Blueprints):

| ID | Regla | Estado | Implementación |
| :--- | :--- | :--- | :--- |
| **RN001** | **Vigencia Exacta** | ✅ Implementado | `VigenciaDAO` + Guard Clause en Controller. |
| **RN002** | **Bloqueo Altas** | ✅ Implementado | Backend rechaza transacciones en periodos cerrados. |
| **RN007** | **Integridad Evidencias** | ✅ Implementado | Bloqueo de estado si `docs_count == 0` o `!PDF`. |
| **RN010** | **Sesión Única** | ✅ Implementado | Tabla `sesiones` gestiona invalidación activa. |
| **RN011** | **RBAC** | ✅ Implementado | Middleware `verifyToken` lee roles. |

---

## 🛠 Comandos de Desarrollo

Si no deseas usar Docker, puedes correr los servicios manualmente:

### Backend
```bash
cd backend
npm install
node server.js
# Corre en puerto 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Corre en puerto 5173
```

### Verificación (QA Script)
```bash
cd backend
node scripts/verify_sprint1.js
```
Este script ejecuta pruebas automatizadas de:
1.  Conectividad (DB + Storage).
2.  Lógica de Autenticación.
3.  Validación de PDF y Estados.
4.  Bloqueo por Vigencia cerrada.

---

**Autor**: Equipo de Desarrollo UTPL
**Versión**: 1.0.0 (Sprint 1 Final)
