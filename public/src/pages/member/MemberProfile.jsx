import React, { useEffect, useState } from 'react';
import { getMemberProfile, updateMyDocuments } from '../../api/memberApi';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Building,
    Upload,
    Save
} from 'lucide-react';
import { formatDate, getAssetUrl } from '../../utils/helpers';
import DocumentPanel from '../../components/documents/DocumentPanel';

const initialFiles = {
    profilePhoto: null,
    nicCopy: null,
    degreeCertificates: [],
    cvDocument: null
};

export default function MemberProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [files, setFiles] = useState(initialFiles);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await getMemberProfile();
            if (response.success) {
                setProfile(response.data.user);
            }
        } catch (loadError) {
            console.error('Error loading profile:', loadError);
            setError(loadError.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (fieldName, selectedFiles, multiple = false) => {
        setFiles((current) => ({
            ...current,
            [fieldName]: multiple ? Array.from(selectedFiles) : selectedFiles[0]
        }));
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        setIsUploading(true);

        try {
            const formData = new FormData();

            if (files.profilePhoto) formData.append('profilePhoto', files.profilePhoto);
            if (files.nicCopy) formData.append('nicCopy', files.nicCopy);
            if (files.cvDocument) formData.append('cvDocument', files.cvDocument);
            files.degreeCertificates.forEach((file) => formData.append('degreeCertificates', file));

            const response = await updateMyDocuments(formData);
            if (response.success) {
                setProfile(response.data.member);
                setFiles(initialFiles);
                setMessage('Documents updated successfully.');
            }
        } catch (uploadError) {
            setError(uploadError.message || 'Failed to update documents');
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    const profilePhotoUrl = profile?.documents?.profilePhoto
        ? getAssetUrl(profile.documents.profilePhoto)
        : '';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
                <p className="text-gray-600 mt-1">View your profile, documents, and upload replacements when needed.</p>
            </div>

            {(message || error) && (
                <div className={`rounded-lg border p-4 text-sm ${error
                        ? 'border-error bg-error-light text-error-dark'
                        : 'border-success bg-success-50 text-success-700'
                    }`}>
                    {error || message}
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center border border-primary-200">
                            {profilePhotoUrl ? (
                                <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-primary-600" />
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {profile?.personalDetails?.fullName}
                            </h3>
                            <p className="text-lg text-gray-600 mt-1">
                                {profile?.personalDetails?.nameWithInitials}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Mail className="w-4 h-4 text-primary-600" />
                                    <span>{profile?.personalDetails?.personalEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-primary-600" />
                                    <span>{profile?.personalDetails?.mobileNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <MapPin className="w-4 h-4 text-primary-600" />
                                    <span>{profile?.personalDetails?.district}</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className={`badge badge-${profile?.status === 'pending' ? 'warning' : 'success'} text-sm px-4 py-2`}>
                                    {(profile?.status === 'approved' ? 'active' : profile?.status)?.toUpperCase()}
                                </span>
                                {profile?.membershipId && (
                                    <span className="ml-3 text-sm text-gray-600">
                                        ID: <span className="font-mono font-semibold">{profile.membershipId}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <h3 className="text-xl font-semibold">Personal Information</h3>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Full Name</label>
                                <p className="text-gray-900 font-semibold mt-1">{profile?.personalDetails?.fullName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Name with Initials</label>
                                <p className="text-gray-900 font-semibold mt-1">{profile?.personalDetails?.nameWithInitials || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">NIC Number</label>
                                <p className="text-gray-900 font-semibold mt-1">{profile?.personalDetails?.nicNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                                <p className="text-gray-900 font-semibold mt-1">
                                    {profile?.personalDetails?.dateOfBirth ? formatDate(profile.personalDetails.dateOfBirth) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Gender</label>
                                <p className="text-gray-900 font-semibold mt-1 capitalize">{profile?.personalDetails?.gender || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Nationality</label>
                                <p className="text-gray-900 font-semibold mt-1">{profile?.personalDetails?.nationality || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Residential Address</label>
                                <p className="text-gray-900 font-semibold mt-1">{profile?.personalDetails?.residentialAddress || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            <h3 className="text-xl font-semibold">Office Information</h3>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Office Email</label>
                                <p className="text-gray-900 font-semibold mt-1">{profile?.officeDetails?.officeEmail || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Office Phone</label>
                                <p className="text-gray-900 font-semibold mt-1">{profile?.officeDetails?.officePhone || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Office Address</label>
                                <p className="text-gray-900 font-semibold mt-1">{profile?.officeDetails?.officeAddress || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Member Since</label>
                                <p className="text-gray-900 font-semibold mt-1">{formatDate(profile?.createdAt)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                <p className="text-gray-900 font-semibold mt-1">{formatDate(profile?.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DocumentPanel
                documents={profile?.documents}
                documentDetails={profile?.documentDetails}
                title="Stored Documents"
            />

            <div className="card">
                <div className="card-header">
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        <h3 className="text-xl font-semibold">Upload or Replace Documents</h3>
                    </div>
                </div>
                <div className="card-body">
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="block">
                                <span className="label mb-2">Profile Photo</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    className="input w-full py-3"
                                    onChange={(event) => handleFileChange('profilePhoto', event.target.files)}
                                />
                            </label>

                            <label className="block">
                                <span className="label mb-2">NIC Copy</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                    className="input w-full py-3"
                                    onChange={(event) => handleFileChange('nicCopy', event.target.files)}
                                />
                            </label>

                            <label className="block">
                                <span className="label mb-2">CV / Resume</span>
                                <input
                                    type="file"
                                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="input w-full py-3"
                                    onChange={(event) => handleFileChange('cvDocument', event.target.files)}
                                />
                            </label>

                            <label className="block">
                                <span className="label mb-2">Degree Certificates</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="input w-full py-3"
                                    onChange={(event) => handleFileChange('degreeCertificates', event.target.files, true)}
                                />
                            </label>
                        </div>

                        <div className="text-sm text-gray-500 space-y-1">
                            <p>Accepted formats: JPG, PNG, PDF, DOC, DOCX.</p>
                            <p>Files are stored on the server filesystem and their metadata is stored in MongoDB.</p>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={isUploading}>
                            {isUploading ? (
                                <span className="flex items-center gap-2">
                                    <div className="spinner w-4 h-4"></div>
                                    Uploading...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Save Documents
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        <h3 className="text-xl font-semibold">Professional Summary</h3>
                    </div>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-primary-50 rounded-lg">
                            <p className="text-3xl font-bold text-primary-600">{profile?.workExperience?.length || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">Work Experiences</p>
                        </div>
                        <div className="text-center p-4 bg-success-50 rounded-lg">
                            <p className="text-3xl font-bold text-success-600">{profile?.education?.length || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">Qualifications</p>
                        </div>
                        <div className="text-center p-4 bg-info-50 rounded-lg">
                            <p className="text-3xl font-bold text-info-600">{profile?.certifications?.length || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">Certifications</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <a href="/member/registration-details" className="btn btn-outline">
                    View Full Registration Details
                </a>
                {profile?.membershipId && (
                    <a href="/member/membership-card" className="btn btn-primary">
                        View Membership Card
                    </a>
                )}
            </div>
        </div>
    );
}
