const User = require('../models/user');
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(401).json({ message: 'Not authorized as an admin' });
};

module.exports = { protect, isAdmin };