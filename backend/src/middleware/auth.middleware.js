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

import { ROLES } from '../constants/roles.js'

export const requireRole = (requiredRole) => {
    return (req, res, next) => {
        // STRICT CHECK: app_metadata.role from JWT (set in verifyToken)
        const userRole = req.user.role // This comes from app_metadata.role in verifyToken

        // [DEBUG] Log the check
        logger.info(`[AuthMiddleware] Checking Role. User: ${req.user.email} (${req.user.id}), Required: ${requiredRole}, Found: ${userRole}`)

        // Special check for ADMIN
        if (requiredRole === ROLES.ADMIN) {
            if (userRole !== ROLES.ADMIN) {
                logger.warn(`Access denied for user ${req.user.id}. Required '${ROLES.ADMIN}', found '${userRole}'`)
                return res.status(403).json({
                    success: false,
                    error: `Acceso denegado: Se requiere rol de Administrador. (Tu rol: ${userRole || 'ninguno'})`
                })
            }
        }
        // Generick check for other roles if needed (e.g. USER)
        else if (userRole !== requiredRole) {
            logger.warn(`Access denied for user ${req.user.id}. Required '${requiredRole}', found '${userRole}'`)
            return res.status(403).json({ success: false, error: 'Insufficient permissions' })
        }

        next()
    }
}
