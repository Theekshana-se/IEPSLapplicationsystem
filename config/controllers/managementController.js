const Member = require('../models/Member');
const MemberCategory = require('../models/MemberCategory');
const MemberUpdateRequest = require('../models/MemberUpdateRequest');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');

const allowedPersonalFields = [
    'prefix', 'nameWithInitials', 'fullName', 'dateOfBirth', 'nicNumber',
    'nationality', 'gender', 'district', 'residentialAddress', 'mobileNumber',
    'personalEmail'
];
const allowedOfficeFields = [
    'officeAddress', 'officePhone', 'officeEmail', 'preferredCommunication'
];
const allowedTopLevelFields = [
    'workExperience', 'environmentalWorkExperience', 'education',
    'certifications', 'references'
];

function pickFields(source, fields) {
    return fields.reduce((result, field) => {
        if (source && Object.prototype.hasOwnProperty.call(source, field)) {
            result[field] = source[field];
        }
        return result;
    }, {});
}

function sanitizeChanges(body) {
    const changes = {};
    const personalDetails = pickFields(body.personalDetails, allowedPersonalFields);
    const officeDetails = pickFields(body.officeDetails, allowedOfficeFields);

    if (Object.keys(personalDetails).length) changes.personalDetails = personalDetails;
    if (Object.keys(officeDetails).length) changes.officeDetails = officeDetails;

    allowedTopLevelFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(body, field)) changes[field] = body[field];
    });

    return changes;
}

function applyChanges(member, changes) {
    Object.entries(changes.personalDetails || {}).forEach(([field, value]) => {
        member.set(`personalDetails.${field}`, value);
    });
    Object.entries(changes.officeDetails || {}).forEach(([field, value]) => {
        member.set(`officeDetails.${field}`, value);
    });
    allowedTopLevelFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(changes, field)) member.set(field, changes[field]);
    });
}

exports.submitMyUpdateRequest = async (req, res, next) => {
    try {
        if (req.userType !== 'member') {
            return res.status(403).json({ success: false, message: 'Only members can request profile changes.' });
        }

        const proposedChanges = sanitizeChanges(req.body);
        if (!Object.keys(proposedChanges).length) {
            return res.status(400).json({ success: false, message: 'No supported profile changes were provided.' });
        }

        const existing = await MemberUpdateRequest.findOne({ memberId: req.user._id, status: 'pending' });
        if (existing) {
            return res.status(409).json({ success: false, message: 'You already have a profile update awaiting approval.' });
        }

        const request = await MemberUpdateRequest.create({ memberId: req.user._id, proposedChanges });
        await Notification.create({
            recipientType: 'admin',
            type: 'profile_update_requested',
            title: 'Member Profile Update Requested',
            message: `${req.user.personalDetails.nameWithInitials} submitted registration detail changes for review.`,
            metadata: { memberId: req.user._id, updateRequestId: request._id }
        });

        res.status(201).json({ success: true, message: 'Changes submitted for admin approval.', data: request });
    } catch (error) {
        next(error);
    }
};

exports.getMyUpdateRequests = async (req, res, next) => {
    try {
        if (req.userType !== 'member') {
            return res.status(403).json({ success: false, message: 'Only members can access this route.' });
        }
        const requests = await MemberUpdateRequest.find({ memberId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

exports.getUpdateRequests = async (req, res, next) => {
    try {
        const query = req.query.status ? { status: req.query.status } : {};
        const requests = await MemberUpdateRequest.find(query)
            .populate('memberId', 'membershipId personalDetails status')
            .populate('reviewedBy', 'username email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

exports.reviewUpdateRequest = async (req, res, next) => {
    try {
        const request = await MemberUpdateRequest.findById(req.params.requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Update request not found.' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'This request has already been reviewed.' });

        const decision = req.body.decision;
        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Decision must be approved or rejected.' });
        }

        const member = await Member.findById(request.memberId);
        if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

        if (decision === 'approved') {
            const newEmail = request.proposedChanges?.personalDetails?.personalEmail;
            const newNic = request.proposedChanges?.personalDetails?.nicNumber;
            const duplicateQuery = [];
            if (newEmail) duplicateQuery.push({ 'personalDetails.personalEmail': String(newEmail).toLowerCase() });
            if (newNic) duplicateQuery.push({ 'personalDetails.nicNumber': newNic });
            if (duplicateQuery.length) {
                const duplicate = await Member.findOne({ _id: { $ne: member._id }, $or: duplicateQuery });
                if (duplicate) return res.status(409).json({ success: false, message: 'The requested email or NIC is already used by another member.' });
            }

            applyChanges(member, request.proposedChanges);
            await member.save();
        }

        request.status = decision;
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        request.reviewNotes = req.body.notes || '';
        await request.save();

        await Notification.create({
            recipientId: member._id,
            recipientType: 'member',
            type: decision === 'approved' ? 'profile_update_approved' : 'profile_update_rejected',
            title: decision === 'approved' ? 'Profile Changes Approved' : 'Profile Changes Rejected',
            message: decision === 'approved'
                ? 'Your requested registration detail changes are now live.'
                : `Your requested registration detail changes were not approved.${request.reviewNotes ? ` ${request.reviewNotes}` : ''}`,
            metadata: { updateRequestId: request._id }
        });

        res.json({ success: true, message: `Profile update ${decision}.`, data: request });
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await MemberCategory.find().sort({ name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
    try {
        const category = await MemberCategory.create({
            name: req.body.name,
            description: req.body.description || '',
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, message: 'Member category created.', data: category });
    } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const category = await MemberCategory.findByIdAndUpdate(
            req.params.categoryId,
            pickFields(req.body, ['name', 'description', 'isActive']),
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
        res.json({ success: true, message: 'Member category updated.', data: category });
    } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const assigned = await Member.countDocuments({ category: req.params.categoryId });
        if (assigned) return res.status(409).json({ success: false, message: 'This category is assigned to members. Deactivate it instead.' });
        const category = await MemberCategory.findByIdAndDelete(req.params.categoryId);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
        res.json({ success: true, message: 'Member category deleted.' });
    } catch (error) { next(error); }
};

exports.assignMemberCategory = async (req, res, next) => {
    try {
        const categoryId = req.body.categoryId || null;
        if (categoryId && !await MemberCategory.exists({ _id: categoryId, isActive: true })) {
            return res.status(400).json({ success: false, message: 'Select an active member category.' });
        }
        const member = await Member.findByIdAndUpdate(req.params.memberId, { category: categoryId }, { new: true })
            .populate('category', 'name description isActive');
        if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
        res.json({ success: true, message: 'Member category assigned.', data: member });
    } catch (error) { next(error); }
};

exports.getStandardAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.find({ role: { $ne: 'super_admin' } }).select('username email role isActive lastLogin createdAt').sort({ createdAt: -1 });
        res.json({ success: true, data: admins });
    } catch (error) { next(error); }
};

exports.createStandardAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.create({
            username: req.body.username,
            email: String(req.body.email).toLowerCase(),
            password: req.body.password,
            role: 'admin',
            isActive: true
        });
        res.status(201).json({
            success: true,
            message: 'Administrator account created.',
            data: { _id: admin._id, username: admin.username, email: admin.email, isActive: admin.isActive, createdAt: admin.createdAt }
        });
    } catch (error) { next(error); }
};
