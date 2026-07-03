const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/authMiddleware');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { serializeMember } = require('../utils/serializeMember');

const RESET_TOKEN_EXPIRES_MS = 24 * 60 * 60 * 1000;

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function buildPasswordResetUrl(token) {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    return `${frontendUrl}/activate/${token}`;
}

function createPasswordResetToken(member) {
    const token = crypto.randomBytes(32).toString('hex');
    member.passwordResetToken = hashResetToken(token);
    member.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);
    return token;
}

// @desc    Register new member (Step 1 - Initial registration)
// @route   POST /api/auth/register
// @access  Public
exports.registerMember = async (req, res, next) => {
    try {
        const {
            nameWithInitials,
            fullName,
            dateOfBirth,
            nicNumber,
            nationality,
            gender,
            district,
            residentialAddress,
            mobileNumber,
            personalEmail,
            password
        } = req.body;

        // Check if member already exists
        const existingMember = await Member.findOne({
            $or: [
                { 'personalDetails.personalEmail': personalEmail.toLowerCase() },
                { 'personalDetails.nicNumber': nicNumber }
            ]
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'Member with this email or NIC number already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new member
        const member = await Member.create({
            personalDetails: {
                nameWithInitials,
                fullName,
                dateOfBirth,
                nicNumber,
                nationality: nationality || 'Sri Lankan',
                gender,
                district,
                residentialAddress,
                mobileNumber,
                personalEmail: personalEmail.toLowerCase()
            },
            password: hashedPassword,
            currentStep: 1,
            completedSteps: [1],
            registrationProgress: 12.5 // 1/8 steps completed
        });

        // Generate token
        const token = generateToken(member._id, 'member');

        // Send welcome email (don't wait for it)
        sendWelcomeEmail(personalEmail, nameWithInitials).catch(err =>
            console.error('Error sending welcome email:', err)
        );

        res.status(201).json({
            success: true,
            message: 'Registration started successfully',
            data: {
                member: {
                    id: member._id,
                    nameWithInitials: member.personalDetails.nameWithInitials,
                    email: member.personalDetails.personalEmail,
                    currentStep: member.currentStep,
                    registrationProgress: member.registrationProgress
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login member or admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password, userType } = req.body;

        if (!email || !password || !userType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, password, and user type'
            });
        }

        let user;
        let type;

        if (userType === 'member') {
            user = await Member.findOne({
                'personalDetails.personalEmail': email.toLowerCase()
            }).select('+password');
            type = 'member';
        } else if (userType === 'admin') {
            user = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
            type = 'admin';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if admin is active
        if (type === 'admin' && !user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id, type);

        // Prepare response data
        let responseData = {
            id: user._id,
            email: type === 'member' ? user.personalDetails.personalEmail : user.email,
            userType: type
        };

        if (type === 'member') {
            responseData = {
                ...responseData,
                nameWithInitials: user.personalDetails.nameWithInitials,
                status: user.status,
                membershipId: user.membershipId,
                currentStep: user.currentStep,
                registrationProgress: user.registrationProgress
            };
        } else {
            responseData = {
                ...responseData,
                username: user.username,
                role: user.role
            };
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: responseData,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Request password reset for a member account
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        const member = await Member.findOne({
            'personalDetails.personalEmail': email
        });

        // Avoid exposing whether an email exists in the system.
        if (!member || email.endsWith('@iepsl.local')) {
            return res.status(200).json({
                success: true,
                message: 'If this email exists, a password reset link will be sent.'
            });
        }

        const token = createPasswordResetToken(member);
        await member.save();

        const resetUrl = buildPasswordResetUrl(token);
        await sendPasswordResetEmail(
            member.personalDetails.personalEmail,
            member.personalDetails.nameWithInitials || member.personalDetails.fullName,
            resetUrl
        );

        res.status(200).json({
            success: true,
            message: 'If this email exists, a password reset link will be sent.'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Validate an activation/reset token
// @route   GET /api/auth/reset-password/:token
// @access  Public
exports.validatePasswordResetToken = async (req, res, next) => {
    try {
        const member = await Member.findOne({
            passwordResetToken: hashResetToken(req.params.token),
            passwordResetExpires: { $gt: new Date() }
        });

        if (!member) {
            return res.status(400).json({
                success: false,
                message: 'This password setup link is invalid or has expired.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                member: {
                    name: member.personalDetails.nameWithInitials || member.personalDetails.fullName,
                    email: member.personalDetails.personalEmail,
                    membershipId: member.membershipId
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Set member password using activation/reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.'
            });
        }

        const member = await Member.findOne({
            passwordResetToken: hashResetToken(req.params.token),
            passwordResetExpires: { $gt: new Date() }
        }).select('+password');

        if (!member) {
            return res.status(400).json({
                success: false,
                message: 'This password setup link is invalid or has expired.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        member.password = await bcrypt.hash(password, salt);
        member.passwordResetToken = undefined;
        member.passwordResetExpires = undefined;
        member.isEmailVerified = true;
        await member.save();

        const token = generateToken(member._id, 'member');

        res.status(200).json({
            success: true,
            message: 'Password set successfully',
            data: {
                token,
                user: {
                    id: member._id,
                    email: member.personalDetails.personalEmail,
                    userType: 'member',
                    nameWithInitials: member.personalDetails.nameWithInitials,
                    status: member.status,
                    membershipId: member.membershipId,
                    currentStep: member.currentStep,
                    registrationProgress: member.registrationProgress
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        let user;

        if (req.userType === 'member') {
            user = await Member.findById(req.user._id);
        } else {
            user = await Admin.findById(req.user._id);
        }

        res.status(200).json({
            success: true,
            data: {
                user: req.userType === 'member' ? serializeMember(user) : user,
                userType: req.userType
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        // In a stateless JWT system, logout is handled client-side by removing the token
        // This endpoint is mainly for logging purposes

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};
