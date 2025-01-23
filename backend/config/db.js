const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MongoDB connection string is not defined in environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
module.exports = connectDB;