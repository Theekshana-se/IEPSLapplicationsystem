import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { forgotPassword } from '../api/authApi';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await forgotPassword(email);
            setMessage(response.message || 'If this email exists, a password reset link will be sent.');
        } catch (err) {
            setError(err.message || 'Unable to request password reset.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-900 mb-2">IEPSL Portal</h1>
                    <p className="text-gray-600">Password reset for member accounts</p>
                </div>

                <div className="card">
                    <div className="card-header bg-primary-600 text-white">
                        <h2 className="text-2xl font-semibold">Reset Password</h2>
                        <p className="text-primary-100 text-sm mt-1">Enter your member email address</p>
                    </div>
                    <div className="card-body">
                        {message && (
                            <div className="mb-6 p-4 bg-success-light border border-success rounded-lg text-success-dark">
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="mb-6 p-4 bg-error-light border border-error rounded-lg text-error-dark">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="label">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="input pl-10 w-full"
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className="text-center pt-4 border-t">
                                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
