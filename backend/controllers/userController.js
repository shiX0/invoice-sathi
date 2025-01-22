const { z, ZodError } = require('zod');
const User = require('../models/user');
const { AppError } = require('../utils/errorHandler');

// Zod validation schemas
const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

exports.register = async (req, res, next) => {
    try {
        const validated = registerSchema.parse(req.body);
        const userExists = await User.findOne({ email: validated.email });

        if (userExists) {
            return next(new AppError('User already exists', 400));
        }
        const user = await User.create({
            firstName: validated.firstName,
            lastName: validated.lastName,
            email: validated.email,
            password: validated.password,
        });

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                },
            }
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return next(new AppError(error.errors[0].message, 400));
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const validated = loginSchema.parse(req.body);
        const user = await User.findOne({ email: validated.email }).select('+password');

        if (!user || !(await user.matchPassword(validated.password))) {
            return next(new AppError('Invalid credentials', 401));
        }

        const token = user.getSignedJwtToken();

        // send token in cookie
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        };
        // send token in cookie
        res.cookie('jwt', token, cookieOptions);
        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                },
            }
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return next(new AppError(error.errors[0].message, 400));
        }
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        // Validate update data
        const updateSchema = z.object({
            firstName: z.string().min(1).optional(),
            lastName: z.string().min(1).optional(),
        });

        const validated = updateSchema.parse(req.body);

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            validated,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return next(new AppError(error.errors[0].message, 400));
        }
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// exports.forgotPassword = async (req, res, next) => {
//     try {
//         const email = req.body.email;
//         const user = await User.findOne({ email });

//         if (!user) {
//             return next(new AppError('There is no user with that email address', 404));
//         }

//         // Generate reset token
//         const resetToken = user.createPasswordResetToken();
//         await user.save({ validateBeforeSave: false });

//         // Send response
//         res.status(200).json({
//             status: 'success',
//             message: 'Token sent to email',
//         });
//         // TODO: Send email with reset token

//     } catch (error) {
//         next(error);
//     }
// };
