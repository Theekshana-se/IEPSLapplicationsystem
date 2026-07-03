const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    membershipId: {
        type: String,
        required: true
    },

    paymentType: {
        type: String,
        enum: ['registration', 'annual', 'renewal'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentYear: Number,
    dueDate: Date,
    currency: {
        type: String,
        default: 'LKR'
    },

    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'card', 'cash'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },

    transactionId: String,
    receiptNumber: String,
    paymentProof: String, // File path to uploaded proof
    paymentProofDetails: {
        path: String,
        originalName: String,
        mimeType: String,
        size: Number,
        bytes: Number,
        provider: String,
        publicId: String,
        assetId: String,
        resourceType: String,
        format: String,
        uploadedAt: Date
    },

    paidAt: Date,
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    verifiedAt: Date,
    verificationNotes: String,
    reminderSentAt: Date,
    reminderSentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    notes: String,
    metadata: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

// Indexes
paymentSchema.index({ memberId: 1 });
paymentSchema.index({ membershipId: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ paymentYear: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
