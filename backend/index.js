const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const hpp = require('hpp');
const compression = require('compression');
const { AppError, errorHandler } = require('./middlewares/ErrorHandler');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const cookieParser = require('cookie-parser');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const { globalLimiter, authLimiter, apiLimiter } = require('./middlewares/rateLimiter');
require('dotenv').config();
const port = process.env.PORT || 3000;

// config
const app = express()
connectDB()

// Security Headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Sanitize data
app.use(mongoSanitize());

// Prevent http param pollution
app.use(hpp());

// Compress responses
app.use(compression());

// cors with more secure options
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // 10 minutes
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// body parser with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// cookie parser with secure options
app.use(cookieParser(process.env.COOKIE_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
}));

// logger middleware 
app.use(loggerMiddleware)


// rate limiter
app.use(globalLimiter)
app.use('/api/users/login', authLimiter)
app.use('/api/users/register', authLimiter)
app.use('/api', apiLimiter)

// routes
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
const customerRoutes = require('./routes/customerRoutes')
const logRoutes = require('./routes/logRoutes')

app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/logs', logRoutes)

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});
app.all('*', (req, _res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.use(errorHandler);
app.listen(port, () => logger.info(`Server running on port ${port}`));