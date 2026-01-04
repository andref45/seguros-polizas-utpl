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
}

export default AuthController
