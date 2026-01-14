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
        if (!req.user || req.user.role !== role) { // Supabase JWT usually has 'role' or 'app_metadata.role'
            // Check app_metadata for Supabase roles if needed
            const userRole = req.user.app_metadata?.role || req.user.role

            if (userRole !== role && userRole !== 'service_role') {
                return res.status(403).json({ success: false, error: 'Insufficient permissions' })
            }
        }
        next()
    }
}
