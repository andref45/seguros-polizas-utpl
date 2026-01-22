# Configuración de GitHub Actions

Este documento explica cómo configurar y usar los pipelines de CI/CD creados para el proyecto.

## 📋 Resumen de Workflows Creados

Se han creado 3 workflows principales en `.github/workflows/`:

1. **`ci.yml`** - Pipeline de Integración Continua
2. **`cd.yml`** - Pipeline de Despliegue Continuo  
3. **`security.yml`** - Escaneo de Seguridad

## 🚀 Inicio Rápido

### Paso 1: Verificar estructura del proyecto

Asegúrate de que tu proyecto tiene la siguiente estructura:
```
.
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security.yml
├── backend/
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── Dockerfile
    └── package.json
```

### Paso 2: Configurar Secrets (Opcional pero Recomendado)

Para builds completos del frontend, configura estos secrets en GitHub:

1. Ve a: **Settings → Secrets and variables → Actions**
2. Agrega los siguientes secrets:

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `VITE_API_URL` | URL de la API backend | `http://localhost:3005/api` |
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública de Supabase | `eyJhbGc...` |

**Nota**: Si no configuras estos secrets, el pipeline usará valores por defecto para el build.

### Paso 3: Hacer commit y push

```bash
git add .github/workflows/
git commit -m "feat: agregar pipelines de CI/CD con GitHub Actions"
git push origin main
```

### Paso 4: Verificar ejecución

1. Ve a la pestaña **"Actions"** en tu repositorio de GitHub
2. Deberías ver los workflows ejecutándose automáticamente
3. Revisa los logs para verificar que todo funciona correctamente

## 📊 Detalles de cada Workflow

### CI Pipeline (`ci.yml`)

**Cuándo se ejecuta:**
- Push a `main`, `master`, o `develop`
- Pull requests hacia estas ramas

**Qué hace:**
1. ✅ Ejecuta ESLint en el frontend
2. ✅ Valida sintaxis JavaScript del backend
3. ✅ Construye el frontend con Vite
4. ✅ Construye imágenes Docker (backend y frontend)
5. ✅ Valida docker-compose.yml
6. ✅ Genera resumen de resultados

**Tiempo estimado:** ~5-10 minutos

### CD Pipeline (`cd.yml`)

**Cuándo se ejecuta:**
- Push a `main` o `master` (deploy automático a staging)
- Tags de versión (`v1.0.0`, etc.)
- Ejecución manual desde la interfaz de GitHub

**Qué hace:**
1. 🚀 Prepara imágenes Docker para deploy
2. 🚀 Publica imágenes en GitHub Container Registry (GHCR)
3. 🚀 Genera notificaciones de deploy

**Nota**: Este workflow prepara las imágenes. Debes configurar tu infraestructura para consumirlas.

**Tiempo estimado:** ~3-5 minutos

### Security Scan (`security.yml`)

**Cuándo se ejecuta:**
- Push a ramas principales
- Pull requests
- Semanalmente (lunes 2 AM UTC)

**Qué hace:**
1. 🔒 Escanea vulnerabilidades en dependencias npm
2. 🔒 Escanea imágenes Docker con Trivy
3. 🔒 Reporta vulnerabilidades críticas y altas

**Tiempo estimado:** ~3-5 minutos

## 🐳 GitHub Container Registry (GHCR)

Las imágenes Docker se publican automáticamente en GHCR:

- **Backend**: `ghcr.io/[usuario]/[repositorio]/backend:latest`
- **Frontend**: `ghcr.io/[usuario]/[repositorio]/frontend:latest`

### Cómo usar las imágenes localmente

```bash
# Autenticarse en GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u [tu-usuario] --password-stdin

# Pull de imágenes
docker pull ghcr.io/[usuario]/[repositorio]/backend:latest
docker pull ghcr.io/[usuario]/[repositorio]/frontend:latest
```

## 🔧 Personalización

### Agregar Tests

Para agregar tests al pipeline, edita `ci.yml` y agrega un job:

```yaml
backend-test:
  name: Backend Tests
  runs-on: ubuntu-latest
  defaults:
    run:
      working-directory: ./backend
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm ci
    - run: npm test  # Asegúrate de tener este script en package.json
```

### Cambiar Ramas

Para cambiar las ramas que activan los workflows, edita el trigger `on:` en cada workflow:

```yaml
on:
  push:
    branches: [ tu-rama-personalizada ]
```

### Agregar Notificaciones

Puedes agregar notificaciones a Slack, Discord, o Email usando acciones como:
- `slackapi/slack-github-action`
- `8398a7/action-slack`

## ⚠️ Troubleshooting

### Error: "npm ci failed"
**Solución**: Asegúrate de tener `package-lock.json` en backend y frontend. Si no existe:
```bash
cd backend && npm install
cd ../frontend && npm install
git add */package-lock.json
git commit -m "chore: agregar package-lock.json"
```

### Error: "Docker build failed"
**Solución**: 
- Verifica que los Dockerfiles están correctos
- Revisa los logs del workflow para ver el error específico
- Asegúrate de que los build args están configurados

### Error: "Permission denied" en Container Registry
**Solución**:
- Verifica que el workflow tiene permisos de escritura
- Ve a Settings → Actions → General → Workflow permissions
- Asegúrate de que "Read and write permissions" está habilitado

### Workflow no se ejecuta
**Solución**:
- Verifica que los archivos están en `.github/workflows/`
- Verifica que la sintaxis YAML es correcta
- Revisa que la rama tiene commits recientes

## 📈 Mejoras Futuras Sugeridas

- [ ] Agregar tests unitarios y de integración
- [ ] Configurar deploy automático a Kubernetes/AWS ECS
- [ ] Agregar métricas de coverage de código
- [ ] Implementar notificaciones a Slack/Email
- [ ] Agregar cache de dependencias para builds más rápidos
- [ ] Configurar rollback automático en caso de fallos

## 📚 Recursos Adicionales

- [Documentación de GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)

## ✅ Checklist de Configuración

- [ ] Workflows creados en `.github/workflows/`
- [ ] Secrets configurados (opcional)
- [ ] `package-lock.json` existe en backend y frontend
- [ ] Dockerfiles están correctos
- [ ] Primer push realizado
- [ ] Workflows ejecutándose correctamente
- [ ] Imágenes disponibles en GHCR

---

**¿Problemas?** Revisa los logs en la pestaña "Actions" de GitHub para más detalles.
