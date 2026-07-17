import api from './axios';

// Get pending registrations
export const getPendingRegistrations = async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/admin/pending-registrations', {
        params: { page, limit, search }
    });
    return response.data;
};

// Get all members
export const getAllMembers = async (page = 1, limit = 10, search = '', status = '') => {
    const response = await api.get('/admin/members', {
        params: { page, limit, search, status }
    });
    return response.data;
};

// Get member details
export const getMemberDetails = async (memberId) => {
    const response = await api.get(`/admin/member/${memberId}`);
    return response.data;
};

// Approve member
export const approveMember = async (memberId, notes = '') => {
    const response = await api.put(`/admin/member/${memberId}/approve`, { notes });
    return response.data;
};

// Reject member
export const rejectMember = async (memberId, reason) => {
    const response = await api.put(`/admin/member/${memberId}/reject`, { reason });
    return response.data;
};

export const sendMemberActivation = async (memberId) => {
    const response = await api.post(`/admin/member/${memberId}/send-activation`);
    return response.data;
};

export const sendImportedMemberActivations = async () => {
    const response = await api.post('/admin/members/send-activation-links');
    return response.data;
};

// Get dashboard statistics
export const getStatistics = async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
};

export const getPaymentSummary = async (year = '') => {
    const response = await api.get('/admin/payments/summary', {
        params: { year }
    });
    return response.data;
};

export const getPayments = async (params = {}) => {
    const response = await api.get('/admin/payments', { params });
    return response.data;
};

export const recordPayment = async (formData) => {
    const response = await api.post('/admin/payments', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const verifyPayment = async (paymentId, data) => {
    const response = await api.patch(`/admin/payments/${paymentId}/verify`, data);
    return response.data;
};

export const sendRenewalReminders = async (year) => {
    const response = await api.post('/admin/payments/send-renewal-reminders', { year });
    return response.data;
};

export const getMemberCategories = async () => {
    const response = await api.get('/admin/member-categories');
    return response.data;
};

export const createMemberCategory = async (data) => {
    const response = await api.post('/admin/member-categories', data);
    return response.data;
};

export const updateMemberCategory = async (categoryId, data) => {
    const response = await api.patch(`/admin/member-categories/${categoryId}`, data);
    return response.data;
};

export const deleteMemberCategory = async (categoryId) => {
    const response = await api.delete(`/admin/member-categories/${categoryId}`);
    return response.data;
};

export const assignMemberCategory = async (memberId, categoryId) => {
    const response = await api.patch(`/admin/members/${memberId}/category`, { categoryId });
    return response.data;
};

export const getProfileUpdateRequests = async (status = '') => {
    const response = await api.get('/admin/profile-update-requests', { params: { status } });
    return response.data;
};

export const reviewProfileUpdateRequest = async (requestId, decision, notes = '') => {
    const response = await api.patch(`/admin/profile-update-requests/${requestId}`, { decision, notes });
    return response.data;
};

export const getAdministrators = async () => {
    const response = await api.get('/admin/administrators');
    return response.data;
};

export const createAdministrator = async (data) => {
    const response = await api.post('/admin/administrators', data);
    return response.data;
};
