const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false  // Optional for admin-wide notifications
    },
    recipientType: {
        type: String,
        enum: ['member', 'admin'],
        required: true
    },

    type: {
        type: String,
        enum: [
            'registration_submitted',
            'application_approved',
            'application_rejected',
            'payment_received',
            'payment_verified',
            'renewal_reminder',
            'payment_pending',
            'profile_updated',
            'profile_update_requested',
            'profile_update_approved',
            'profile_update_rejected',
            'document_uploaded',
            'account_activation'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },

    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,

    // Optional metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
