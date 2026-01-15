# Guía de Inicio Manual (Startup Guide)

Sigue estos pasos para levantar el proyecto en tu entorno local. 

🚧 **Nota Importante**: Este proyecto está configurado para ejecutarse manualmente con `npm` para garantizar estabilidad y control total sobre los logs. No uses Docker a menos que sea estrictamente necesario.

---

## 1. Prerrequisitos
Asegúrate de tener instalado:
- **Node.js** (Versión 18 o superior).
- **npm** (Viene con Node.js).
- **Git** (Para clonar el repo).

---

## 2. Configuración de Entorno (.env)

Necesitas configurar las variables de entorno para que el Backend se conecte a la Base de Datos y el Frontend al Backend.

### Backend (`/backend/.env`)
Crea o edita el archivo `backend/.env`:
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=TU_URL_DE_SUPABASE
SUPABASE_SERVICE_KEY=TU_SERVICE_ROLE_KEY
```

### Frontend (`/frontend/.env`)
Crea o edita el archivo `frontend/.env`:
```env
VITE_SUPABASE_URL=TU_URL_DE_SUPABASE
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
VITE_API_URL=http://localhost:3000/api
```
> **Ojo**: `VITE_API_URL` es vital para que la web app encuentre al servidor.

---

## 3. Instalación y Ejecución

Abre **DOS** terminales separadas.

### Terminal 1: Backend (Base de Datos y API)
```bash
cd backend
npm install
# IMPORTANTE: Ejecuta este script una vez para asegurar que tu usuario tenga permisos de Admin
node fix_roles.js 

# Iniciar servidor
npm run dev
```
espera a ver: `Server running on port 3000`

### Terminal 2: Frontend (Interfaz Web)
```bash
cd frontend
npm install
npm run dev
```
espera a ver: `Local: http://localhost:5173/`

---

## 4. Verificación

Abre tu navegador e ingresa a: **[http://localhost:5173](http://localhost:5173)**

### Cuentas de Prueba
- **Admin ("Nancy")**: `nancy@segurosutpl.edu.ec` / `password123` (o la que hayas definido).
- **Usuario Normal**: Puedes registrarte libremente desde la pantalla de login.

---

## 5. Solución de Problemas Comunes

- **Error 403 / "No autorizado"**:
    - Ejecuta `node fix_roles.js` en la carpeta `backend` para reparar los permisos de administrador en la base de datos.
    - Cierra sesión y vuelve a entrar.

- **Error de Conexión (Network Error)**:
    - Verifica que el Backend esté corriendo en el puerto 3000.
    - Revisa que `VITE_API_URL` en el `.env` del frontend sea correcto.

- **Vigencia Cerrada / No puedo contratar**:
    - El sistema bloquea contratos si no hay un periodo fiscal activo. Esto es una regla de negocio (RN002). Revisa la tabla `vigencias` en la base de datos.
