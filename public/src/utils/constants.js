// Sri Lankan districts
export const DISTRICTS = [
    'Ampara',
    'Anuradhapura',
    'Badulla',
    'Batticaloa',
    'Colombo',
    'Galle',
    'Gampaha',
    'Hambantota',
    'Jaffna',
    'Kalutara',
    'Kandy',
    'Kegalle',
    'Kilinochchi',
    'Kurunegala',
    'Mannar',
    'Matale',
    'Matara',
    'Monaragala',
    'Mullaitivu',
    'Nuwara Eliya',
    'Polonnaruwa',
    'Puttalam',
    'Ratnapura',
    'Trincomalee',
    'Vavuniya'
];

// Gender options
export const GENDERS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
];

export const NAME_PREFIXES = [
    'Mr.', 'Mrs.', 'Ms.', 'Miss', 'Mx.', 'Dr.', 'Prof.', 'Assoc. Prof.',
    'Rev.', 'Ven.', 'Fr.', 'Sr.', 'Eng.', 'Ar.', 'Hon.', 'Justice',
    'Sir', 'Dame', 'Capt.', 'Major', 'Lt. Col.', 'Col.', 'Brig.',
    'Rear Adm.', 'Other'
];

// Communication methods
export const COMMUNICATION_METHODS = [
    { value: 'email', label: 'Email' },
    { value: 'postal', label: 'Postal' }
];

// Communication locations
export const COMMUNICATION_LOCATIONS = [
    { value: 'residential', label: 'Residential' },
    { value: 'office', label: 'Office' }
];

// Member status
export const MEMBER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTIVE: 'active',
    SUSPENDED: 'suspended'
};

// Registration steps
export const REGISTRATION_STEPS = [
    { number: 1, title: 'Personal Details', description: 'Basic information' },
    { number: 2, title: 'Office Details', description: 'Work contact information' },
    { number: 3, title: 'Work Experience', description: 'Professional background' },
    { number: 4, title: 'Education', description: 'Academic qualifications' },
    { number: 5, title: 'Certifications', description: 'Professional certifications' },
    { number: 6, title: 'References', description: 'Professional references' },
    { number: 7, title: 'Documents', description: 'Upload required documents' },
    { number: 8, title: 'Declaration', description: 'Review and submit' }
];

// File upload limits
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_TYPES: {
        images: ['image/jpeg', 'image/jpg', 'image/png'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
};

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        ME: '/auth/me'
    },
    REGISTRATION: {
        STEP: (num) => `/registration/step${num}`,
        PROGRESS: '/registration/progress'
    },
    ADMIN: {
        PENDING: '/admin/pending-registrations',
        MEMBERS: '/admin/members',
        MEMBER: (id) => `/admin/member/${id}`,
        APPROVE: (id) => `/admin/member/${id}/approve`,
        REJECT: (id) => `/admin/member/${id}/reject`,
        STATISTICS: '/admin/statistics'
    }
};
