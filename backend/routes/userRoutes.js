const express = require('express');
const { protect } = require('../middlewares/authMiddlewares');

const router = express.Router();
const {
    register,
    login,
    getProfile,
    updateProfile,
    deleteUser
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/login', login);

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteUser);

module.exports = router;