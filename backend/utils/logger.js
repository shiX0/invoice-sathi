// logger.js
const pino = require('pino');

// MongoDB connection string - make sure to add this to your environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoicesathi';

// Create MongoDB transport configuration
const mongoTransport = {
    target: 'pino-mongodb',
    options: {
        uri: MONGODB_URI,
        collection: 'logs',
        timestamp: true,
        synchronized: true
    }
};

// Development transport for console output
const devTransport = {
    target: 'pino-pretty',
    options: { colorize: true }
};

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        targets: [
            // Always include MongoDB transport
            mongoTransport,
            // Include pretty console logging only in non-production
            ...(process.env.NODE_ENV !== 'production' ? [devTransport] : [])
        ]
    },
    redact: {
        paths: ['password', 'secret', 'token', 'user.password', 'user.firstName', 'user.lastName', 'user.businessInfo.name', 'user.businessInfo.address', 'user.businessInfo.city', 'user.businessInfo.country', 'user.businessInfo.phone', 'user.businessInfo.email', 'cookie'],
        censor: '**REDACTED**'
    },
});

module.exports = logger;
