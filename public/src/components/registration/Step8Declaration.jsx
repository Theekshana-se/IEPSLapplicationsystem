import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveRegistrationStep } from '../../api/registrationApi';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const declarationSchema = z.object({
    agreed: z.boolean().refine(val => val === true, {
        message: 'You must agree to the declaration to submit'
    }),
    signature: z.string().min(1, 'Signature is required')
});

export default function Step8Declaration({ onComplete }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(declarationSchema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await saveRegistrationStep(8, data);
            if (response.success) {
                setSuccess(true);
                onComplete?.();

                // Clear localStorage to force fresh login after registration
                // This prevents PublicRoute from redirecting back to registration
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }, 3000);
            }
        } catch (err) {
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="card">
                    <div className="card-body text-center py-12">
                        <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-12 h-12 text-success" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Registration Submitted Successfully!
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Thank you for completing your IEPSL membership registration. Your application has been submitted and is now under review by our team.
                        </p>
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 max-w-2xl mx-auto">
                            <h3 className="font-semibold text-primary-900 mb-2">What's Next?</h3>
                            <ul className="text-sm text-primary-800 space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>You will receive a confirmation email shortly</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Our team will review your application within 5-7 business days</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>You'll be notified via email once your application is processed</span>
                                </li>
                            </ul>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">
                            Redirecting to login page...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card">
                <div className="card-header">
                    <h2 className="text-2xl font-semibold text-gray-900">Step 8: Declaration & Submit</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Review and submit your application
                    </p>
                </div>

                <div className="card-body">
                    {error && (
                        <div className="mb-6 p-4 bg-error-light border border-error rounded-lg text-error-dark flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Declaration Text */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Declaration</h3>
                            <div className="prose prose-sm text-gray-700 space-y-3">
                                <p>
                                    I hereby declare that:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>All information provided in this application is true, accurate, and complete to the best of my knowledge.</li>
                                    <li>I understand that any false or misleading information may result in the rejection of my application or termination of membership.</li>
                                    <li>I agree to abide by the constitution, bylaws, and code of ethics of the Institute of Environmental Professionals Sri Lanka (IEPSL).</li>
                                    <li>I authorize IEPSL to verify the information provided and contact my references.</li>
                                    <li>I understand that membership is subject to approval by the IEPSL Council.</li>
                                    <li>I agree to pay the applicable membership fees as determined by IEPSL.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Agreement Checkbox */}
                        <div className="border-t pt-6">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('agreed')}
                                    className="w-5 h-5 text-primary-600 mt-1"
                                />
                                <span className="text-gray-700">
                                    I have read and agree to the above declaration <span className="text-error">*</span>
                                </span>
                            </label>
                            {errors.agreed && (
                                <p className="error-message ml-8">{errors.agreed.message}</p>
                            )}
                        </div>

                        {/* Signature */}
                        <div>
                            <label className="label">
                                Digital Signature (Type your full name) <span className="text-error">*</span>
                            </label>
                            <input
                                {...register('signature')}
                                className={`input ${errors.signature ? 'input-error' : ''}`}
                                placeholder="Type your full name as signature"
                            />
                            {errors.signature && (
                                <p className="error-message">{errors.signature.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                By typing your name, you are electronically signing this declaration
                            </p>
                        </div>

                        {/* Final Notice */}
                        <div className="bg-warning-light border border-warning rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-warning-dark flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-warning-dark">
                                    <p className="font-semibold mb-1">Before you submit:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Please review all information you've provided</li>
                                        <li>Ensure all required documents are uploaded</li>
                                        <li>Once submitted, you cannot edit your application</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/registration/step7')}
                                className="btn btn-secondary"
                            >
                                Previous Step
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary px-8"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="spinner w-4 h-4"></div>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
