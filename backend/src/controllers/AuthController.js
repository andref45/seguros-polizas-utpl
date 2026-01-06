import supabase from '../config/supabase.config.js'
import logger from '../config/logger.js'

class AuthController {

    static async getMe(req, res) {
        try {
            // User is already attached by verifyToken middleware (req.user)
            const userId = req.user.id // or req.user.sub depending on JWT structure

            // Fetch full profile from DB
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                logger.warn(`Profile not found for user ${userId}`)
                // Fallback to basic JWT info if DB profile missing
                return res.json({ success: true, data: { id: userId, ...req.user } })
            }

            res.json({ success: true, data })

        } catch (error) {
            logger.error('Error in getMe', error)
            res.status(500).json({ success: false, error: error.message })
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.status(400).json({ success: false, error: 'Email and password are required' })
            }

            // 1. Authenticate with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                logger.warn(`Login failed for ${email}: ${error.message}`)
                return res.status(401).json({ success: false, error: 'Invalid credentials' })
            }

            const { session, user } = data

            // 2. Enforce Single Session: Invalidate previous active sessions
            const { error: invalidateError } = await supabase
                .from('sesiones')
                .update({ estado: 'inactivo' })
                .eq('usuario_id', user.id)
                .eq('estado', 'activo')

            if (invalidateError) {
                logger.error('Error invalidating sessions', invalidateError)
                // Continue anyway, strictly speaking we should fail but for MVP we log
            }

            // 3. Register new session
            const { error: sessionError } = await supabase
                .from('sesiones')
                .insert({
                    usuario_id: user.id,
                    token: session.access_token, // Store signature or full token depending on size/security needs (full token for MVP)
                    estado: 'activo'
                })

            if (sessionError) {
                logger.error('Error creating session record', sessionError)
            }

            // 4. Get User Role (from metadata or custom table if needed)
            // Supabase user object has app_metadata.role usually if configured, user.role is 'authenticated'
            const role = user.app_metadata?.role || 'user'

            logger.info(`User ${email} logged in successfully`)

            res.status(200).json({
                success: true,
                data: {
                    token: session.access_token,
                    refreshToken: session.refresh_token,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: role
                    }
                }
            })

        } catch (error) {
            logger.error('Login error', error)
            res.status(500).json({ success: false, error: 'Internal Server Error' })
        }
    }

    static async logout(req, res) {
        // Implementation for logout if needed (invalidate session in DB)
        try {
            const token = req.headers.authorization?.split(' ')[1]
            if (token) {
                await supabase.from('sesiones').update({ estado: 'inactivo' }).eq('token', token)
            }
            await supabase.auth.signOut()
            res.json({ success: true, message: 'Logged out' })
        } catch (e) {
            res.status(500).json({ success: false, error: e.message })
        }
    }

    static async register(req, res) {
        try {
            const { email, password, nombres, apellidos, cedula, tipo_usuario, fecha_nacimiento, telefono, direccion } = req.body

            if (!email || !password || !nombres || !apellidos || !cedula || !tipo_usuario) {
                return res.status(400).json({ success: false, error: 'Todos los campos obligatorios son requeridos.' })
            }

            // 1. Crear usuario en Auth (Supabase)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { role: tipo_usuario } // Guardar rol en metadata
                }
            })

            if (authError) {
                return res.status(400).json({ success: false, error: `Error Auth: ${authError.message}` })
            }

            if (!authData.user) {
                return res.status(500).json({ success: false, error: 'No se pudo crear el usuario en Auth.' })
            }

            // 2. Insertar perfil en tabla 'usuarios'
            const { error: profileError } = await supabase
                .from('usuarios')
                .insert({
                    id: authData.user.id, // VINCULACIÓN CLAVE
                    cedula,
                    nombres,
                    apellidos,
                    telefono,
                    tipo_usuario,
                    fecha_nacimiento: fecha_nacimiento || '2000-01-01', // Fallback si no viene
                    direccion,
                    estado: 'activo'
                })

            if (profileError) {
                // Opcional: Borrar el usuario de Auth si falla el perfil (Rollback manual)
                // await supabase.auth.admin.deleteUser(authData.user.id)
                logger.error('Error creando perfil de usuario', profileError)
                return res.status(500).json({ success: false, error: `Error creando perfil: ${profileError.message}` })
            }

            res.status(201).json({
                success: true,
                data: {
                    id: authData.user.id,
                    email: authData.user.email,
                    nombres,
                    apellidos,
                    role: tipo_usuario
                },
                message: 'Usuario registrado exitosamente'
            })

        } catch (error) {
            logger.error('Error register', error)
            res.status(500).json({ success: false, error: error.message })
        }
    }
}

export default AuthController
