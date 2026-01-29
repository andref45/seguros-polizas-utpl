# 🚨 LISTA DE VERIFICACIÓN URGENTE - ERROR 500 RLS

El error `new row violates row-level security policy` persiste porque el Servidor en Producción (Render) **NO tiene permisos de Administrador**. Estás usando la llave equivocada.

Sigue estos 3 pasos EXACTOS para arreglarlo:

## 1. Verifica la Llave en Supabase
1. Entra a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a **Project Settings** (Icono engranaje) -> **API**.
3. Busca la sección **Project API Keys**.
4. Verás dos llaves:
   *   `anon` `public` (Esta es la que TIENES puesta ahora, !ES LA INCORRECTA para el Backend!)
   *   `service_role` `secret` (Esta es la **CORRECTA**, dice `secret`).
5. **Copia la llave `service_role`**.

## 2. Actualiza en Render
1. Entra a [Render Dashboard](https://dashboard.render.com/).
2. Selecciona tu servicio Web (Backend).
3. Ve a la pestaña **Environment**.
4. Busca la variable `SUPABASE_SERVICE_KEY`.
5. Si ves que empieza igual que la `SUPABASE_ANON_KEY` o dice `public`... **ESTÁ MAL**.
6. **Dale a Edit y PEGA la llave `service_role`** (la secreta) que copiaste en el paso 1.
7. Guarda los cambios (**Save Changes**).

## 3. Comprueba los Logs (Prueba de Fuego)
1. En Render, ve a la pestaña **Logs**.
2. Espera a que el servicio se reinicie (o fuerza un **Manual Deploy** > **Deploy latest commit** si no lo hace solo).
3. Cuando arranque, busca este mensaje que agregué en el código:

   > `Using Service Key for Insert (Length: ...)`

   * Si dice **"Using Service Key..."**: ¡YA ESTÁ ARREGLADO! Prueba crear el siniestro.
   * Si dice **"CRITICAL: SUPABASE_SERVICE_KEY is missing..."**: Sigues sin configurar bien la variable.
   * Si no sale nada: No se ha desplegado mi último código. Dale a desplegar de nuevo.
