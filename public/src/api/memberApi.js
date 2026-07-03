import api from './axios';

// Get member profile
export const getMemberProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// Update member profile
export const updateMemberProfile = async (data) => {
    const response = await api.put('/member/profile', data);
    return response.data;
};

export const updateMyDocuments = async (formData) => {
    const response = await api.post('/member/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Get member notifications
export const getNotifications = async () => {
    const response = await api.get('/member/notifications');
    return response.data;
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
    const response = await api.put(`/member/notifications/${notificationId}/read`);
    return response.data;
};

export const getMemberPayments = async () => {
    const response = await api.get('/member/payments');
    return response.data;
};

// Search member for reference
export const searchMemberForReference = async (query) => {
    const response = await api.get(`/members/search/reference?query=${query}`);
    return response.data;
};
