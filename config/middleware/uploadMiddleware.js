const multer = require('multer');
const path = require('path');
const {
    getDestinationForField,
    buildStoredFilename
} = require('../utils/fileStorage');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, getDestinationForField(file.fieldname));
    },
    filename: function (req, file, cb) {
        cb(null, buildStoredFilename(file));
    }
});

// File filter - only allow specific file types
const fileFilter = (req, file, cb) => {
    const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.pdf', '.doc', '.docx']);
    const allowedMimeTypes = new Set([
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream'
    ]);

    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.has(extension) && allowedMimeTypes.has(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error('Only images (JPEG, PNG) and documents (PDF, DOC, DOCX) are allowed'));
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: fileFilter
});

// Middleware for different upload scenarios
exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadFields = (fields) => upload.fields(fields);

// Middleware for registration documents (Step 7)
exports.uploadRegistrationDocuments = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'nicCopy', maxCount: 1 },
    { name: 'degreeCertificates', maxCount: 5 },
    { name: 'cvDocument', maxCount: 1 }
]);

// Middleware for payment proof
exports.uploadPaymentProof = upload.single('paymentProof');

// Error handling middleware for multer
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files uploaded.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};
