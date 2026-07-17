import React, { useEffect, useState } from 'react';
import { getPaymentSummary, getPayments, verifyPayment, sendRenewalReminders } from '../../api/adminApi';
import { formatCurrency, formatDate, formatPaymentStatus, getAssetUrl } from '../../utils/helpers';
import { BellRing, CreditCard, Search, CheckCircle2, Clock3, AlertCircle } from 'lucide-react';

const currentYear = new Date().getFullYear();

export default function PaymentManagement() {
    const canManage = JSON.parse(localStorage.getItem('user') || '{}').role === 'admin';
    const [summary, setSummary] = useState(null);
    const [payments, setPayments] = useState([]);
    const [filters, setFilters] = useState({ year: currentYear, status: '', search: '' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [filters.year, filters.status, filters.search]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [summaryRes, paymentsRes] = await Promise.all([
                getPaymentSummary(filters.year),
                getPayments(filters)
            ]);

            if (summaryRes.success) setSummary(summaryRes.data);
            if (paymentsRes.success) setPayments(paymentsRes.data);
        } catch (loadError) {
            console.error('Error loading payment data:', loadError);
            setError(loadError.message || 'Failed to load payment data');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPayment = async (paymentId) => {
        try {
            await verifyPayment(paymentId, { paymentStatus: 'completed' });
            setMessage('Payment verified successfully.');
            loadData();
        } catch (verifyError) {
            setError(verifyError.message || 'Failed to verify payment');
        }
    };

    const handleSendReminders = async () => {
        try {
            const response = await sendRenewalReminders(filters.year);
            if (response.success) {
                setMessage(response.message);
                loadData();
            }
        } catch (reminderError) {
            setError(reminderError.message || 'Failed to send reminders');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Payment Management</h2>
                    <p className="text-gray-600 mt-1">Verify member-submitted payments, track annual renewals, and send reminders.</p>
                </div>
                {canManage && <button className="btn btn-secondary" type="button" onClick={handleSendReminders}>
                    <BellRing className="w-4 h-4 mr-2" />
                    Send {filters.year} Renewal Reminders
                </button>}
            </div>

            {(message || error) && (
                <div className={`rounded-lg border p-4 text-sm ${error
                        ? 'border-error bg-error-light text-error-dark'
                        : 'border-success bg-success-50 text-success-700'
                    }`}>
                    {error || message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="card"><div className="card-body"><p className="text-sm text-gray-600">Payments Logged</p><p className="text-3xl font-bold text-gray-900">{summary?.totalPayments || 0}</p></div></div>
                <div className="card"><div className="card-body"><p className="text-sm text-gray-600">Pending Verification</p><p className="text-3xl font-bold text-warning">{summary?.pendingVerifications || 0}</p></div></div>
                <div className="card"><div className="card-body"><p className="text-sm text-gray-600">Renewals Due</p><p className="text-3xl font-bold text-error">{summary?.membersDueThisYear || 0}</p></div></div>
                <div className="card"><div className="card-body"><p className="text-sm text-gray-600">Total Received</p><p className="text-3xl font-bold text-success">{formatCurrency(summary?.totalReceived || 0)}</p></div></div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-xl font-semibold">Members Due for {filters.year}</h3>
                    </div>
                    <div className="card-body space-y-3 max-h-[520px] overflow-y-auto">
                        {summary?.dueMembers?.length ? summary.dueMembers.map((member) => (
                            <div key={member._id} className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.membershipId || 'No membership ID'}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                    <span className={`badge ${member.currentYearStatus === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                                        {formatPaymentStatus(member.currentYearStatus)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-3">
                                    Last paid year: {member.latestPaidYear || 'Not recorded'}
                                </p>
                            </div>
                        )) : (
                            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                                No renewal dues for this year.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h3 className="text-xl font-semibold">Payment Ledger</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input className="input pl-10 w-full" placeholder="Search member or receipt" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
                            </div>
                            <input className="input w-full" type="number" value={filters.year} onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))} />
                            <select className="input w-full" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="spinner w-12 h-12"></div>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No payments found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">Member</th>
                                        <th className="table-header-cell">Year</th>
                                        <th className="table-header-cell">Amount</th>
                                        <th className="table-header-cell">Method</th>
                                        <th className="table-header-cell">Source</th>
                                        <th className="table-header-cell">Status</th>
                                        <th className="table-header-cell">Proof</th>
                                        <th className="table-header-cell">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {payments.map((payment) => (
                                        <tr key={payment._id}>
                                            <td className="table-cell">
                                                <div>
                                                    <p className="font-medium">{payment.memberId?.personalDetails?.nameWithInitials || payment.membershipId}</p>
                                                    <p className="text-xs text-gray-500">{payment.membershipId}</p>
                                                </div>
                                            </td>
                                            <td className="table-cell">{payment.paymentYear || 'N/A'}</td>
                                            <td className="table-cell">{formatCurrency(payment.amount || 0)}</td>
                                            <td className="table-cell capitalize">{payment.paymentMethod?.replace('_', ' ')}</td>
                                            <td className="table-cell capitalize">{payment.source === 'member' || payment.submittedByMember ? 'Member' : payment.source || 'Admin'}</td>
                                            <td className="table-cell">
                                                <span className={`badge ${payment.paymentStatus === 'completed' ? 'badge-success' : payment.paymentStatus === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                                                    {formatPaymentStatus(payment.paymentStatus)}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                {payment.paymentProof ? (
                                                    <a className="text-primary-600 hover:text-primary-700" href={getAssetUrl(payment.paymentProof)} target="_blank" rel="noreferrer">
                                                        View proof
                                                    </a>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                            <td className="table-cell">
                                                {payment.paymentStatus === 'pending' && canManage ? (
                                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleVerifyPayment(payment._id)}>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Verify
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-500">{formatDate(payment.verifiedAt || payment.createdAt)}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
