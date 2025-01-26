import rateLimit from 'express-rate-limit';

// General limiter for all routes
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        status: 'error',
        code: 429,
        message: 'You have exceeded the request limit. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// auth limiter
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour 
    max: 10,
    message: {
        status: 'error',
        code: 429,
        message: 'Too many login attempts. For security reasons, please try again in 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// API routes limiter (for /api endpoints)
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: {
        status: 'error',
        code: 429,
        message: 'API rate limit exceeded. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 