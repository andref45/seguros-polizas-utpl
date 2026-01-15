import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
})

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100000, // Effectively disabled for testing
    message: {
        success: false,
        error: 'Too many login attempts, please try again later.'
    }
})

export default limiter
