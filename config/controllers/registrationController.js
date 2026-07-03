const Member = require('../models/Member');
const Notification = require('../models/Notification');
const generateMembershipId = require('../utils/generateMembershipId');
const { sendApprovalEmail } = require('../utils/emailService');
const { createStoredFileRecord } = require('../utils/fileStorage');
const { serializeMember } = require('../utils/serializeMember');

// @desc    Save/Update Step 2 - Office Details
// @route   POST /api/registration/step2
// @access  Private (Member)
exports.saveStep2 = async (req, res, next) => {
    try {
        const { officeAddress, officePhone, officeEmail, preferredCommunication } = req.body;

        const member = await Member.findById(req.user._id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Update office details
        member.officeDetails = {
            officeAddress,
            officePhone,
            officeEmail: officeEmail?.toLowerCase(),
            preferredCommunication
        };

        // Mark step as completed
        member.completeStep(2);
        member.currentStep = Math.max(member.currentStep, 3);

        await member.save();

        res.status(200).json({
            success: true,
            message: 'Office details saved successfully',
            data: {
                currentStep: member.currentStep,
                registrationProgress: member.registrationProgress,
                completedSteps: member.completedSteps
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save/Update Step 3 - Work Experience
// @route   POST /api/registration/step3
// @access  Private (Member)
exports.saveStep3 = async (req, res, next) => {
    try {
        const { workExperience, environmentalWorkExperience } = req.body;

        const member = await Member.findById(req.user._id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Update work experience
        member.workExperience = workExperience;
        member.environmentalWorkExperience = environmentalWorkExperience;

        // Mark step as completed
        member.completeStep(3);
        member.currentStep = Math.max(member.currentStep, 4);

        await member.save();

        res.status(200).json({
            success: true,
            message: 'Work experience saved successfully',
            data: {
                currentStep: member.currentStep,
                registrationProgress: member.registrationProgress,
                completedSteps: member.completedSteps
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save/Update Step 4 - Education
// @route   POST /api/registration/step4
// @access  Private (Member)
exports.saveStep4 = async (req, res, next) => {
    try {
        const { education } = req.body;

        const member = await Member.findById(req.user._id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Update education
        member.education = education;

        // Mark step as completed
        member.completeStep(4);
        member.currentStep = Math.max(member.currentStep, 5);

        await member.save();

        res.status(200).json({
            success: true,
            message: 'Education details saved successfully',
            data: {
                currentStep: member.currentStep,
                registrationProgress: member.registrationProgress,
                completedSteps: member.completedSteps
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save/Update Step 5 - Certifications
// @route   POST /api/registration/step5
// @access  Private (Member)
exports.saveStep5 = async (req, res, next) => {
    try {
        const { certifications } = req.body;

        const member = await Member.findById(req.user._id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Update certifications
        member.certifications = certifications || [];

        // Mark step as completed
        member.completeStep(5);
        member.currentStep = Math.max(member.currentStep, 6);

        await member.save();

        res.status(200).json({
            success: true,
            message: 'Certifications saved successfully',
            data: {
                currentStep: member.currentStep,
                registrationProgress: member.registrationProgress,
                completedSteps: member.completedSteps
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save/Update Step 6 - References
// @route   POST /api/registration/step6
// @access  Private (Member)
exports.saveStep6 = async (req, res, next) => {
    try {
        const { references } = req.body;

        const member = await Member.findById(req.user._id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Update references
        member.references = references;

        // Mark step as completed
        member.completeStep(6);
        member.currentStep = Math.max(member.currentStep, 7);

        await member.save();

        res.status(200).json({
            success: true,
            message: 'References saved successfully',
            data: {
                currentStep: member.currentStep,
                registrationProgress: member.registrationProgress,
                completedSteps: member.completedSteps
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save/Update Step 7 - Upload Documents
// @route   POST /api/registration/step7
// @access  Private (Member)
exports.saveStep7 = async (req, res, next) => {
    try {
        const member = await Member.findById(req.user._id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Get uploaded file paths from multer
        const documents = { ...(member.documents || {}) };
        const documentDetails = { ...(member.documentDetails || {}) };

        if (req.files) {
            if (req.files.profilePhoto && req.files.profilePhoto[0]) {
                const profilePhoto = await createStoredFileRecord(req.files.profilePhoto[0]);
                documents.profilePhoto = profilePhoto.path;
                documentDetails.profilePhoto = profilePhoto;
            }
            if (req.files.nicCopy && req.files.nicCopy[0]) {
                const nicCopy = await createStoredFileRecord(req.files.nicCopy[0]);
                documents.nicCopy = nicCopy.path;
                documentDetails.nicCopy = nicCopy;
            }
            if (req.files.degreeCertificates) {
                const degreeCertificates = await Promise.all(req.files.degreeCertificates.map(createStoredFileRecord));
                documents.degreeCertificates = degreeCertificates.map(file => file.path);
                documentDetails.degreeCertificates = degreeCertificates;
            }
            if (req.files.cvDocument && req.files.cvDocument[0]) {
                const cvDocument = await createStoredFileRecord(req.files.cvDocument[0]);
                documents.cvDocument = cvDocument.path;
                documentDetails.cvDocument = cvDocument;
            }
        }

        // Update documents
        member.documents = documents;
        member.documentDetails = documentDetails;

        // Mark step as completed
        member.completeStep(7);
        member.currentStep = Math.max(member.currentStep, 8);

        await member.save();

        await Notification.create({
            recipientType: 'admin',
            type: 'document_uploaded',
            title: 'Member Documents Uploaded',
            message: `${member.personalDetails.nameWithInitials} uploaded or updated verification documents.`,
            metadata: {
                memberId: member._id,
                memberName: member.personalDetails.nameWithInitials
            }
        });

        res.status(200).json({
            success: true,
            message: 'Documents uploaded successfully',
            data: {
                currentStep: member.currentStep,
                registrationProgress: member.registrationProgress,
                completedSteps: member.completedSteps,
                uploadedDocuments: documents,
                documentDetails
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save/Update Step 8 - Declaration & Submit
// @route   POST /api/registration/step8
// @access  Private (Member)
exports.saveStep8 = async (req, res, next) => {
    try {
        const { agreed, signature } = req.body;

        if (!agreed) {
            return res.status(400).json({
                success: false,
                message: 'You must agree to the declaration to submit'
            });
        }

        const member = await Member.findById(req.user._id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Update declaration
        member.declaration = {
            agreed: true,
            agreedDate: new Date(),
            signature
        };

        // Mark step as completed
        member.completeStep(8);
        member.currentStep = 8;
        member.submittedAt = new Date();

        await member.save();

        // Create notification for admins
        await Notification.create({
            recipientType: 'admin',
            type: 'registration_submitted',
            title: 'New Registration Submitted',
            message: `${member.personalDetails.nameWithInitials} has submitted a new membership application`,
            metadata: {
                memberId: member._id,
                memberName: member.personalDetails.nameWithInitials
            }
        });

        res.status(200).json({
            success: true,
            message: 'Registration submitted successfully! Your application is now under review.',
            data: {
                currentStep: member.currentStep,
                registrationProgress: member.registrationProgress,
                completedSteps: member.completedSteps,
                submittedAt: member.submittedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get registration progress
// @route   GET /api/registration/progress
// @access  Private (Member)
exports.getProgress = async (req, res, next) => {
    try {
        const member = await Member.findById(req.user._id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                currentStep: member.currentStep,
                registrationProgress: member.registrationProgress,
                completedSteps: member.completedSteps,
                status: member.status,
                submittedAt: member.submittedAt,
                personalDetails: member.personalDetails,
                officeDetails: member.officeDetails,
                workExperience: member.workExperience,
                education: member.education,
                certifications: member.certifications,
                references: member.references,
                documents: serializeMember(member).documents,
                documentDetails: serializeMember(member).documentDetails,
                declaration: member.declaration
            }
        });
    } catch (error) {
        next(error);
    }
};
