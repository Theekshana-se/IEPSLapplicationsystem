import React, { useState, useEffect } from 'react';
import { getPendingRegistrations, approveMember, rejectMember, getMemberDetails } from '../../api/adminApi';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

export default function PendingRegistrations() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectMemberId, setRejectMemberId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        loadApplications();
    }, [search]);

    const loadApplications = async () => {
        try {
            const response = await getPendingRegistrations(1, 50, search);
            if (response.success) {
                setApplications(response.data.members);
            }
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewDetails = async (memberId) => {
        try {
            const response = await getMemberDetails(memberId);
            if (response.success) {
                setSelectedMember(response.data.member);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error loading member details:', error);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleApprove = async (memberId) => {
        // if (!confirm('Are you sure you want to approve this application?')) return; // Replaced with immediate action for now or could add a confirmation modal later

        setActionLoading(true);
        try {
            await approveMember(memberId);
            showNotification('Member approved successfully!', 'success');
            loadApplications();
            setShowModal(false);
        } catch (error) {
            showNotification('Error approving member: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const initReject = (memberId) => {
        setRejectMemberId(memberId);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (!rejectionReason.trim()) {
            showNotification('Please enter a rejection reason', 'error');
            return;
        }

        setActionLoading(true);
        try {
            await rejectMember(rejectMemberId, rejectionReason);
            showNotification('Member rejected successfully', 'success');
            loadApplications();
            setShowModal(false);
            setShowRejectModal(false);
        } catch (error) {
            showNotification('Error rejecting member: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Pending Registrations</h2>
                    <p className="text-gray-600 mt-1">Review and approve membership applications</p>
                </div>
                <span className="badge badge-warning text-lg px-4 py-2">
                    {applications.length} Pending
                </span>
            </div>

            {/* Search */}
            <div className="card">
                <div className="card-body">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or NIC..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="spinner w-12 h-12"></div>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No pending applications</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">Name</th>
                                        <th className="table-header-cell">Email</th>
                                        <th className="table-header-cell">NIC</th>
                                        <th className="table-header-cell">District</th>
                                        <th className="table-header-cell">Submitted</th>
                                        <th className="table-header-cell">Progress</th>
                                        <th className="table-header-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {applications.map((member) => (
                                        <tr key={member._id}>
                                            <td className="table-cell font-medium">
                                                {member.personalDetails?.nameWithInitials}
                                            </td>
                                            <td className="table-cell text-gray-600">
                                                {member.personalDetails?.personalEmail}
                                            </td>
                                            <td className="table-cell">{member.personalDetails?.nicNumber}</td>
                                            <td className="table-cell">{member.personalDetails?.district}</td>
                                            <td className="table-cell">{formatDate(member.submittedAt)}</td>
                                            <td className="table-cell">
                                                <span className="badge badge-primary">{member.registrationProgress}%</span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => viewDetails(member._id)}
                                                        className="btn btn-ghost btn-sm"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(member._id)}
                                                        className="btn btn-ghost btn-sm text-success"
                                                        disabled={actionLoading}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => initReject(member._id)}
                                                        className="btn btn-ghost btn-sm text-error"
                                                        disabled={actionLoading}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Member Details Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Application Details"
                maxWidth="max-w-4xl"
                actions={
                    selectedMember && (
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => handleApprove(selectedMember._id)}
                                disabled={actionLoading}
                                className="btn btn-primary flex-1"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Application
                            </button>
                            <button
                                onClick={() => initReject(selectedMember._id)}
                                disabled={actionLoading}
                                className="btn btn-danger flex-1"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Application
                            </button>
                        </div>
                    )
                }
            >
                {selectedMember && (
                    <div className="text-left">
                        {/* Personal Details */}
                        <div>
                            <h4 className="text-lg font-semibold mb-3">Personal Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-medium">Name:</span> {selectedMember.personalDetails?.fullName}</div>
                                <div><span className="font-medium">NIC:</span> {selectedMember.personalDetails?.nicNumber}</div>
                                <div><span className="font-medium">Email:</span> {selectedMember.personalDetails?.personalEmail}</div>
                                <div><span className="font-medium">Mobile:</span> {selectedMember.personalDetails?.mobileNumber}</div>
                                <div><span className="font-medium">District:</span> {selectedMember.personalDetails?.district}</div>
                                <div><span className="font-medium">Gender:</span> {selectedMember.personalDetails?.gender}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Rejection Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reject Application"
                type="warning"
                actions={
                    <>
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="btn btn-ghost"
                            disabled={actionLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmReject}
                            className="btn btn-danger px-6"
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="spinner w-4 h-4"></div>
                                    Rejecting...
                                </span>
                            ) : (
                                'Confirm Rejection'
                            )}
                        </button>
                    </>
                }
            >
                <p className="mb-4 text-sm text-gray-600">
                    Please provide a reason for rejecting this application. This information will be visible to the applicant.
                </p>
                <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason <span className="text-error">*</span>
                    </label>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="input w-full min-h-[100px]"
                        placeholder="e.g., Missing certified copies of educational certificates..."
                        autoFocus
                    />
                </div>
            </Modal>

            {/* Notifications */}
            {notification.show && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}
        </div>
    );
}
