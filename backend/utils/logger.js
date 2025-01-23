// logger.js
const pino = require('pino');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: { colorize: true }
    } : undefined,
    redact: {
        paths: ['password', 'secret', 'token'],
        censor: '**REDACTED**'
    },
});
module.exports = logger;
