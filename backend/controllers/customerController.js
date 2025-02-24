const { z } = require('zod');
const Customer = require('../models/customer');

const { AppError } = require('../middlewares/ErrorHandler');

// Zod validation schema remains the same
const customerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
});

// Create customer
exports.createCustomer = async (req, res, next) => {
    try {
        const validatedData = customerSchema.parse(req.body);

        // Check if customer with same email already exists
        const existingCustomer = await Customer.findOne({
            email: validatedData.email,
            user: req.user._id
        });

        if (existingCustomer) {
            return next(new AppError('Customer with this email already exists', 400));
        }

        const customer = new Customer({
            ...validatedData,
            user: req.user._id
        });
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new AppError(error.errors[0].message, 400));
        }
        // Handle MongoDB specific errors
        if (error.code === 11000) {
            return next(new AppError('Duplicate key error - this customer already exists', 400));
        }
        // Log the actual error for debugging
        console.error('Customer creation error:', error);
        next(new AppError(error.message || 'Error creating customer', 500));
    }
};

// Get all customers for a user
exports.getCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find({ user: req.user._id });
        res.json(customers);
    } catch (error) {
        next(new AppError('Error fetching customers', 500));
    }
};

// Get single customer
exports.getCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }
        res.json(customer);
    } catch (error) {
        next(new AppError('Error fetching customer', 500));
    }
};

// Update customer
exports.updateCustomer = async (req, res, next) => {
    try {
        const validatedData = customerSchema.parse(req.body);
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            validatedData,
            { new: true }
        );
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }
        res.json(customer);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new AppError(error.errors[0].message, 400));
        }
        next(new AppError('Error updating customer', 500));
    }
};

// Delete customer
exports.deleteCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        next(new AppError('Error deleting customer', 500));
    }
};