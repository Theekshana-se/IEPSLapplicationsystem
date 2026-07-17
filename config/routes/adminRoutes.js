const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadPaymentProof, handleUploadError } = require('../middleware/uploadMiddleware');
const {
    getPendingRegistrations, getAllMembers, getMemberDetails,
    sendMemberActivation, sendImportedMemberActivations,
    approveMember, rejectMember, getStatistics
} = require('../controllers/adminController');
const {
    getPaymentSummary, getPayments, verifyPayment, sendRenewalReminders
} = require('../controllers/paymentController');
const {
    getCategories, createCategory, updateCategory, deleteCategory, assignMemberCategory,
    getUpdateRequests, reviewUpdateRequest, getStandardAdmins, createStandardAdmin
} = require('../controllers/managementController');

const router = express.Router();
router.use(protect);

// Super admin is intentionally isolated from all standard administration data.
router.get('/administrators', restrictTo('super_admin'), getStandardAdmins);
router.post('/administrators', restrictTo('super_admin'), [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    validate
], createStandardAdmin);

router.use(restrictTo('admin', 'reviewer'));

router.get('/statistics', getStatistics);
router.get('/payments/summary', getPaymentSummary);
router.get('/payments', getPayments);
router.patch('/payments/:paymentId/verify', restrictTo('admin'), verifyPayment);
router.post('/payments/send-renewal-reminders', restrictTo('admin'), sendRenewalReminders);

router.get('/pending-registrations', getPendingRegistrations);
router.get('/members', getAllMembers);
router.post('/members/send-activation-links', restrictTo('admin'), sendImportedMemberActivations);
router.get('/member/:id', getMemberDetails);
router.post('/member/:id/send-activation', restrictTo('admin'), sendMemberActivation);
router.put('/member/:id/approve', restrictTo('admin'), [body('notes').optional(), validate], approveMember);
router.put('/member/:id/reject', restrictTo('admin'), [
    body('reason').notEmpty().withMessage('Rejection reason is required'), validate
], rejectMember);

router.get('/member-categories', getCategories);
router.post('/member-categories', restrictTo('admin'), [
    body('name').trim().notEmpty().withMessage('Category name is required'), validate
], createCategory);
router.patch('/member-categories/:categoryId', restrictTo('admin'), updateCategory);
router.delete('/member-categories/:categoryId', restrictTo('admin'), deleteCategory);
router.patch('/members/:memberId/category', restrictTo('admin'), assignMemberCategory);

router.get('/profile-update-requests', getUpdateRequests);
router.patch('/profile-update-requests/:requestId', restrictTo('admin'), [
    body('decision').isIn(['approved', 'rejected']).withMessage('Valid decision is required'), validate
], reviewUpdateRequest);

module.exports = router;
