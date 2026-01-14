import jwt from 'jsonwebtoken'
import logger from '../config/logger.js'

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' })
    }

    try {
        // Requires JWT_SECRET to be set in .env
        const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET

        let decoded;
        if (!secret) {
            logger.warn('JWT_SECRET is not defined. Using unsafe jwt.decode() (DEV ONLY).')
            decoded = jwt.decode(token)
            if (!decoded) throw new Error('Invalid token structure')
        } else {
            decoded = jwt.verify(token, secret)
        }

        req.user = decoded
        // Supabase JWT uses 'sub' for user ID, but our controllers might expect 'id'
        if (req.user && !req.user.id && req.user.sub) {
            req.user.id = req.user.sub
        }

        console.log('User authenticated:', { id: req.user.id, email: req.user.email, role: req.user.role })
        next()
    } catch (error) {
        logger.error('Token verification failed', { error: error.message })
        return res.status(401).json({ success: false, error: 'Invalid token' })
    }
}

export const requireRole = (role) => {
    return (req, res, next) => {
        // STRICT CHECK: app_metadata.role for admin, ignore user_metadata for this critical role
        const appRole = req.user.app_metadata?.role
        const isServiceRole = req.user.role === 'service_role'

        // If we require 'admin', we MUST see it in app_metadata.role
        if (role === 'admin' && appRole !== 'admin' && !isServiceRole) {
            logger.warn(`Access denied for user ${req.user.id}. Required 'admin', found '${appRole}'`)
            return res.status(403).json({ success: false, error: 'Acceso denegado: Se requiere rol de Administrador.' })
        }

        // Fallback for other roles (e.g. 'empleado' might be in user_metadata)
        // But for this specific 'Nancy' refactor, we are focusing on Admin protection.
        if (role !== 'admin' && appRole !== role && !isServiceRole) {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' })
        }
        // If all checks pass
        next()
    }
}
