import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createMemberCategory, deleteMemberCategory, getMemberCategories, updateMemberCategory } from '../../api/adminApi';

export default function MemberCategories() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', description: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const load = async () => {
        try { const response = await getMemberCategories(); if (response.success) setCategories(response.data); }
        catch (loadError) { setError(loadError.message || 'Failed to load categories.'); }
    };
    useEffect(() => { load(); }, []);

    const create = async (event) => {
        event.preventDefault(); setMessage(''); setError('');
        try { const response = await createMemberCategory(form); setMessage(response.message); setForm({ name: '', description: '' }); await load(); }
        catch (saveError) { setError(saveError.message || 'Failed to create category.'); }
    };

    const update = async (category, changes) => {
        try { await updateMemberCategory(category._id, changes); await load(); }
        catch (saveError) { setError(saveError.message || 'Failed to update category.'); }
    };

    const remove = async (category) => {
        if (!window.confirm(`Delete ${category.name}?`)) return;
        try { await deleteMemberCategory(category._id); await load(); }
        catch (deleteError) { setError(deleteError.message || 'Failed to delete category.'); }
    };

    return <div className="space-y-6"><div><h2 className="text-3xl font-bold text-gray-900">Member Categories</h2><p className="text-gray-600 mt-1">Create categories here, then assign them from All Members.</p></div>
        {(message || error) && <div className={`rounded-lg border p-4 ${error ? 'border-error bg-error-light text-error-dark' : 'border-success bg-success-50 text-success-700'}`}>{error || message}</div>}
        <form className="card card-body grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-end" onSubmit={create}><div><label className="label">Category name</label><input className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div><div><label className="label">Description</label><input className="input w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><button className="btn btn-primary"><Plus className="w-4 h-4 mr-2" />Add</button></form>
        <div className="card"><div className="card-body space-y-3">{categories.length === 0 ? <p className="text-gray-500 text-center py-8">No categories created.</p> : categories.map((category) => <div key={category._id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto_auto] gap-3 items-center border-b pb-3"><input className="input" defaultValue={category.name} onBlur={(e) => e.target.value !== category.name && update(category, { name: e.target.value })} /><input className="input" defaultValue={category.description} onBlur={(e) => e.target.value !== category.description && update(category, { description: e.target.value })} /><button className={`btn btn-sm ${category.isActive ? 'btn-outline' : 'btn-primary'}`} onClick={() => update(category, { isActive: !category.isActive })}>{category.isActive ? 'Deactivate' : 'Activate'}</button><button className="btn btn-ghost btn-sm text-error" onClick={() => remove(category)}><Trash2 className="w-4 h-4" /></button></div>)}</div></div>
    </div>;
}
