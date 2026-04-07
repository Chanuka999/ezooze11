import React, { useState } from 'react';
import { Page } from '../types';

interface ForgotPasswordProps {
    navigateTo: (page: Page) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        setMessage(`If an account exists for ${email}, a password reset link has been sent.`);
    };
    
    const inputClasses = "appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-5rem)]">
             <div className="flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="font-serif text-4xl font-bold text-center text-brand-charcoal dark:text-brand-cream cursor-pointer" onClick={() => navigateTo('home')}>
                            ezooze
                        </h1>
                        <h2 className="mt-6 text-center text-2xl font-serif text-brand-charcoal dark:text-brand-cream">
                            Reset Your Password
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Enter your email to receive a reset link.
                        </p>
                    </div>

                    {message ? (
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                            <p className="text-green-700 dark:text-green-300">{message}</p>
                            <div className="text-sm mt-6">
                                <button onClick={() => navigateTo('login')} type="button" className="font-medium text-brand-gold hover:text-yellow-600 hover:underline">
                                    &larr; Back to Sign in
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="rounded-md shadow-sm">
                                <div>
                                    <label htmlFor="email-reset" className="sr-only">Email address</label>
                                    <input
                                        id="email-reset"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className={`${inputClasses} rounded-md`}
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-charcoal hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                             <div className="text-sm text-center">
                                <button onClick={() => navigateTo('login')} type="button" className="font-medium text-brand-gold hover:text-yellow-600 hover:underline">
                                    &larr; Back to Sign in
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
             <div className="hidden md:block relative">
                <img className="absolute inset-0 h-full w-full object-cover" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Elegant fabric texture" />
                <div className="absolute inset-0 bg-brand-charcoal/30"></div>
            </div>
        </div>
    );
};
