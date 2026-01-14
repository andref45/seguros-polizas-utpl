import jwt from 'jsonwebtoken'
import logger from '../config/logger.js'
import supabase from '../config/supabase.config.js'

export const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' })
    }

    try {
        // Verify token using Supabase client
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            logger.error('Token verification failed', { error: error?.message })
            return res.status(401).json({ success: false, error: 'Invalid or expired token' })
        }

        // Set user data from Supabase
        req.user = {
            id: user.id,
            email: user.email,
            sub: user.id,
            ...user.user_metadata,
            app_metadata: user.app_metadata
        }

        // Supabase JWT uses 'sub' for user ID, normalize to 'id' for consistency
        if (req.user && !req.user.id && req.user.sub) {
            req.user.id = req.user.sub
        }

        // Extract role from app_metadata if available (Supabase custom claims)
        if (req.user.app_metadata?.role) {
            req.user.role = req.user.app_metadata.role
        }

        logger.info('User authenticated', {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role || req.user.app_metadata?.role
        })

        next()
    } catch (error) {
        logger.error('Token verification failed', { error: error.message })
        return res.status(401).json({ success: false, error: 'Invalid or expired token' })
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
