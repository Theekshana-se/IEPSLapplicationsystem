import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date, format = 'PP') {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format currency
export function formatCurrency(amount, currency = 'LKR') {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

export function getApiBaseUrl() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
}

export function getAssetUrl(assetPath) {
    if (!assetPath) return '';
    if (/^https?:\/\//i.test(assetPath)) return assetPath;
    return `${getApiBaseUrl()}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
}

export function formatPaymentStatus(status) {
    const statusMap = {
        completed: 'Completed',
        pending: 'Pending Verification',
        due: 'Renewal Due',
        failed: 'Failed',
        refunded: 'Refunded'
    };

    return statusMap[status] || status;
}

// Validate Sri Lankan NIC
export function validateNIC(nic) {
    if (!nic) return false;

    // Old format: 9 digits + V (e.g., 123456789V)
    const oldFormat = /^[0-9]{9}[vVxX]$/;

    // New format: 12 digits (e.g., 200012345678)
    const newFormat = /^[0-9]{12}$/;

    return oldFormat.test(nic) || newFormat.test(nic);
}

// Validate Sri Lankan mobile number
export function validateMobile(mobile) {
    if (!mobile) return false;

    // Remove spaces and hyphens
    const cleaned = mobile.replace(/[\s-]/g, '');

    // Format: +94XXXXXXXXX or 0XXXXXXXXX
    const withCountryCode = /^\+94[0-9]{9}$/;
    const withoutCountryCode = /^0[0-9]{9}$/;

    return withCountryCode.test(cleaned) || withoutCountryCode.test(cleaned);
}

// Truncate text
export function truncate(text, length = 50) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Get initials from name
export function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Calculate registration progress percentage
export function calculateProgress(completedSteps) {
    const totalSteps = 8;
    return Math.round((completedSteps.length / totalSteps) * 100);
}

// Get status badge color
export function getStatusColor(status) {
    const colors = {
        pending: 'badge-warning',
        approved: 'badge-success',
        rejected: 'badge-error',
        active: 'badge-success',
        suspended: 'badge-error'
    };
    return colors[status] || 'badge-info';
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
