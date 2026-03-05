import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveRegistrationStep } from '../../api/registrationApi';
import { COMMUNICATION_METHODS, COMMUNICATION_LOCATIONS } from '../../utils/constants';

const step2Schema = z.object({
    officeAddress: z.string().optional(),
    officePhone: z.string().optional(),
    officeEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    preferredCommunication: z.object({
        method: z.enum(['email', 'postal']).optional(),
        location: z.enum(['residential', 'office']).optional()
    }).optional()
});

export default function Step2OfficeDetails({ onComplete }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(step2Schema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await saveRegistrationStep(2, data);
            if (response.success) {
                onComplete?.();
                navigate('/registration/step3');
            }
        } catch (err) {
            setError(err.message || 'Failed to save. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card">
                <div className="card-header">
                    <h2 className="text-2xl font-semibold text-gray-900">Step 2: Office Details</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Provide your work contact information (optional)
                    </p>
                </div>

                <div className="card-body">
                    {error && (
                        <div className="mb-6 p-4 bg-error-light border border-error rounded-lg text-error-dark">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Office Address */}
                        <div>
                            <label className="label">Office Address</label>
                            <textarea
                                {...register('officeAddress')}
                                className="input min-h-[80px]"
                                placeholder="Enter your office address"
                                rows={3}
                            />
                        </div>

                        {/* Office Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Office Phone</label>
                                <input
                                    {...register('officePhone')}
                                    className="input"
                                    placeholder="e.g., 0112345678"
                                />
                            </div>

                            <div>
                                <label className="label">Office Email</label>
                                <input
                                    type="email"
                                    {...register('officeEmail')}
                                    className={`input ${errors.officeEmail ? 'input-error' : ''}`}
                                    placeholder="office.email@company.com"
                                />
                                {errors.officeEmail && (
                                    <p className="error-message">{errors.officeEmail.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Preferred Communication */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Preferred Communication
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Communication Method</label>
                                    <select
                                        {...register('preferredCommunication.method')}
                                        className="input"
                                    >
                                        <option value="">Select method</option>
                                        {COMMUNICATION_METHODS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Communication Address</label>
                                    <select
                                        {...register('preferredCommunication.location')}
                                        className="input"
                                    >
                                        <option value="">Select location</option>
                                        {COMMUNICATION_LOCATIONS.map(l => (
                                            <option key={l.value} value={l.value}>{l.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/registration/step1-summary')}
                                className="btn btn-secondary"
                            >
                                Previous Step
                            </button>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onComplete?.();
                                        navigate('/registration/step3');
                                    }}
                                    className="btn btn-outline"
                                >
                                    Skip Step
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-primary px-8"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="spinner w-4 h-4"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save & Continue'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
