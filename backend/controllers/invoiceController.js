const { z } = require('zod');
const Product = require('../models/product');
const { AppError } = require('../middlewares/ErrorHandler');
const Invoice = require('../models/invoice');
const Customer = require('../models/customer');
const mongoose = require('mongoose');

const invoiceSchema = z.object({
    customer: z.string().min(1, "Customer ID is required"),
    products: z.array(z.object({
        product: z.string().min(1, "Product ID is required"),
        quantity: z.number().positive("Quantity must be positive")
    })).min(1, "At least one product is required"),
    dueDate: z.string(),
    status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
    taxRate: z.number().min(0).max(100).default(13),
});

// Create new invoice
exports.createInvoice = async (req, res, next) => {
    try {
        // Parse and validate the request data
        const validatedData = invoiceSchema.parse(req.body);

        // Check if customer exists
        const customer = await Customer.findById(validatedData.customer);
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Check if all products exist and have sufficient stock
        const productIds = validatedData.products.map(p => p.product);
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length !== productIds.length) {
            return next(new AppError('One or more products not found', 404));
        }

        // Format products with prices
        const productsWithPrices = validatedData.products.map(orderItem => {
            const product = products.find(p => p._id.toString() === orderItem.product);
            return {
                product: orderItem.product,
                quantity: orderItem.quantity,
                price: product.price // Add the product price
            };
        });

        // Calculate totals
        let subtotal = 0;
        for (const item of productsWithPrices) {
            subtotal += item.price * item.quantity;
        }

        // Calculate tax and total
        const taxRate = validatedData.taxRate || 13;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        // Get the last invoice number
        const lastInvoice = await Invoice.findOne({}, {}, { sort: { 'invoiceNumber': -1 } });
        const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1000;

        // Create the invoice with all required fields
        const invoice = await Invoice.create({
            invoiceNumber,
            customer: validatedData.customer,
            products: productsWithPrices,
            dueDate: validatedData.dueDate,
            status: validatedData.status,
            user: req.user._id,
            subtotal,
            taxRate,
            taxAmount,
            total
        });

        // Update product quantities
        for (const orderItem of validatedData.products) {
            await Product.findByIdAndUpdate(
                orderItem.product,
                { $inc: { quantity: -orderItem.quantity } }
            );
        }

        // Populate the response data
        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate('customer')
            .populate('products.product');

        res.status(201).json({
            status: 'success',
            data: populatedInvoice
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new AppError(error.errors[0].message, 400));
        }
        next(error);
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
