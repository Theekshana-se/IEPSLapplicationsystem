import React, { useEffect, useState } from 'react';
import { Save, Clock } from 'lucide-react';
import { getMemberProfile, getMyProfileUpdateRequests, submitProfileUpdateRequest } from '../../api/memberApi';
import { DISTRICTS, GENDERS, NAME_PREFIXES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

export default function MemberUpdateDetails() {
    const [form, setForm] = useState({ personalDetails: {}, officeDetails: {} });
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const [profileResponse, requestResponse] = await Promise.all([getMemberProfile(), getMyProfileUpdateRequests()]);
            const profile = profileResponse.data.user;
            setForm({
                personalDetails: {
                    ...profile.personalDetails,
                    dateOfBirth: profile.personalDetails?.dateOfBirth?.slice(0, 10) || ''
                },
                officeDetails: profile.officeDetails || {}
            });
            if (requestResponse.success) setRequests(requestResponse.data);
        } catch (loadError) { setError(loadError.message || 'Failed to load registration details.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const setPersonal = (field, value) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, [field]: value } }));
    const setOffice = (field, value) => setForm((current) => ({ ...current, officeDetails: { ...current.officeDetails, [field]: value } }));

    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setMessage(''); setError('');
        try {
            const response = await submitProfileUpdateRequest(form);
            setMessage(response.message);
            await load();
        } catch (saveError) { setError(saveError.message || 'Failed to submit update request.'); }
        finally { setSaving(false); }
    };

    const pending = requests.find((request) => request.status === 'pending');
    if (loading) return <div className="flex justify-center py-16"><div className="spinner w-12 h-12" /></div>;

    return (
        <div className="space-y-6">
            <div><h2 className="text-3xl font-bold text-gray-900">Update Registration Details</h2><p className="text-gray-600 mt-1">Changes are reviewed by an administrator before replacing your live profile.</p></div>
            {(message || error) && <div className={`rounded-lg border p-4 ${error ? 'border-error bg-error-light text-error-dark' : 'border-success bg-success-50 text-success-700'}`}>{error || message}</div>}
            {pending && <div className="rounded-lg border border-warning bg-warning-light p-4 text-warning-dark flex gap-3"><Clock className="w-5 h-5 shrink-0" /><div><p className="font-semibold">Approval pending</p><p className="text-sm">Submitted {formatDate(pending.createdAt)}. You can submit another request after this one is reviewed.</p></div></div>}

            <form className="space-y-6" onSubmit={submit}>
                <div className="card"><div className="card-header"><h3 className="text-xl font-semibold">Personal Details</h3></div><div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label">Prefix</label><select className="input w-full" value={form.personalDetails.prefix || ''} onChange={(e) => setPersonal('prefix', e.target.value)}>{NAME_PREFIXES.map((item) => <option key={item}>{item}</option>)}</select></div>
                    <div><label className="label">Name with initials</label><input className="input w-full" value={form.personalDetails.nameWithInitials || ''} onChange={(e) => setPersonal('nameWithInitials', e.target.value)} required /></div>
                    <div className="md:col-span-2"><label className="label">Full name</label><input className="input w-full" value={form.personalDetails.fullName || ''} onChange={(e) => setPersonal('fullName', e.target.value)} required /></div>
                    <div><label className="label">Date of birth</label><input className="input w-full" type="date" value={form.personalDetails.dateOfBirth || ''} onChange={(e) => setPersonal('dateOfBirth', e.target.value)} required /></div>
                    <div><label className="label">NIC number</label><input className="input w-full" value={form.personalDetails.nicNumber || ''} onChange={(e) => setPersonal('nicNumber', e.target.value)} required /></div>
                    <div><label className="label">Nationality</label><input className="input w-full" value={form.personalDetails.nationality || ''} onChange={(e) => setPersonal('nationality', e.target.value)} required /></div>
                    <div><label className="label">Gender</label><select className="input w-full" value={form.personalDetails.gender || ''} onChange={(e) => setPersonal('gender', e.target.value)}>{GENDERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                    <div><label className="label">District</label><select className="input w-full" value={form.personalDetails.district || ''} onChange={(e) => setPersonal('district', e.target.value)}>{DISTRICTS.map((item) => <option key={item}>{item}</option>)}</select></div>
                    <div><label className="label">Mobile number</label><input className="input w-full" value={form.personalDetails.mobileNumber || ''} onChange={(e) => setPersonal('mobileNumber', e.target.value)} required /></div>
                    <div className="md:col-span-2"><label className="label">Personal email</label><input className="input w-full" type="email" value={form.personalDetails.personalEmail || ''} onChange={(e) => setPersonal('personalEmail', e.target.value)} required /></div>
                    <div className="md:col-span-2"><label className="label">Residential address</label><textarea className="input w-full" rows="3" value={form.personalDetails.residentialAddress || ''} onChange={(e) => setPersonal('residentialAddress', e.target.value)} required /></div>
                </div></div>
                <div className="card"><div className="card-header"><h3 className="text-xl font-semibold">Office Details</h3></div><div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="label">Office address</label><textarea className="input w-full" rows="2" value={form.officeDetails.officeAddress || ''} onChange={(e) => setOffice('officeAddress', e.target.value)} /></div>
                    <div><label className="label">Office phone</label><input className="input w-full" value={form.officeDetails.officePhone || ''} onChange={(e) => setOffice('officePhone', e.target.value)} /></div>
                    <div><label className="label">Office email</label><input className="input w-full" type="email" value={form.officeDetails.officeEmail || ''} onChange={(e) => setOffice('officeEmail', e.target.value)} /></div>
                </div></div>
                <button className="btn btn-primary" disabled={saving || Boolean(pending)}><Save className="w-4 h-4 mr-2" />{saving ? 'Submitting...' : 'Submit for Approval'}</button>
            </form>

            {requests.length > 0 && <div className="card"><div className="card-header"><h3 className="text-xl font-semibold">Request History</h3></div><div className="card-body space-y-3">{requests.map((request) => <div key={request._id} className="flex items-center justify-between border-b pb-3"><div><p className="font-medium capitalize">{request.status}</p><p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p></div>{request.reviewNotes && <p className="text-sm text-gray-600">{request.reviewNotes}</p>}</div>)}</div></div>}
        </div>
    );
}
