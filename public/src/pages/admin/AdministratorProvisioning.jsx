import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createAdministrator, getAdministrators } from '../../api/adminApi';
import { formatDate } from '../../utils/helpers';

export default function AdministratorProvisioning() {
    const [admins, setAdmins] = useState([]);
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const load = async () => {
        try { const response = await getAdministrators(); if (response.success) setAdmins(response.data); }
        catch (loadError) { setError(loadError.message || 'Failed to load administrators.'); }
    };
    useEffect(() => { load(); }, []);

    const create = async (event) => {
        event.preventDefault(); setMessage(''); setError('');
        try { const response = await createAdministrator(form); setMessage(response.message); setForm({ username: '', email: '', password: '' }); await load(); }
        catch (saveError) { setError(saveError.message || 'Failed to create administrator.'); }
    };

    return <div className="space-y-6 max-w-5xl"><div><h2 className="text-3xl font-bold text-gray-900">Administrator Accounts</h2><p className="text-gray-600 mt-1">Create standard administrator accounts for the IEPSL portal.</p></div>
        {(message || error) && <div className={`rounded-lg border p-4 ${error ? 'border-error bg-error-light text-error-dark' : 'border-success bg-success-50 text-success-700'}`}>{error || message}</div>}
        <form className="card card-body space-y-4" onSubmit={create}><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="label">Username</label><input className="input w-full" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div><div><label className="label">Email</label><input className="input w-full" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div><div><label className="label">Temporary password</label><input className="input w-full" type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div></div><div><button className="btn btn-primary"><UserPlus className="w-4 h-4 mr-2" />Create Administrator</button></div></form>
        <div className="card"><div className="card-header"><h3 className="text-xl font-semibold">Standard Administrators</h3></div><div className="card-body p-0 overflow-x-auto"><table className="table"><thead className="table-header"><tr><th className="table-header-cell">Username</th><th className="table-header-cell">Email</th><th className="table-header-cell">Status</th><th className="table-header-cell">Created</th><th className="table-header-cell">Last login</th></tr></thead><tbody className="table-body">{admins.map((admin) => <tr key={admin._id}><td className="table-cell font-medium">{admin.username}</td><td className="table-cell">{admin.email}</td><td className="table-cell"><span className={`badge ${admin.isActive ? 'badge-success' : 'badge-error'}`}>{admin.isActive ? 'Active' : 'Inactive'}</span></td><td className="table-cell">{formatDate(admin.createdAt)}</td><td className="table-cell">{admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}</td></tr>)}</tbody></table></div></div>
    </div>;
}
