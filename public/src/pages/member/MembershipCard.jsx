import React, { useState, useEffect } from 'react';
import { getMemberProfile } from '../../api/memberApi';
import { Download, CreditCard, User } from 'lucide-react';
import { getAssetUrl } from '../../utils/helpers';

export default function MembershipCard() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await getMemberProfile();
            if (response.success) {
                setProfile(response.data.user);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
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

    if (!profile?.membershipId) {
        return (
            <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Membership Card Not Available</h3>
                <p className="text-gray-600">
                    Your membership card will be available once your application is active.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Membership Card</h2>
                    <p className="text-gray-600 mt-1">Your official IEPSL membership card</p>
                </div>
                <button className="btn btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download Card
                </button>
            </div>

            {/* Membership Card */}
            <div className="max-w-2xl mx-auto">
                <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Card Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
                    </div>

                    {/* Card Content */}
                    <div className="relative p-8 text-white">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold">IEPSL</h3>
                                <p className="text-sm text-primary-100">Institute of Environmental Professionals Sri Lanka</p>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                                <CreditCard className="w-10 h-10 text-primary-600" />
                            </div>
                        </div>

                        {/* Member Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/15 border border-white/20 flex items-center justify-center">
                                    {profile.documents?.profilePhoto ? (
                                        <img
                                            src={getAssetUrl(profile.documents.profilePhoto)}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-white" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-primary-100 uppercase tracking-wide mb-1">Member Name</p>
                                    <p className="text-2xl font-bold break-words">{profile.personalDetails?.fullName}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-primary-100 uppercase tracking-wide mb-1">Contact Email</p>
                                <p className="text-lg break-all">{profile.personalDetails?.personalEmail}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-primary-100 uppercase tracking-wide mb-1">Membership ID</p>
                                    <p className="text-lg font-mono font-semibold">{profile.membershipId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-100 uppercase tracking-wide mb-1">Status</p>
                                    <p className="text-lg font-semibold capitalize">{profile.status === 'approved' ? 'active' : profile.status}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-primary-100 uppercase tracking-wide mb-1">District</p>
                                    <p className="text-lg">{profile.personalDetails?.district}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-100 uppercase tracking-wide mb-1">Member Since</p>
                                    <p className="text-lg">{new Date(profile.createdAt).getFullYear()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-primary-400">
                            <p className="text-xs text-primary-100">
                                This card certifies that the holder is a registered member of IEPSL
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card Info */}
                <div className="mt-6 card">
                    <div className="card-body">
                        <h4 className="font-semibold mb-3">Card Information</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>• This is your official IEPSL membership card</p>
                            <p>• Keep your membership ID safe for identification purposes</p>
                            <p>• You can download a digital copy using the button above</p>
                            <p>• For a physical card, please contact the IEPSL office</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
