import React, { useState, useEffect } from 'react';
import { getMemberProfile } from '../../api/memberApi';
import { getRegistrationProgress } from '../../api/registrationApi';
import { User, Mail, Phone, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate, getStatusColor } from '../../utils/helpers';

export default function MemberDashboard() {
    const [profile, setProfile] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [profileRes, progressRes] = await Promise.all([
                getMemberProfile(),
                getRegistrationProgress()
            ]);

            if (profileRes.success) setProfile(profileRes.data.user);
            if (progressRes.success) setProgress(progressRes.data);
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

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { icon: Clock, text: 'Under Review', color: 'warning' },
            approved: { icon: CheckCircle, text: 'Approved', color: 'success' },
            rejected: { icon: AlertCircle, text: 'Rejected', color: 'error' },
            active: { icon: CheckCircle, text: 'Active', color: 'success' }
        };
        return statusMap[status] || statusMap.pending;
    };

    const statusInfo = getStatusInfo(profile?.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
                <p className="text-gray-600 mt-1">
                    {profile?.personalDetails?.nameWithInitials || 'Member'}
                </p>
            </div>

            {/* Status Card */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Membership Status</h3>
                            <div className="flex items-center gap-2">
                                <StatusIcon className={`w-5 h-5 text-${statusInfo.color}`} />
                                <span className={`badge badge-${statusInfo.color} text-lg px-4 py-2`}>
                                    {statusInfo.text}
                                </span>
                            </div>
                            {profile?.membershipId && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Membership ID: <span className="font-mono font-semibold">{profile.membershipId}</span>
                                </p>
                            )}
                        </div>
                        {profile?.status === 'pending' && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Registration Progress</p>
                                <p className="text-3xl font-bold text-primary-600">{progress?.registrationProgress || 0}%</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rejection Reason */}
            {
                profile?.status === 'rejected' && profile?.reviewNotes && (
                    <div className="card border-l-4 border-error mb-6">
                        <div className="card-body">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-error-light text-error rounded-lg">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Application Rejected</h3>
                                    <div className="text-gray-600 mb-4">
                                        <span className="font-semibold text-gray-900">Reason:</span> {profile.reviewNotes}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Please contact the administration for more details or to appeal this decision.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Full Name</p>
                                <p className="font-semibold">{profile?.personalDetails?.fullName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-success-100 text-success-600 rounded-lg">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-semibold text-sm">{profile?.personalDetails?.personalEmail || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-info-100 text-info-600 rounded-lg">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Mobile</p>
                                <p className="font-semibold">{profile?.personalDetails?.mobileNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-warning-100 text-warning-600 rounded-lg">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">District</p>
                                <p className="font-semibold">{profile?.personalDetails?.district || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Status */}
            {
                profile?.status === 'pending' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-xl font-semibold">Registration Status</h3>
                        </div>
                        <div className="card-body">
                            <div className="bg-warning-light border border-warning rounded-lg p-4 mb-4">
                                <p className="text-warning-dark">
                                    <strong>Your application is under review.</strong> Our team will review your submission and notify you via email once a decision is made.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Application Submitted</span>
                                    <span className="font-semibold">{formatDate(profile.submittedAt)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Completion</span>
                                    <span className="font-semibold">{progress?.registrationProgress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Quick Links */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-xl font-semibold">Quick Links</h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="/member/profile" className="btn btn-outline">
                            <User className="w-4 h-4 mr-2" />
                            View Full Profile
                        </a>
                        <a href="/member/registration-details" className="btn btn-outline">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Registration Details
                        </a>
                        {profile?.membershipId && (
                            <a href="/member/membership-card" className="btn btn-primary">
                                View Membership Card
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
