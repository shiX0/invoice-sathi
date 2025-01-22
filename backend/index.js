const express = require('express')
const { AppError } = require('./middlewares/ErrorHandler')
require('dotenv').config()
const port = process.env.PORT || 3000

const app = express()

const logger = pino({
    level: process.env.LOG_LEVEL || 'info', // Set log level
    transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: { colorize: true }
    } : undefined
});
app.use(pinoHttp({ logger }));


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
app.use(AppError)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))