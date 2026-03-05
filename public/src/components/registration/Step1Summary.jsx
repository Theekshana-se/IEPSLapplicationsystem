import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRegistrationProgress } from '../../api/registrationApi';

export default function Step1Summary({ onComplete }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [memberData, setMemberData] = useState(null);

    useEffect(() => {
        loadMemberData();
    }, []);

    const loadMemberData = async () => {
        try {
            const response = await getRegistrationProgress();
            if (response.success && response.data) {
                setMemberData(response.data.personalDetails);
            }
        } catch (err) {
            setError('Failed to load personal details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="spinner w-8 h-8"></div>
            </div>
        );
    }

    if (error || !memberData) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="p-4 bg-error-light border border-error rounded-lg text-error-dark">
                    {error || 'Personal details not found.'}
                </div>
            </div>
        );
    }

    // Format date for display
    const formattedDate = memberData.dateOfBirth
        ? new Date(memberData.dateOfBirth).toLocaleDateString()
        : 'N/A';

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Step 1: Personal Details (Review)</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Review the information you provided in Step 1
                        </p>
                    </div>
                </div>

                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Name with Initials</h3>
                            <p className="font-medium text-gray-900">{memberData.nameWithInitials}</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                            <p className="font-medium text-gray-900">{memberData.fullName}</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
                            <p className="font-medium text-gray-900">{formattedDate}</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">NIC Number</h3>
                            <p className="font-medium text-gray-900">{memberData.nicNumber}</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Nationality</h3>
                            <p className="font-medium text-gray-900">{memberData.nationality}</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
                            <p className="font-medium text-gray-900 capitalize">{memberData.gender}</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">District</h3>
                            <p className="font-medium text-gray-900">{memberData.district}</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Mobile Number</h3>
                            <p className="font-medium text-gray-900">{memberData.mobileNumber}</p>
                        </div>
                        <div className="border-b pb-4 md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Personal Email</h3>
                            <p className="font-medium text-gray-900">{memberData.personalEmail}</p>
                        </div>
                        <div className="border-b pb-4 md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Residential Address</h3>
                            <p className="font-medium text-gray-900">{memberData.residentialAddress}</p>
                        </div>
                        <div className="md:col-span-2 p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
                            <strong>Note:</strong> To change these details, please contact admin as they form the basis of your account.
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-end pt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/registration/step2')}
                            className="btn btn-primary px-8"
                        >
                            Continue to Step 2
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
