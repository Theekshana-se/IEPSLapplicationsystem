const crypto = require('crypto');
const Member = require('../models/Member');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const generateMembershipId = require('../utils/generateMembershipId');
const { sendApprovalEmail, sendRejectionEmail, sendAccountActivationEmail } = require('../utils/emailService');
const { serializeMember } = require('../utils/serializeMember');
const { buildRenewalOverview } = require('../utils/paymentTracking');

const RESET_TOKEN_EXPIRES_MS = 24 * 60 * 60 * 1000;

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function buildActivationUrl(token) {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    return `${frontendUrl}/activate/${token}`;
}

function createActivationToken(member) {
    const token = crypto.randomBytes(32).toString('hex');
    member.passwordResetToken = hashResetToken(token);
    member.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);
    return token;
}

function isDeliverableMemberEmail(member) {
    const email = member?.personalDetails?.personalEmail;
    return Boolean(email && !email.endsWith('@iepsl.local'));
}

// @desc    Get all pending registrations
// @route   GET /api/admin/pending-registrations
// @access  Private (Admin)
exports.getPendingRegistrations = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = {
            status: 'pending',
            submittedAt: { $exists: true }
        };

        // Add search functionality
        if (search) {
            query.$or = [
                { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
                { 'personalDetails.nameWithInitials': { $regex: search, $options: 'i' } },
                { 'personalDetails.nicNumber': { $regex: search, $options: 'i' } },
                { 'personalDetails.personalEmail': { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Member.countDocuments(query);
        const members = await Member.find(query)
            .populate('category', 'name description isActive')
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('personalDetails officeDetails submittedAt registrationProgress');

        res.status(200).json({
            success: true,
            data: {
                members,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all members
// @route   GET /api/admin/members
// @access  Private (Admin)
exports.getAllMembers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;

        const query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Add search functionality
        if (search) {
            query.$or = [
                { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
                { 'personalDetails.nameWithInitials': { $regex: search, $options: 'i' } },
                { 'personalDetails.nicNumber': { $regex: search, $options: 'i' } },
                { membershipId: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Member.countDocuments(query);
        const members = await Member.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('personalDetails membershipId status category createdAt registrationProgress')
            .populate('category', 'name description isActive');

        res.status(200).json({
            success: true,
            data: {
                members,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get member details
// @route   GET /api/admin/member/:id
// @access  Private (Admin)
exports.getMemberDetails = async (req, res, next) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { member: serializeMember(member) }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send one member an account activation link
// @route   POST /api/admin/member/:id/send-activation
// @access  Private (Admin - admin, super_admin)
exports.sendMemberActivation = async (req, res, next) => {
    try {
        const member = await Member.findById(req.params.id).populate('category', 'name description isActive');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        if (!isDeliverableMemberEmail(member)) {
            return res.status(400).json({
                success: false,
                message: 'This member does not have a deliverable email address. Update their email before sending activation.'
            });
        }

        const token = createActivationToken(member);
        await member.save();

        const activationUrl = buildActivationUrl(token);
        let emailSent = false;
        let emailError = '';

        try {
            await sendAccountActivationEmail(
                member.personalDetails.personalEmail,
                member.personalDetails.nameWithInitials || member.personalDetails.fullName,
                activationUrl
            );
            emailSent = true;
        } catch (error) {
            emailError = error.message;
            console.error('Error sending activation email:', error);
        }

        await Notification.create({
            recipientId: member._id,
            recipientType: 'member',
            type: 'account_activation',
            title: 'Account Activation Link Created',
            message: 'An IEPSL account activation link was created for your member account.',
            metadata: {
                emailSent,
                expiresAt: member.passwordResetExpires
            }
        });

        res.status(200).json({
            success: true,
            message: emailSent
                ? 'Activation email sent successfully.'
                : 'Activation link created, but email delivery failed. Check email settings before deployment.',
            data: {
                memberId: member._id,
                email: member.personalDetails.personalEmail,
                emailSent,
                emailError,
                activationUrl,
                expiresAt: member.passwordResetExpires
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send activation links to imported members with real emails
// @route   POST /api/admin/members/send-activation-links
// @access  Private (Admin - admin, super_admin)
exports.sendImportedMemberActivations = async (req, res, next) => {
    try {
        const limit = Math.min(Number(req.body.limit) || 500, 500);
        const members = await Member.find({
            legacyImport: { $exists: true },
            'personalDetails.personalEmail': { $not: /@iepsl\.local$/i }
        }).limit(limit);

        const results = [];

        for (const member of members) {
            const token = createActivationToken(member);
            await member.save();

            const activationUrl = buildActivationUrl(token);
            let emailSent = false;
            let emailError = '';

            try {
                await sendAccountActivationEmail(
                    member.personalDetails.personalEmail,
                    member.personalDetails.nameWithInitials || member.personalDetails.fullName,
                    activationUrl
                );
                emailSent = true;
            } catch (error) {
                emailError = error.message;
                console.error(`Error sending activation email to ${member.personalDetails.personalEmail}:`, error);
            }

            results.push({
                memberId: member._id,
                membershipId: member.membershipId,
                email: member.personalDetails.personalEmail,
                emailSent,
                emailError,
                activationUrl,
                expiresAt: member.passwordResetExpires
            });
        }

        res.status(200).json({
            success: true,
            message: `Activation links created for ${results.length} imported members.`,
            data: {
                total: results.length,
                sent: results.filter((item) => item.emailSent).length,
                failed: results.filter((item) => !item.emailSent).length,
                skippedFallbackEmails: await Member.countDocuments({
                    legacyImport: { $exists: true },
                    'personalDetails.personalEmail': /@iepsl\.local$/i
                }),
                results
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve member registration
// @route   PUT /api/admin/member/:id/approve
// @access  Private (Admin - admin, super_admin)
exports.approveMember = async (req, res, next) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        if (member.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve member with status: ${member.status}`
            });
        }

        // Generate membership ID
        const membershipId = await generateMembershipId();

        // Update member
        member.status = 'active';
        member.membershipId = membershipId;
        member.reviewedBy = req.user._id;
        member.reviewedAt = new Date();
        member.reviewNotes = req.body.notes || '';

        await member.save();

        // Send approval email
        sendApprovalEmail(
            member.personalDetails.personalEmail,
            member.personalDetails.nameWithInitials,
            membershipId
        ).catch(err => console.error('Error sending approval email:', err));

        // Create notification for member
        await Notification.create({
            recipientId: member._id,
            recipientType: 'member',
            type: 'application_approved',
            title: 'Application Approved!',
            message: `Congratulations! Your membership application has been approved. Your membership ID is ${membershipId}`,
            metadata: { membershipId }
        });

        res.status(200).json({
            success: true,
            message: 'Member approved successfully',
            data: {
                member: {
                    id: member._id,
                    membershipId: member.membershipId,
                    status: member.status
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject member registration
// @route   PUT /api/admin/member/:id/reject
// @access  Private (Admin - admin, super_admin)
exports.rejectMember = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        if (member.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject member with status: ${member.status}`
            });
        }

        // Update member
        member.status = 'rejected';
        member.reviewedBy = req.user._id;
        member.reviewedAt = new Date();
        member.reviewNotes = reason || '';

        await member.save();

        // Send rejection email
        sendRejectionEmail(
            member.personalDetails.personalEmail,
            member.personalDetails.nameWithInitials,
            reason
        ).catch(err => console.error('Error sending rejection email:', err));

        // Create notification for member
        await Notification.create({
            recipientId: member._id,
            recipientType: 'member',
            type: 'application_rejected',
            title: 'Application Status Update',
            message: 'Your membership application has been reviewed. Please check your email for details.',
            metadata: { reason }
        });

        res.status(200).json({
            success: true,
            message: 'Member rejected',
            data: {
                member: {
                    id: member._id,
                    status: member.status
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin)
exports.getStatistics = async (req, res, next) => {
    try {
        const totalMembers = await Member.countDocuments({ status: { $in: ['approved', 'active'] } });
        const pendingApplications = await Member.countDocuments({ status: 'pending', submittedAt: { $exists: true } });
        const activeMembers = await Member.countDocuments({ status: 'active' });
        const rejectedApplications = await Member.countDocuments({ status: 'rejected' });
        const payments = await Payment.find().lean();
        const renewalOverview = await buildRenewalOverview();

        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await Member.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        const membersByDistrict = await Member.aggregate([
            {
                $group: {
                    _id: '$personalDetails.district',
                    count: { $sum: 1 }
                }
            },
            { $project: { _id: 0, district: '$_id', count: 1 } },
            { $sort: { count: -1, district: 1 } }
        ]);

        const monthlyRegistrations = await Member.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%b', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $project: { _id: 0, month: '$_id', count: 1 } }
        ]);

        const totalPaymentReceived = payments
            .filter((payment) => payment.paymentStatus === 'completed')
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                totalMembers,
                pendingApplications,
                activeMembers,
                rejectedApplications,
                recentRegistrations,
                membersByDistrict,
                monthlyRegistrations,
                pendingPaymentVerifications: payments.filter((payment) => payment.paymentStatus === 'pending').length,
                renewalDueCount: renewalOverview.dueMembers.length,
                totalPaymentReceived
            }
        });
    } catch (error) {
        next(error);
    }
};
