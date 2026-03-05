import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveRegistrationStep } from '../../api/registrationApi';
import { Plus, Trash2 } from 'lucide-react';

const workExperienceSchema = z.object({
    workExperience: z.array(z.object({
        placeOfWork: z.string().min(1, 'Place of work is required'),
        designation: z.string().min(1, 'Designation is required'),
        natureOfWork: z.string().min(1, 'Nature of work is required'),
        endDate: z.string().optional(),
        isCurrent: z.boolean().optional()
    })).min(1, 'At least one work experience is required'),
    environmentalWorkExperience: z.string()
        .max(3000, 'Must not exceed approximately 500 words')
        .optional()
});

export default function Step3WorkExperience({ onComplete }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(workExperienceSchema),
        defaultValues: {
            workExperience: [{ placeOfWork: '', designation: '', natureOfWork: '', isCurrent: false }],
            environmentalWorkExperience: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'workExperience'
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await saveRegistrationStep(3, data);
            if (response.success) {
                onComplete?.();
                navigate('/registration/step4');
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
                    <h2 className="text-2xl font-semibold text-gray-900">Step 3: Work Experience</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Add your professional work experience after graduation
                    </p>
                </div>

                <div className="card-body">
                    {error && (
                        <div className="mb-6 p-4 bg-error-light border border-error rounded-lg text-error-dark">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Experience {index + 1}
                                    </h3>
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-error hover:text-error-dark"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">
                                                Place of Work <span className="text-error">*</span>
                                            </label>
                                            <input
                                                {...register(`workExperience.${index}.placeOfWork`)}
                                                className={`input ${errors.workExperience?.[index]?.placeOfWork ? 'input-error' : ''}`}
                                                placeholder="Company/Organization name"
                                            />
                                            {errors.workExperience?.[index]?.placeOfWork && (
                                                <p className="error-message">{errors.workExperience[index].placeOfWork.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="label">
                                                Designation <span className="text-error">*</span>
                                            </label>
                                            <input
                                                {...register(`workExperience.${index}.designation`)}
                                                className={`input ${errors.workExperience?.[index]?.designation ? 'input-error' : ''}`}
                                                placeholder="Your job title"
                                            />
                                            {errors.workExperience?.[index]?.designation && (
                                                <p className="error-message">{errors.workExperience[index].designation.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">
                                            Nature of Work <span className="text-error">*</span>
                                        </label>
                                        <textarea
                                            {...register(`workExperience.${index}.natureOfWork`)}
                                            className={`input min-h-[60px] ${errors.workExperience?.[index]?.natureOfWork ? 'input-error' : ''}`}
                                            placeholder="Describe your responsibilities"
                                            rows={2}
                                        />
                                        {errors.workExperience?.[index]?.natureOfWork && (
                                            <p className="error-message">{errors.workExperience[index].natureOfWork.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="label">Start Date</label>
                                            <input
                                                type="date"
                                                {...register(`workExperience.${index}.startDate`)}
                                                className="input"
                                            />
                                        </div>

                                        <div>
                                            <label className="label">End Date</label>
                                            <input
                                                type="date"
                                                {...register(`workExperience.${index}.endDate`)}
                                                className="input"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    {...register(`workExperience.${index}.isCurrent`)}
                                                    className="w-4 h-4 text-primary-600"
                                                />
                                                <span className="text-sm text-gray-700">Current Position</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add More Button */}
                        <button
                            type="button"
                            onClick={() => append({ placeOfWork: '', designation: '', natureOfWork: '', isCurrent: false })}
                            className="btn btn-outline w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Experience
                        </button>

                        {errors.workExperience?.root && (
                            <p className="error-message">{errors.workExperience.root.message}</p>
                        )}

                        {/* Environmental Work Experience */}
                        <div className="pt-6 border-t mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Environmental Related Work & Contributions
                            </h3>
                            <div>
                                <label className="label">
                                    Environmental related work / research, major contributions and achievements
                                    <span className="text-gray-500 font-normal ml-1">(Optional, max 500 words)</span>
                                </label>
                                <textarea
                                    {...register('environmentalWorkExperience')}
                                    className={`input min-h-[120px] ${errors.environmentalWorkExperience ? 'input-error' : ''}`}
                                    placeholder="Briefly state your environmental related work, research, major contributions, and achievements..."
                                    rows={5}
                                />
                                {errors.environmentalWorkExperience && (
                                    <p className="error-message">{errors.environmentalWorkExperience.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/registration/step2')}
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
                                        Saving...
                                    </span>
                                ) : (
                                    'Continue to Step 4'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
