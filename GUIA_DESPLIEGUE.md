# Guía de Despliegue y Configuración - Seguros UTPL

Esta guía detalla los pasos exactos para configurar y ejecutar el proyecto localmente, asegurando que todos los miembros del equipo tengan el mismo entorno funcional.

## Prerrequisitos

- **Docker Desktop** (Instalado y ejecutándose)
- **Git**

## 1. Clonar el Repositorio

```bash
git clone <url-del-repo>
cd <nombre-carpeta>
git checkout dev-SebasMend
```

## 2. Configuración de Variables de Entorno (.env)

Es **CRÍTICO** configurar correctamente los archivos `.env` en las carpetas `backend` y `frontend` antes de iniciar.

### Backend (`backend/.env`)

Crea un archivo llamado `.env` dentro de la carpeta `backend/` con el siguiente contenido. Solicita las claves reales al administrador del proyecto (o usa las de Supabase Dashboard).

```ini
# Configuración del Servidor
PORT=3005
NODE_ENV=development

# Base de Datos y Supabase (CRÍTICO)
# URL de tu proyecto Supabase
SUPABASE_URL=https://<tu-proyecto>.supabase.co

# KEY DE SERVICIO (SERVICE_ROLE_KEY)
# ¡IMPORTANTE! No usar la Anon Key aquí. Se requiere la Service Key para saltar restricciones RLS 
# y poder buscar pólizas de usuarios o gestionar siniestros globalmente.
SUPABASE_SERVICE_KEY=<SOLICITAR_CLAVE_AL_ADMINISTRADOR>

# Clave Anónima (Anon Key) - Opcional si solo se usa Service Key en backend, pero recomendable tenerla
SUPABASE_ANON_KEY=<SOLICITAR_CLAVE_AL_ADMINISTRADOR>
```

### Frontend (`frontend/.env`)

Crea un archivo llamado `.env` dentro de la carpeta `frontend/`. Nota que en Vite las variables deben empezar por `VITE_`.

```ini
# URL del Backend (API)
VITE_API_URL=http://localhost:3005/api

# Supabase (Cliente Público)
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<SOLICITAR_CLAVE_AL_ADMINISTRADOR>
```

## 3. Ejecución con Docker (Recomendado)

El proyecto está configurado para correr con Docker Compose, lo que levanta tanto el Frontend como el Backend sin necesidad de instalar dependencias de Node localmente.

1.  Asegúrate de estar en la raíz del proyecto (donde está `docker-compose.yml`).
2.  Ejecuta:

```bash
docker-compose down  # Para limpiar contenedores previos
docker-compose up --build -d
```

3.  Verifica los logs si es necesario:

```bash
docker-compose logs -f
```

## 4. Acceso

- **Frontend (Aplicación Web):** [http://localhost:8085](http://localhost:8085)
- **Backend (API):** [http://localhost:3005](http://localhost:3005)

## 5. Solución de Problemas Comunes

### Error 404 "Póliza no encontrada" al reportar siniestro
*   **Causa:** La base de datos no encuentra la póliza debido a permisos o datos incorrectos.
*   **Solución:** Asegúrate de que `SUPABASE_SERVICE_KEY` en `backend/.env` sea correcta (Role: `service_role`). El backend usa esta llave para buscar pólizas ignorando las reglas RLS (Row Level Security).

### Error 403 "Forbidden" en Mis Siniestros
*   **Causa:** Conflicto de rutas o permisos.
*   **Solución:** Este error fue corregido en el último commit (Fix de rutas en `siniestros.routes.js`). Asegúrate de tener los últimos cambios (`git pull`).

### Estadísticas en "0" en el Dashboard
*   **Causa:** Discordancia entre estados de BD ("Pendiente") y Frontend ("Reportado").
*   **Solución:** Corregido en el último commit. El dashboard ahora lee los estados correctos de la base de datos.
