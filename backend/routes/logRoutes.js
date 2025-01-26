const express = require('express');
const { protect, isAdmin } = require('../middlewares/authMiddlewares');
const { getLogs } = require('../controllers/logController');

const router = express.Router();

// Protect all routes and require admin access
router.use(protect);
router.use(isAdmin);

router.get('/', getLogs);

module.exports = router; 