const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    businessInfo: {
        name: {
            type: String,
            default: 'Invoice System'
        },
        address: {
            type: String,
            default: '123 Business Street'
        },
        city: {
            type: String,
            default: 'Kathmandu'
        },
        country: {
            type: String,
            default: 'Nepal'
        },
        email: {
            type: String,
            default: 'info@invoicesystem.com'
        },
        phone: {
            type: String,
            default: '+977 987654321'
        }
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    passwordHistory: [{
        password: String,
        changedAt: Date
    }],
    lastPasswordChange: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Add current password to history
    this.passwordHistory.push({ password: this.password, changedAt: new Date() });
    if (this.passwordHistory.length > 3) {
        this.passwordHistory.shift(); // Keep only the last 3 passwords
    }

    // Update last password change date
    this.lastPasswordChange = new Date();
    next();
});

userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Check if the new password is different from the last three passwords
userSchema.methods.isPasswordUnique = async function (newPassword) {
    for (const entry of this.passwordHistory) {
        const isSame = await bcrypt.compare(newPassword, entry.password);
        if (isSame) return false;
    }
    return true;
};

module.exports = mongoose.model('User', userSchema);