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
