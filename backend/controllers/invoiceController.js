const { z } = require('zod');
const Product = require('../models/product');
const { AppError } = require('../middlewares/ErrorHandler');

const invoiceSchema = z.object({
    customer: z.string().min(1, "Customer ID is required"),
    products: z.array(z.object({
        product: z.string().min(1, "Product ID is required"),
        quantity: z.number().positive("Quantity must be positive")
    })),
    dueDate: z.string().datetime().optional(),
    status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
});

// Create new invoice
exports.createInvoice = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const validatedData = invoiceSchema.parse(req.body);

        const productIds = validatedData.products.map(p => p.product);
        const existingProducts = await Product.find({ _id: { $in: productIds } });

        if (existingProducts.length !== productIds.length) {
            throw new AppError('One or more products not found', 400);
        }

        for (const orderItem of validatedData.products) {
            const product = existingProducts.find(p => p._id.toString() === orderItem.product);
            if (product.stock < orderItem.quantity) {
                throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
            }

            await Product.findByIdAndUpdate(
                orderItem.product,
                { $inc: { stock: -orderItem.quantity } },
                { session }
            );
        }

        const invoice = await Invoice.create([{
            ...validatedData,
            user: req.user._id
        }], { session });

        await session.commitTransaction();

        res.status(201).json({
            status: 'success',
            data: invoice[0]
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// Get all invoices
exports.getAllInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.find({ user: req.user._id })
            .populate('customer')
            .populate('products.product');

        res.status(200).json({
            status: 'success',
            results: invoices.length,
            data: invoices
        });
    } catch (error) {
        next(error);
    }
};

// Get single invoice
exports.getInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('customer').populate('products.product');

        if (!invoice) {
            return next(new AppError('No invoice found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: invoice
        });
    } catch (error) {
        next(error);
    }
};

// Update invoice
exports.updateInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );

        if (!invoice) {
            return next(new AppError('No invoice found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: invoice
        });
    } catch (error) {
        next(error);
    }
};

// Delete invoice
exports.deleteInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!invoice) {
            return next(new AppError('No invoice found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['pending', 'paid', 'overdue'].includes(status)) {
            return next(new AppError('Invalid payment status', 400));
        }

        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status },
            { new: true }
        );

        if (!invoice) {
            return next(new AppError('No invoice found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: invoice
        });
    } catch (error) {
        next(error);
    }
};
