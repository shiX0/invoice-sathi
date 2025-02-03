const Product = require('../models/product');
const { AppError } = require('../middlewares/ErrorHandler');
const { z } = require('zod');
const upload = require('../utils/multer'); // Import multer setup

// Validation schemas
const productSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().min(0),
    category: z.enum(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Food', 'Other']),
    imageUrl: z.string().url().optional()
});

// Create Product
exports.createProduct = [
    upload.single('productImage'), // Use multer to handle file upload
    async (req, res, next) => {
        try {
            const data = {
                ...req.body,
                price: parseFloat(req.body.price),
                quantity: parseInt(req.body.quantity, 10)
            };

            const validatedData = productSchema.parse(data);
            if (req.file) {
                validatedData.imageUrl = `/uploads/${req.file.filename}`;
            }
            const product = await Product.create({ ...validatedData, user: req.user._id });
            res.status(201).json({
                status: 'success',
                data: product
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new AppError(error.errors[0].message, 400));
            }
            next(error);
        }
    }
];

// Get All Products with Pagination
exports.getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = Product.find({ user: req.user._id })
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        const [products, total] = await Promise.all([
            query.exec(),
            Product.countDocuments({ user: req.user._id })
        ]);

        res.status(200).json({
            status: 'success',
            results: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// Get Single Product
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// Update Product
exports.updateProduct = [
    upload.single('productImage'), // Use multer to handle file upload
    async (req, res, next) => {
        try {
            const validatedData = productSchema.partial().parse(req.body);
            if (req.file) {
                validatedData.imageUrl = `/uploads/${req.file.filename}`;
            }
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                validatedData,
                { new: true, runValidators: true }
            );
            if (!product) {
                return next(new AppError('Product not found', 404));
            }
            res.status(200).json({
                status: 'success',
                data: product
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new AppError(error.errors[0].message, 400));
            }
            next(error);
        }
    }
];

// Delete Product
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Delete the image file if it exists
        if (product.imageUrl) {
            deleteFile(product.imageUrl);
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Search Products
exports.searchProducts = async (req, res, next) => {
    try {
        const { query } = req.query;
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};