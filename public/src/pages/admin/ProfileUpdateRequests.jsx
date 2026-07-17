import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { getProfileUpdateRequests, reviewProfileUpdateRequest } from '../../api/adminApi';
import { formatDate } from '../../utils/helpers';

function Changes({ changes }) {
    const rows = [];
    Object.entries(changes?.personalDetails || {}).forEach(([field, value]) => rows.push([`Personal: ${field}`, value]));
    Object.entries(changes?.officeDetails || {}).forEach(([field, value]) => rows.push([`Office: ${field}`, typeof value === 'object' ? JSON.stringify(value) : value]));
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">{rows.map(([field, value]) => <div key={field} className="rounded bg-gray-50 p-3 min-w-0"><p className="text-xs text-gray-500 break-words">{field}</p><p className="font-medium break-words">{String(value || 'Not provided')}</p></div>)}</div>;
}

export default function ProfileUpdateRequests() {
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState('pending');
    const [error, setError] = useState('');

    const load = async () => {
        try { const response = await getProfileUpdateRequests(status); if (response.success) setRequests(response.data); }
        catch (loadError) { setError(loadError.message || 'Failed to load update requests.'); }
    };
    useEffect(() => { load(); }, [status]);

    const review = async (requestId, decision) => {
        const notes = decision === 'rejected' ? (window.prompt('Reason for rejection:') || '') : '';
        if (decision === 'rejected' && !notes) return;
        try { await reviewProfileUpdateRequest(requestId, decision, notes); await load(); }
        catch (reviewError) { setError(reviewError.message || 'Failed to review request.'); }
    };

    return <div className="space-y-6"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-3xl font-bold text-gray-900">Profile Update Requests</h2><p className="text-gray-600 mt-1">Approve member changes before they replace live registration data.</p></div><select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All</option></select></div>
        {error && <div className="rounded-lg border border-error bg-error-light p-4 text-error-dark">{error}</div>}
        {requests.length === 0 ? <div className="card card-body text-center text-gray-500 py-12">No {status || ''} update requests.</div> : requests.map((request) => <div className="card" key={request._id}><div className="card-header flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold text-lg">{request.memberId?.personalDetails?.nameWithInitials || 'Member'}</h3><p className="text-sm text-gray-500">{request.memberId?.membershipId || 'No membership ID'} · {formatDate(request.createdAt)}</p></div><span className={`badge ${request.status === 'approved' ? 'badge-success' : request.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>{request.status}</span></div><div className="card-body space-y-4"><Changes changes={request.proposedChanges} />{request.status === 'pending' && <div className="flex gap-3 justify-end"><button className="btn btn-outline text-error" onClick={() => review(request._id, 'rejected')}><X className="w-4 h-4 mr-2" />Reject</button><button className="btn btn-primary" onClick={() => review(request._id, 'approved')}><Check className="w-4 h-4 mr-2" />Approve</button></div>}{request.reviewNotes && <p className="text-sm text-gray-600">Review note: {request.reviewNotes}</p>}</div></div>)}
    </div>;
}
