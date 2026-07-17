import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '../api/authApi';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    userType: z.enum(['member', 'admin'])
});

export default function LoginPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            userType: 'member'
        }
    });

    // This is the function that react-hook-form's handleSubmit will call with validated data
    const onFormSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await login(data.email, data.password, data.userType);

            if (response.success) {
                // Store user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                const user = response.data.user;

                // Redirect based on user type and status
                if (user.userType === 'admin') {
                    navigate(user.role === 'super_admin' ? '/admin/administrators' : '/admin/dashboard');
                } else if (user.userType === 'member') {
                    // For members, check registration progress
                    if (user.currentStep && user.currentStep < 8) {
                        // If registration not complete, redirect to next step
                        navigate(`/registration/step${user.currentStep + 1}`);
                    } else {
                        // Registration complete, go to member dashboard
                        navigate('/member/dashboard');
                    }
                }
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            // The axios interceptor wraps the error message in err.message
            const errorMessage = err.message || err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-900 mb-2">
                        IEPSL Portal
                    </h1>
                    <p className="text-gray-600">
                        Institute of Environmental Professionals Sri Lanka
                    </p>
                </div>

                {/* Login Card */}
                <div className="card">
                    <div className="card-header bg-primary-600 text-white">
                        <h2 className="text-2xl font-semibold">Login</h2>
                        <p className="text-primary-100 text-sm mt-1">
                            Access your membership account
                        </p>
                    </div>

                    <div className="card-body">
                        {error && (
                            <div className="mb-6 p-4 bg-error-light border border-error rounded-lg text-error-dark">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                            {/* User Type */}
                            <div>
                                <label className="label">Login As</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            {...register('userType')}
                                            value="member"
                                            className="w-4 h-4 text-primary-600"
                                        />
                                        <span className="text-sm">Member</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            {...register('userType')}
                                            value="admin"
                                            className="w-4 h-4 text-primary-600"
                                        />
                                        <span className="text-sm">Admin</span>
                                    </label>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="label">
                                    Email Address <span className="text-error">*</span>
                                </label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    className={`input ${errors.email ? 'input-error' : ''}`}
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && (
                                    <p className="error-message">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="label">
                                    Password <span className="text-error">*</span>
                                </label>
                                <input
                                    type="password"
                                    {...register('password')}
                                    className={`input ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <p className="error-message">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="spinner w-4 h-4"></div>
                                        Logging in...
                                    </span>
                                ) : (
                                    'Login'
                                )}
                            </button>

                            <div className="text-center">
                                <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Register Link */}
                            <div className="text-center pt-4 border-t">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                                        Register Now
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
