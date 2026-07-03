import React, { useState, useEffect } from 'react';
import { getRegistrationProgress } from '../../api/registrationApi';
import { User, Briefcase, GraduationCap, Award, Users as UsersIcon, FileText, CheckCircle } from 'lucide-react';
import DocumentPanel from '../../components/documents/DocumentPanel';

export default function RegistrationDetails() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await getRegistrationProgress();
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Registration Details</h2>
                <p className="text-gray-600 mt-1">View all your submitted registration information</p>
            </div>

            {/* Progress Overview */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Completion Status</h3>
                        <span className="text-2xl font-bold text-primary-600">
                            {data?.registrationProgress}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-primary-600 h-3 rounded-full transition-all"
                            style={{ width: `${data?.registrationProgress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        {data?.completedSteps?.length || 0} of 8 steps completed
                    </p>
                </div>
            </div>

            {/* Personal Details */}
            <div className="card">
                <div className="card-header flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <h3 className="text-xl font-semibold">Personal Details</h3>
                    {data?.completedSteps?.includes(1) && <CheckCircle className="w-5 h-5 text-success ml-auto" />}
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name with Initials</p>
                            <p className="font-semibold">{data?.personalDetails?.nameWithInitials || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Full Name</p>
                            <p className="font-semibold">{data?.personalDetails?.fullName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">NIC Number</p>
                            <p className="font-semibold">{data?.personalDetails?.nicNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Date of Birth</p>
                            <p className="font-semibold">{data?.personalDetails?.dateOfBirth ? new Date(data.personalDetails.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-semibold capitalize">{data?.personalDetails?.gender || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">District</p>
                            <p className="font-semibold">{data?.personalDetails?.district || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Mobile Number</p>
                            <p className="font-semibold">{data?.personalDetails?.mobileNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold">{data?.personalDetails?.personalEmail || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Residential Address</p>
                            <p className="font-semibold">{data?.personalDetails?.residentialAddress || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Office Details */}
            {data?.officeDetails && (
                <div className="card">
                    <div className="card-header flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        <h3 className="text-xl font-semibold">Office Details</h3>
                        {data?.completedSteps?.includes(2) && <CheckCircle className="w-5 h-5 text-success ml-auto" />}
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-600">Office Address</p>
                                <p className="font-semibold">{data.officeDetails.officeAddress || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Office Phone</p>
                                <p className="font-semibold">{data.officeDetails.officePhone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Office Email</p>
                                <p className="font-semibold">{data.officeDetails.officeEmail || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Work Experience */}
            {data?.workExperience && data.workExperience.length > 0 && (
                <div className="card">
                    <div className="card-header flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        <h3 className="text-xl font-semibold">Work Experience</h3>
                        {data?.completedSteps?.includes(3) && <CheckCircle className="w-5 h-5 text-success ml-auto" />}
                    </div>
                    <div className="card-body space-y-4">
                        {data.workExperience.map((exp, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-lg">{exp.designation}</h4>
                                <p className="text-gray-700">{exp.placeOfWork}</p>
                                <p className="text-sm text-gray-600 mt-2">{exp.natureOfWork}</p>
                                {(exp.startDate || exp.endDate) && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {data?.education && data.education.length > 0 && (
                <div className="card">
                    <div className="card-header flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        <h3 className="text-xl font-semibold">Education</h3>
                        {data?.completedSteps?.includes(4) && <CheckCircle className="w-5 h-5 text-success ml-auto" />}
                    </div>
                    <div className="card-body space-y-4">
                        {data.education.map((edu, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-lg">{edu.degree} in {edu.fieldOfStudy}</h4>
                                <p className="text-gray-700">{edu.institution}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Graduated: {edu.graduationYear} {edu.grade && `• ${edu.grade}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {data?.certifications && data.certifications.length > 0 && (
                <div className="card">
                    <div className="card-header flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        <h3 className="text-xl font-semibold">Professional Certifications</h3>
                        {data?.completedSteps?.includes(5) && <CheckCircle className="w-5 h-5 text-success ml-auto" />}
                    </div>
                    <div className="card-body space-y-4">
                        {data.certifications.map((cert, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-lg">{cert.name}</h4>
                                <p className="text-gray-700">{cert.issuingOrganization}</p>
                                {cert.credentialId && (
                                    <p className="text-sm text-gray-600 mt-2">ID: {cert.credentialId}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* References */}
            {data?.references && data.references.length > 0 && (
                <div className="card">
                    <div className="card-header flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        <h3 className="text-xl font-semibold">Professional References</h3>
                        {data?.completedSteps?.includes(6) && <CheckCircle className="w-5 h-5 text-success ml-auto" />}
                    </div>
                    <div className="card-body space-y-4">
                        {data.references.map((ref, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-lg">{ref.name}</h4>
                                <p className="text-gray-700">{ref.designation} at {ref.organization}</p>
                                <div className="text-sm text-gray-600 mt-2 space-y-1">
                                    <p>Email: {ref.email}</p>
                                    <p>Phone: {ref.phone}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Documents */}
            {data?.documents && (
                <DocumentPanel
                    documents={data.documents}
                    documentDetails={data.documentDetails}
                    title="Uploaded Documents"
                />
            )}
        </div>
    );
}
