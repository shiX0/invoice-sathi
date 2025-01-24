const express = require('express')
const pino = require('pino')
const pinoHttp = require('pino-http')
const { AppError, errorHandler } = require('./middlewares/ErrorHandler')
const connectDB = require('./config/db')
const logger = require('./utils/logger')
require('dotenv').config()
const port = process.env.PORT || 3000

// config
const app = express()
connectDB()
app.use(pinoHttp({ logger }));

// cors
const cors = require('cors')
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type']
}))
// body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// routes
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
const customerRoutes = require('./routes/customerRoutes')

app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/customers', customerRoutes)





app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});
app.all('*', (req, _res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.use(errorHandler);
app.listen(port, () => logger.info(`Server running on port ${port}`));