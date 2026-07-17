import { Navigate } from 'react-router-dom';

// Protected Route Component - Requires Authentication
export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export const RoleRoute = ({ children, roles }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return <Navigate to="/login" replace />;

    try {
        const user = JSON.parse(userStr);
        if (user.userType !== 'admin' || !roles.includes(user.role)) {
            return <Navigate to={user.role === 'super_admin' ? '/admin/administrators' : '/admin/dashboard'} replace />;
        }
        return children;
    } catch {
        return <Navigate to="/login" replace />;
    }
};

// Public Route Component - Redirects if already authenticated
export const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Only redirect if we have both token AND valid user data
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);

            // Validate that user object has required properties
            if (!user || !user.userType) {
                // Invalid user data, clear and allow access
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                return children;
            }

            // Redirect based on user type
            if (user.userType === 'admin') {
                return <Navigate to={user.role === 'super_admin' ? '/admin/administrators' : '/admin/dashboard'} replace />;
            } else if (user.userType === 'member') {
                // Check if registration is complete
                const currentStep = user.currentStep || 0;
                if (currentStep > 0 && currentStep < 8) {
                    return <Navigate to={`/registration/step${currentStep + 1}`} replace />;
                }
                return <Navigate to="/member/dashboard" replace />;
            }
        } catch (error) {
            // If JSON parsing fails, clear invalid data and allow access
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }

    return children;
};

// Registration Route Guard - Ensures sequential step completion
export const RegistrationRoute = ({ children, stepNumber }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Must be logged in to access registration steps
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);

        // Check if user is trying to skip steps
        const currentStep = user.currentStep || 1;

        // Allow access to current step or previous steps
        if (stepNumber > currentStep + 1) {
            // Redirect to the next allowed step
            return <Navigate to={`/registration/step${currentStep + 1}`} replace />;
        }

        // If registration is complete (step 8 done), redirect to member dashboard
        if (currentStep >= 8 && user.status !== 'pending') {
            return <Navigate to="/member/dashboard" replace />;
        }

        return children;
    } catch (error) {
        // If JSON parsing fails, clear invalid data and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
};
