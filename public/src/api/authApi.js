import api from './axios';

// Register new member
export const registerMember = async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

// Login
export const login = async (email, password, userType) => {
    const response = await api.post('/auth/login', { email, password, userType });

    // Store token and user data
    if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const validatePasswordResetToken = async (token) => {
    const response = await api.get(`/auth/reset-password/${token}`);
    return response.data;
};

export const resetPassword = async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });

    if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
};

// Logout
export const logout = async () => {
    try {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirect to landing page
        return { success: true };
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirect to landing page even on error
        return { success: false, message: error.response?.data?.message || 'Logout failed' };
    }
};

// Get current user
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// Get user from localStorage
export const getStoredUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
