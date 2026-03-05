const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  membershipId: {
    type: String,
    unique: true,
    sparse: true // Allow null during registration
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'suspended'],
    default: 'pending'
  },

  // Personal Details (Step 1)
  personalDetails: {
    nameWithInitials: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    nicNumber: { type: String, required: true, unique: true },
    nationality: { type: String, required: true, default: 'Sri Lankan' },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    district: { type: String, required: true },
    residentialAddress: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    personalEmail: { type: String, required: true, unique: true, lowercase: true }
  },

  // Office Details (Step 2)
  officeDetails: {
    officeAddress: String,
    officePhone: String,
    officeEmail: { type: String, lowercase: true },
    preferredCommunication: {
      method: { type: String, enum: ['postal', 'email'] },
      location: { type: String, enum: ['residential', 'office'] }
    }
  },

  // Work Experience (Step 3)
  workExperience: [{
    placeOfWork: { type: String, required: true },
    designation: { type: String, required: true },
    natureOfWork: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: false }
  }],
  environmentalWorkExperience: {
    type: String,
    maxLength: 3000 // Roughly 500 words
  },

  // Educational Qualifications (Step 4)
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    grade: String
  }],

  // Professional Certifications (Step 5)
  certifications: [{
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    issueDate: Date,
    expiryDate: Date,
    credentialId: String
  }],

  // References (Step 6)
  references: [{
    name: { type: String, required: true },
    designation: { type: String, required: true },
    organization: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: String
  }],

  // Documents (Step 7)
  documents: {
    profilePhoto: String,
    nicCopy: String,
    degreeCertificates: [String],
    cvDocument: String
  },

  // Declaration (Step 8)
  declaration: {
    agreed: { type: Boolean, default: false },
    agreedDate: Date,
    signature: String
  },

  // Authentication
  password: {
    type: String,
    required: true,
    select: false // Don't return password by default
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Registration Progress
  registrationProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 8
  },
  completedSteps: {
    type: [Number],
    default: []
  },

  // Review Information
  submittedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  reviewNotes: String,

  // Timestamps
  lastLogin: Date
}, {
  timestamps: true
});

// Indexes for better query performance
memberSchema.index({ status: 1 });

// Virtual for full registration completion
memberSchema.virtual('isRegistrationComplete').get(function () {
  return this.registrationProgress === 100 && this.currentStep === 8;
});

// Method to check if step is completed
memberSchema.methods.isStepCompleted = function (stepNumber) {
  return this.completedSteps.includes(stepNumber);
};

// Method to mark step as completed
memberSchema.methods.completeStep = function (stepNumber) {
  if (!this.completedSteps.includes(stepNumber)) {
    this.completedSteps.push(stepNumber);
    this.registrationProgress = (this.completedSteps.length / 8) * 100;
  }
};

module.exports = mongoose.model('Member', memberSchema);
