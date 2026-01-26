import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerMember } from '../api/authApi';
import { DISTRICTS, GENDERS } from '../utils/constants';
import { validateNIC, validateMobile } from '../utils/helpers';

// Validation schema for Step 1
const step1Schema = z.object({
    nameWithInitials: z.string().min(1, 'Name with initials is required'),
    fullName: z.string().min(1, 'Full name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    nicNumber: z.string().refine(validateNIC, 'Invalid NIC number'),
    nationality: z.string().default('Sri Lankan'),
    gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
    district: z.string().min(1, 'District is required'),
    residentialAddress: z.string().min(1, 'Residential address is required'),
    mobileNumber: z.string().refine(validateMobile, 'Invalid mobile number'),
    personalEmail: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            nationality: 'Sri Lankan'
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const { confirmPassword, ...registrationData } = data;
            console.log('Sending registration data:', registrationData);

            const response = await registerMember(registrationData);
            console.log('Registration response:', response);

            if (response.success) {
                // Show success message
                setShowSuccessModal(true);
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            // The axios interceptor wraps the error message in err.message
            const errorMessage = err.message || err.response?.data?.message || 'An error occurred during registration';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-900 mb-2">
                        IEPSL Membership Registration
                    </h1>
                    <p className="text-gray-600">
                        Institute of Environmental Professionals Sri Lanka
                    </p>
                </div>

                {/* Registration Card */}
                <div className="card">
                    <div className="card-header bg-primary-600 text-white">
                        <h2 className="text-2xl font-semibold">Step 1: Personal Details</h2>
                        <p className="text-primary-100 text-sm mt-1">
                            Please provide your basic information to begin registration
                        </p>
                    </div>

                    <div className="card-body">
                        {error && (
                            <div className="mb-6 p-4 bg-error-light border border-error rounded-lg text-error-dark">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">
                                        Name with Initials <span className="text-error">*</span>
                                    </label>
                                    <input
                                        {...register('nameWithInitials')}
                                        className={`input ${errors.nameWithInitials ? 'input-error' : ''}`}
                                        placeholder="e.g., A.B. Silva"
                                    />
                                    {errors.nameWithInitials && (
                                        <p className="error-message">{errors.nameWithInitials.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">
                                        Full Name <span className="text-error">*</span>
                                    </label>
                                    <input
                                        {...register('fullName')}
                                        className={`input ${errors.fullName ? 'input-error' : ''}`}
                                        placeholder="e.g., Amal Bandara Silva"
                                    />
                                    {errors.fullName && (
                                        <p className="error-message">{errors.fullName.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* DOB and NIC */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">
                                        Date of Birth <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        {...register('dateOfBirth')}
                                        className={`input ${errors.dateOfBirth ? 'input-error' : ''}`}
                                    />
                                    {errors.dateOfBirth && (
                                        <p className="error-message">{errors.dateOfBirth.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">
                                        NIC Number <span className="text-error">*</span>
                                    </label>
                                    <input
                                        {...register('nicNumber')}
                                        className={`input ${errors.nicNumber ? 'input-error' : ''}`}
                                        placeholder="e.g., 123456789V or 200012345678"
                                    />
                                    {errors.nicNumber && (
                                        <p className="error-message">{errors.nicNumber.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nationality and Gender */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">
                                        Nationality <span className="text-error">*</span>
                                    </label>
                                    <input
                                        {...register('nationality')}
                                        className={`input ${errors.nationality ? 'input-error' : ''}`}
                                    />
                                    {errors.nationality && (
                                        <p className="error-message">{errors.nationality.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">
                                        Gender <span className="text-error">*</span>
                                    </label>
                                    <select
                                        {...register('gender')}
                                        className={`input ${errors.gender ? 'input-error' : ''}`}
                                    >
                                        <option value="">Select gender</option>
                                        {GENDERS.map(g => (
                                            <option key={g.value} value={g.value}>{g.label}</option>
                                        ))}
                                    </select>
                                    {errors.gender && (
                                        <p className="error-message">{errors.gender.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* District */}
                            <div>
                                <label className="label">
                                    District <span className="text-error">*</span>
                                </label>
                                <select
                                    {...register('district')}
                                    className={`input ${errors.district ? 'input-error' : ''}`}
                                >
                                    <option value="">Select district</option>
                                    {DISTRICTS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                {errors.district && (
                                    <p className="error-message">{errors.district.message}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="label">
                                    Residential Address <span className="text-error">*</span>
                                </label>
                                <textarea
                                    {...register('residentialAddress')}
                                    className={`input min-h-[80px] ${errors.residentialAddress ? 'input-error' : ''}`}
                                    placeholder="Enter your full residential address"
                                    rows={3}
                                />
                                {errors.residentialAddress && (
                                    <p className="error-message">{errors.residentialAddress.message}</p>
                                )}
                            </div>

                            {/* Contact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">
                                        Mobile Number <span className="text-error">*</span>
                                    </label>
                                    <input
                                        {...register('mobileNumber')}
                                        className={`input ${errors.mobileNumber ? 'input-error' : ''}`}
                                        placeholder="e.g., 0771234567 or +94771234567"
                                    />
                                    {errors.mobileNumber && (
                                        <p className="error-message">{errors.mobileNumber.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">
                                        Personal Email <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register('personalEmail')}
                                        className={`input ${errors.personalEmail ? 'input-error' : ''}`}
                                        placeholder="your.email@example.com"
                                    />
                                    {errors.personalEmail && (
                                        <p className="error-message">{errors.personalEmail.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">
                                        Password <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        {...register('password')}
                                        className={`input ${errors.password ? 'input-error' : ''}`}
                                        placeholder="Minimum 6 characters"
                                    />
                                    {errors.password && (
                                        <p className="error-message">{errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">
                                        Confirm Password <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        {...register('confirmPassword')}
                                        className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                                        placeholder="Re-enter password"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="error-message">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-between pt-6 border-t">
                                <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm">
                                    Already have an account? Login
                                </Link>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-primary px-8"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="spinner w-4 h-4"></div>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Continue to Step 2'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-sm mt-6">
                    By registering, you agree to IEPSL's terms and conditions
                </p>
            </div>

            <Modal
                isOpen={showSuccessModal}
                title="Registration Successful"
                type="success"
                actions={
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary px-6 w-full"
                    >
                        Continue to Login
                    </button>
                }
            >
                <div>
                    Your registration process has begun. Please login to complete the remaining steps of your application.
                </div>
            </Modal>
        </div>
    );
}
