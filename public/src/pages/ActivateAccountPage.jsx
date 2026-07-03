import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, UserCheck } from 'lucide-react';
import { resetPassword, validatePasswordResetToken } from '../api/authApi';

export default function ActivateAccountPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadToken = async () => {
            try {
                const response = await validatePasswordResetToken(token);
                setMember(response.data.member);
            } catch (err) {
                setError(err.message || 'This password setup link is invalid or has expired.');
            } finally {
                setIsLoading(false);
            }
        };

        loadToken();
    }, [token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPassword(token, password);
            navigate('/member/dashboard');
        } catch (err) {
            setError(err.message || 'Unable to set password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-900 mb-2">IEPSL Portal</h1>
                    <p className="text-gray-600">Set your member account password</p>
                </div>

                <div className="card">
                    <div className="card-header bg-primary-600 text-white">
                        <h2 className="text-2xl font-semibold">Account Activation</h2>
                        <p className="text-primary-100 text-sm mt-1">Create a password to access your account</p>
                    </div>
                    <div className="card-body">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="spinner w-10 h-10"></div>
                            </div>
                        ) : error && !member ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-error-light border border-error rounded-lg text-error-dark">
                                    {error}
                                </div>
                                <Link to="/forgot-password" className="btn btn-primary w-full">
                                    Request New Link
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                                    <UserCheck className="w-5 h-5 text-primary-600 mt-1" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{member?.name}</p>
                                        <p className="text-sm text-gray-600">{member?.email}</p>
                                        {member?.membershipId && (
                                            <p className="text-sm text-gray-600">Membership ID: {member.membershipId}</p>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-error-light border border-error rounded-lg text-error-dark">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="label">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            className="input pl-10 w-full"
                                            placeholder="Enter new password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            className="input pl-10 w-full"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                                    {isSubmitting ? 'Setting password...' : 'Set Password and Login'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
