const mongoose = require('mongoose');

const memberUpdateRequestSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
        index: true
    },
    proposedChanges: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    reviewedAt: Date,
    reviewNotes: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

memberUpdateRequestSchema.index({ memberId: 1, status: 1 });

module.exports = mongoose.model('MemberUpdateRequest', memberUpdateRequestSchema);
