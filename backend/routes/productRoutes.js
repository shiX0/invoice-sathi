const express = require('express');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} = require('../controllers/productController');

// All routes protected
router.use(protect);

// Protected routes for all authenticated users
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;