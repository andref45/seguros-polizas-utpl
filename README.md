# Sistema de Gestión de Pólizas de Seguros - UTPL

Sistema web para la gestión integral de pólizas de seguros de vida para empleados y estudiantes de la Universidad Técnica Particular de Loja (UTPL).

## 📋 Descripción del Proyecto

Sistema académico desarrollado como proyecto universitario que implementa la gestión completa del ciclo de vida de pólizas de seguros, incluyendo registro de usuarios, contratación de pólizas, gestión de pagos con cálculo de coaseguro, reporte de siniestros con evidencias adjuntas y generación de reportes estadísticos.

### Equipo de Desarrollo

- **Orly André Flores Valdivieso**
- **Jean Daniel Villavicencio Samaniego**
- **Sebastian Felipe Mendieta Lima**
- **Alex Fernando Aguirre Rojas**

**Universidad:** Universidad Técnica Particular de Loja (UTPL)  
**Carrera:** Ingeniería en Software  
**Proyecto:** Arquitectura de Software - Sprint 1 (50% funcionalidad)

## 🏗️ Arquitectura del Sistema

### Patrón Arquitectónico Principal
**Arquitectura por Capas (Layered Architecture)** con **Supabase Auth**

```
┌─────────────────────────────────────┐
│   Capa de Presentación (React)      │
│   + Supabase Auth (Frontend)        │
├─────────────────────────────────────┤
│   Capa de Lógica de Negocio (API)   │
│   + Supabase Auth Verification      │
├─────────────────────────────────────┤
│   Capa de Acceso a Datos (DAO)      │
├─────────────────────────────────────┤
│   Capa de Persistencia (Supabase)   │
│   + Row Level Security (RLS)        │
└─────────────────────────────────────┘
```

### Stack Tecnológico

**Frontend:**
- React 18+ (biblioteca de UI)
- Vite (build tool)
- React Router (enrutamiento)
- **Supabase JS Client** (autenticación y base de datos)
- TailwindCSS (estilos)

**Backend:**
- Node.js v18+ (runtime)
- Express.js (framework web)
- Supabase SDK (validación de sesiones y lógica de negocio)
- **SIN JWT manual - usa Supabase Auth**

**Base de Datos:**
- PostgreSQL 15 (vía Supabase)
- Supabase Auth (gestión de usuarios integrada)
- Supabase Storage (almacenamiento de archivos)
- **Row Level Security (RLS) activo**

**DevOps:**
- GitHub (control de versiones)
- Vercel (despliegue frontend)
- Render (despliegue backend)

## 🔐 Autenticación con Supabase Auth

Este proyecto usa **Supabase Auth nativo**, NO JWT personalizado:

### Ventajas:
✅ Row Level Security (RLS) funciona automáticamente  
✅ No necesitas gestionar tokens manualmente  
✅ Sesiones persistentes automáticas  
✅ Seguridad incorporada  
✅ Sin necesidad de bcrypt o jsonwebtoken  

### Flujo de Autenticación:
1. **Registro:** `supabase.auth.signUp()` → Crea usuario en auth.users
2. **Login:** `supabase.auth.signInWithPassword()` → Retorna session con access_token
3. **Sesión:** Token automático en todas las peticiones a Supabase
4. **Verificación:** `supabase.auth.getUser()` → Valida sesión activa
5. **Logout:** `supabase.auth.signOut()` → Cierra sesión

### Backend:
El backend **NO maneja autenticación**, solo:
- Valida que el usuario tenga sesión activa
- Ejecuta lógica de negocio
- Realiza operaciones en base de datos usando service_role (cuando sea necesario)

## 📦 Estructura del Monorepo

