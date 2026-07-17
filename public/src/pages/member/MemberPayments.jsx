import React, { useEffect, useState } from 'react';
import { Upload, CheckCircle, Clock } from 'lucide-react';
import { getMemberPayments, submitMemberPayment } from '../../api/memberApi';
import { formatCurrency, formatDate, formatPaymentStatus, getAssetUrl } from '../../utils/helpers';

const currentYear = new Date().getFullYear();
const initialForm = {
    paymentType: 'annual', paymentYear: currentYear, amount: '',
    paymentMethod: 'bank_transfer', transactionId: '', receiptNumber: '',
    paidAt: new Date().toISOString().slice(0, 10), notes: '', paymentProof: null
};

export default function MemberPayments() {
    const [data, setData] = useState({ summary: null, payments: [] });
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadPayments = async () => {
        try {
            const response = await getMemberPayments();
            if (response.success) setData(response.data);
        } catch (loadError) {
            setError(loadError.message || 'Failed to load payment records.');
        } finally { setLoading(false); }
    };

    useEffect(() => { loadPayments(); }, []);

    const submitPayment = async (event) => {
        event.preventDefault();
        setSaving(true); setMessage(''); setError('');
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== '') payload.append(key, value);
            });
            const response = await submitMemberPayment(payload);
            setMessage(response.message || 'Payment submitted for verification.');
            setForm(initialForm);
            await loadPayments();
        } catch (saveError) {
            setError(saveError.message || 'Failed to submit payment.');
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">My Payments</h2>
                <p className="text-gray-600 mt-1">Submit annual payments and follow their verification status.</p>
            </div>

            {(message || error) && <div className={`rounded-lg border p-4 ${error ? 'border-error bg-error-light text-error-dark' : 'border-success bg-success-50 text-success-700'}`}>{error || message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="card"><div className="card-body"><p className="text-sm text-gray-500">Current year</p><p className="text-2xl font-bold">{data.summary ? formatPaymentStatus(data.summary.currentYearStatus) : 'Not recorded'}</p></div></div>
                <div className="card"><div className="card-body"><p className="text-sm text-gray-500">Last paid year</p><p className="text-2xl font-bold">{data.summary?.latestPaidYear || 'None'}</p></div></div>
                <div className="card"><div className="card-body"><p className="text-sm text-gray-500">Records</p><p className="text-2xl font-bold">{data.payments?.length || 0}</p></div></div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="text-xl font-semibold">Record a Payment</h3><p className="text-sm text-gray-500 mt-1">Your entry remains pending until an administrator checks it.</p></div>
                <form className="card-body space-y-5" onSubmit={submitPayment}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="label">Payment type</label><select className="input w-full" value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}><option value="annual">Annual</option><option value="renewal">Renewal</option><option value="registration">Registration</option></select></div>
                        <div><label className="label">Payment year</label><input className="input w-full" type="number" min="2000" max="2100" value={form.paymentYear} onChange={(e) => setForm({ ...form, paymentYear: e.target.value })} required /></div>
                        <div><label className="label">Amount (LKR)</label><input className="input w-full" type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                        <div><label className="label">Method</label><select className="input w-full" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}><option value="bank_transfer">Bank transfer</option><option value="card">Card</option><option value="cash">Cash</option></select></div>
                        <div><label className="label">Transaction ID</label><input className="input w-full" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} /></div>
                        <div><label className="label">Payment date</label><input className="input w-full" type="date" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Payment proof</label><input className="input w-full py-3" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setForm({ ...form, paymentProof: e.target.files[0] || null })} /><p className="text-xs text-gray-500 mt-1">JPEG, PNG, or PDF up to 5 MB.</p></div>
                    <div><label className="label">Notes</label><textarea className="input w-full" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <button className="btn btn-primary" disabled={saving}><Upload className="w-4 h-4 mr-2" />{saving ? 'Submitting...' : 'Submit Payment'}</button>
                </form>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="text-xl font-semibold">Payment History</h3></div>
                <div className="card-body p-0 overflow-x-auto">
                    {loading ? <div className="p-8 text-center">Loading...</div> : !data.payments?.length ? <div className="p-8 text-center text-gray-500">No payment records yet.</div> : (
                        <table className="table"><thead className="table-header"><tr><th className="table-header-cell">Year</th><th className="table-header-cell">Amount</th><th className="table-header-cell">Method</th><th className="table-header-cell">Submitted</th><th className="table-header-cell">Status</th><th className="table-header-cell">Proof</th></tr></thead><tbody className="table-body">
                            {data.payments.map((payment) => <tr key={payment._id}><td className="table-cell">{payment.paymentYear || 'N/A'}</td><td className="table-cell">{formatCurrency(payment.amount)}</td><td className="table-cell capitalize">{payment.paymentMethod?.replace('_', ' ')}</td><td className="table-cell">{formatDate(payment.createdAt)}</td><td className="table-cell"><span className={`badge ${payment.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}`}>{payment.paymentStatus === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}{formatPaymentStatus(payment.paymentStatus)}</span></td><td className="table-cell">{payment.paymentProof ? <a className="text-primary-600" href={getAssetUrl(payment.paymentProof)} target="_blank" rel="noreferrer">View</a> : 'None'}</td></tr>)}
                        </tbody></table>
                    )}
                </div>
            </div>
        </div>
    );
}
