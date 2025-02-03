const express = require('express');
const { protect } = require('../middlewares/authMiddlewares');
const {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} = require('../controllers/productController');

const router = express.Router();

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