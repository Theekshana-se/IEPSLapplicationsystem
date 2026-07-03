const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadPaymentProof, handleUploadError } = require('../middleware/uploadMiddleware');
const {
    getPendingRegistrations,
    getAllMembers,
    getMemberDetails,
    sendMemberActivation,
    sendImportedMemberActivations,
    approveMember,
    rejectMember,
    getStatistics
} = require('../controllers/adminController');
const {
    getPaymentSummary,
    getPayments,
    recordPayment,
    verifyPayment,
    sendRenewalReminders
} = require('../controllers/paymentController');

// All routes require admin authentication
router.use(protect);
router.use(restrictTo('admin', 'super_admin', 'reviewer'));

// Statistics
router.get('/statistics', getStatistics);
router.get('/payments/summary', getPaymentSummary);
router.get('/payments', getPayments);
router.post(
    '/payments',
    restrictTo('admin', 'super_admin'),
    uploadPaymentProof,
    handleUploadError,
    recordPayment
);
router.patch(
    '/payments/:paymentId/verify',
    restrictTo('admin', 'super_admin'),
    verifyPayment
);
router.post(
    '/payments/send-renewal-reminders',
    restrictTo('admin', 'super_admin'),
    sendRenewalReminders
);

// Pending registrations
router.get('/pending-registrations', getPendingRegistrations);

// All members
router.get('/members', getAllMembers);
router.post(
    '/members/send-activation-links',
    restrictTo('admin', 'super_admin'),
    sendImportedMemberActivations
);

// Member details
router.get('/member/:id', getMemberDetails);
router.post(
    '/member/:id/send-activation',
    restrictTo('admin', 'super_admin'),
    sendMemberActivation
);

// Approve member (admin and super_admin only)
router.put('/member/:id/approve',
    restrictTo('admin', 'super_admin'),
    [
        body('notes').optional(),
        validate
    ],
    approveMember
);

// Reject member (admin and super_admin only)
router.put('/member/:id/reject',
    restrictTo('admin', 'super_admin'),
    [
        body('reason').notEmpty().withMessage('Rejection reason is required'),
        validate
    ],
    rejectMember
);

module.exports = router;
