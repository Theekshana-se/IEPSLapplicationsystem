import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { getRegistrationProgress } from '../api/registrationApi';
import { REGISTRATION_STEPS } from '../utils/constants';
import { CheckCircle2, Circle } from 'lucide-react';

// Import step components
import Step2OfficeDetails from '../components/registration/Step2OfficeDetails';
import Step3WorkExperience from '../components/registration/Step3WorkExperience';
import Step4Education from '../components/registration/Step4Education';
import Step5Certifications from '../components/registration/Step5Certifications';
import Step6References from '../components/registration/Step6References';
import Step7Documents from '../components/registration/Step7Documents';
import Step8Declaration from '../components/registration/Step8Declaration';

export default function RegistrationFlow() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            const response = await getRegistrationProgress();
            if (response.success) {
                setProgress(response.data);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-12 h-12 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your registration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                IEPSL Membership Registration
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Complete all steps to submit your application
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex flex-col items-end gap-1">
                                <button
                                    onClick={() => navigate('/')}
                                    className="text-sm text-error hover:text-error-dark font-medium underline"
                                >
                                    Cancel Application
                                </button>
                                <div className="text-sm text-gray-600">Progress</div>
                            </div>
                            <div className="text-2xl font-bold text-primary-600">
                                {progress?.registrationProgress || 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b">
                <div className="container-custom py-8">
                    <div className="flex items-center justify-between">
                        {REGISTRATION_STEPS.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center">
                                    {/* Step Circle */}
                                    <div
                                        className={`
                      stepper-step
                      ${progress?.completedSteps?.includes(step.number)
                                                ? 'stepper-step-completed'
                                                : progress?.currentStep === step.number
                                                    ? 'stepper-step-active'
                                                    : 'stepper-step-inactive'
                                            }
                    `}
                                    >
                                        {progress?.completedSteps?.includes(step.number) ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            step.number
                                        )}
                                    </div>

                                    {/* Step Label */}
                                    <div className="mt-2 text-center hidden md:block">
                                        <div className={`text-xs font-medium ${progress?.currentStep === step.number
                                            ? 'text-primary-600'
                                            : 'text-gray-500'
                                            }`}>
                                            {step.title}
                                        </div>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < REGISTRATION_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${progress?.completedSteps?.includes(step.number)
                                        ? 'bg-primary-600'
                                        : 'bg-gray-300'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="container-custom py-8">
                <Routes>
                    <Route path="/" element={<Navigate to="/registration/step2" replace />} />
                    <Route path="/step2" element={<Step2OfficeDetails onComplete={loadProgress} />} />
                    <Route path="/step3" element={<Step3WorkExperience onComplete={loadProgress} />} />
                    <Route path="/step4" element={<Step4Education onComplete={loadProgress} />} />
                    <Route path="/step5" element={<Step5Certifications onComplete={loadProgress} />} />
                    <Route path="/step6" element={<Step6References onComplete={loadProgress} />} />
                    <Route path="/step7" element={<Step7Documents onComplete={loadProgress} />} />
                    <Route path="/step8" element={<Step8Declaration onComplete={loadProgress} />} />
                </Routes>
            </div>
        </div>
    );
}