```
seguros-polizas-utpl/
├── frontend/                 # Aplicación React
│   ├── public/              # Archivos estáticos
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas/vistas principales
│   │   ├── services/        # Servicios (supabaseClient)
│   │   ├── store/           # Estado global (Context)
│   │   ├── utils/           # Funciones auxiliares
│   │   ├── App.jsx          # Componente raíz
│   │   └── main.jsx         # Punto de entrada
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── routes/          # Definición de endpoints
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── services/        # Lógica de negocio
│   │   ├── dao/             # Acceso a datos
│   │   ├── middleware/      # Middleware Express
│   │   └── utils/           # Utilidades
│   ├── .env.example
│   ├── package.json
│   └── server.js            # Punto de entrada
│
├── database/                # Scripts de base de datos
│   └── schema.sql          # Esquema completo
│
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/seguros-polizas-utpl.git
cd seguros-polizas-utpl
```

### 2. Configurar Variables de Entorno

#### Frontend (.env)

```env
VITE_SUPABASE_URL=https://xiqnjqejonh1rpmcqdxl.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

#### Backend (.env)

```env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xiqnjqejonh1rpmcqdxl.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui

# CORS
CORS_ORIGIN=http://localhost:5173

# Business Rules
COASEGURO_PORCENTAJE=20
PAGO_DIA_VENCIMIENTO=5
POLIZA_VIGENCIA_DIAS=365
```

**⚠️ IMPORTANTE:** Ya NO necesitas JWT_SECRET

### 3. Instalar Dependencias

```bash
npm run install:all
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

## 📱 Funcionalidades - Sprint 1 (50%)

### ✅ Implementadas en Sprint 1

#### 1. Autenticación (Supabase Auth)
- Login de empleados/estudiantes
- Registro de nuevos usuarios
- Perfil de usuario
- Cerrar sesión
- Recuperación de contraseña

#### 2. Gestión de Pólizas
- Listar tipos de pólizas disponibles
- Ver detalles de póliza
- Contratar nueva póliza
- Ver mis pólizas activas
- Cálculo automático de coaseguro

#### 3. Gestión de Pagos
- Registrar pago mensual
- Ver historial de pagos
- Ver pagos pendientes
- Estados de pago (Pendiente/Pagado)

### ⏳ Diferidas a Sprint 2

- Gestión completa de siniestros
- Reportes y estadísticas
- Notificaciones por email
- Gestión de beneficiarios
- Panel administrativo

## 🔒 Reglas de Negocio Principales

1. **Vigencia de Pólizas:** Validez de 1 año desde contratación
2. **Pagos Mensuales:** Vencimiento día 5 de cada mes
3. **Coaseguro:** 20% del monto total a cargo del asegurado
4. **Siniestros:** Solo reportables con póliza activa
5. **Estados de Pago:** Pendiente → Pagado (flujo unidireccional)

## 🗄️ Esquema de Base de Datos

### Tablas Principales:
- `auth.users` - Usuarios Supabase Auth (gestionada por Supabase)
- `usuarios` - Datos extendidos de usuarios (cedula, nombres, apellidos, etc.)
- `tipos_poliza` - Catálogo de tipos de pólizas
- `polizas` - Pólizas contratadas
- `pagos` - Registro de pagos mensuales
- `beneficiarios` - Beneficiarios de pólizas
- `siniestros` - Reportes de siniestros

### Row Level Security (RLS):
✅ Activo en todas las tablas  
✅ Los usuarios solo ven sus propios datos  
✅ auth.uid() valida automáticamente  

## 🧪 Testing

### Datos de Prueba

Tipos de pólizas disponibles:
- Básica: $25/mes - Cobertura $50,000
- Intermedia: $45/mes - Cobertura $100,000
- Premium: $75/mes - Cobertura $200,000
- Familiar: $90/mes - Cobertura $150,000

## 🤝 Contribuir

### Flujo de Trabajo Git

```bash
git checkout -b feature/nombre-funcionalidad
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-funcionalidad
```

---

**Nota:** Este proyecto usa **Supabase Auth** en lugar de JWT personalizado para aprovechar Row Level Security y simplificar la gestión de sesiones.
