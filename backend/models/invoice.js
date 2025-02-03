const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: Number,
        required: true,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    taxRate: {
        type: Number,
        required: true,
        default: 13,
        min: 0,
        max: 100
    },
    taxAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    dueDate: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastInvoice = await this.constructor.findOne({}, {}, { sort: { 'invoiceNumber': -1 } });
        this.invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1000;
    }
    next();
});

// Virtual field for formatted invoice number
invoiceSchema.virtual('formattedInvoiceNumber').get(function () {
    return `INV-${this.invoiceNumber.toString().padStart(4, '0')}`;
});

// Method to calculate totals
invoiceSchema.methods.calculateTotals = function () {
    this.subtotal = this.products.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
    }, 0);

    this.taxAmount = (this.subtotal * this.taxRate) / 100;
    this.total = this.subtotal + this.taxAmount;

    return {
        subtotal: this.subtotal,
        taxAmount: this.taxAmount,
        total: this.total
    };
};

// Middleware to calculate totals before saving
invoiceSchema.pre('save', function (next) {
    this.calculateTotals();
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);