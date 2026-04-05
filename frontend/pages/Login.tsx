import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { GoogleIcon } from '../components/icons';

interface LoginProps {
    navigateTo: (page: Page) => void;
}

export const Login: React.FC<LoginProps> = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
    const { login, signInWithGoogle, signInWithApple, error: authError, clearError } = useAuth();

    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);

    const validateForm = () => {
        const errors: { email?: string; password?: string } = {};
        
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Invalid email format';
        }
        
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 3) {
            errors.password = 'Password must be at least 3 characters';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setError('');
        clearError?.();
        setLoading(true);
        
        try {
            await login(email, password);
            navigateTo('home');
        } catch (err: any) {
            const errorMsg = err?.message || 'Failed to sign in. Please check your credentials.';
            setError(errorMsg);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        clearError?.();
        setLoading(true);
        try {
            // In production, you would integrate with Google Sign-In library
            // For now, this is a placeholder
            alert('Google Sign-In integration required. Use the Google Sign-In button from google.com');
            setLoading(false);
        } catch (err) {
             setError('Failed to sign in with Google.');
             setLoading(false);
        }
    }

    const handleAppleSignIn = async () => {
        setError('');
        clearError?.();
        setLoading(true);
        try {
            // In production, you would integrate with Apple Sign-In library
            // For now, this is a placeholder
            alert('Apple Sign-In integration required. Use the Apple Sign-In button from apple.com');
            setLoading(false);
        } catch (err) {
             setError('Failed to sign in with Apple.');
             setLoading(false);
        }
    }
    
    // A single, clear style for form inputs
    const inputClasses = "appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
    const errorInputClasses = inputClasses + " border-red-500 focus:ring-red-500 focus:border-red-500";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-5rem)]">
            <div className="flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h1 className="font-serif text-4xl font-bold text-center text-brand-charcoal dark:text-brand-cream cursor-pointer" onClick={() => navigateTo('home')}>
                            ezooze
                        </h1>
                        <h2 className="mt-6 text-center text-2xl font-serif text-brand-charcoal dark:text-brand-cream">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Sign in to continue to your account.
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="text-sm text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={validationErrors.email ? errorInputClasses : inputClasses}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (validationErrors.email) {
                                        setValidationErrors({ ...validationErrors, email: undefined });
                                    }
                                }}
                            />
                            {validationErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                            )}
                        </div>
                        
                        <div>
                           <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className={validationErrors.password ? errorInputClasses : inputClasses}
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (validationErrors.password) {
                                        setValidationErrors({ ...validationErrors, password: undefined });
                                    }
                                }}
                            />
                            {validationErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <button type="button" onClick={() => navigateTo('forgotPassword')} className="font-medium text-brand-gold hover:text-yellow-600 hover:underline">
                                    Forgot your password?
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-charcoal hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-brand-cream dark:bg-brand-charcoal text-gray-500 dark:text-gray-400">
                                Or sign in with
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <GoogleIcon className="h-5 w-5 mr-2" />
                            Sign in with Google
                        </button>

                        <button
                            type="button"
                            onClick={handleAppleSignIn}
                            disabled={loading}
                            className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 13.5c-.91 0-1.64.54-2.16 1.27.63.49 1.04 1.24 1.04 2.08 0 1.5-1.25 2.72-2.79 2.72-1.54 0-2.79-1.22-2.79-2.72 0-.84.41-1.59 1.04-2.08-.52-.73-1.25-1.27-2.16-1.27-2.16 0-3.91 1.75-3.91 3.91 0 2.16 1.75 3.91 3.91 3.91 1.3 0 2.45-.63 3.18-1.59.73.96 1.88 1.59 3.18 1.59 2.16 0 3.91-1.75 3.91-3.91 0-2.16-1.75-3.91-3.91-3.91z"/>
                                <path d="M10.5 6.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5S14.38 4 13 4s-2.5 1.12-2.5 2.5z"/>
                            </svg>
                            Sign in with Apple
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <button onClick={() => navigateTo('register')} type="button" className="font-medium text-brand-gold hover:text-yellow-600 hover:underline">
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
             <div className="hidden md:block relative">
                <img className="absolute inset-0 h-full w-full object-cover" src="https://picsum.photos/seed/login/1080/1920" alt="Woman in elegant clothing" />
                <div className="absolute inset-0 bg-brand-charcoal/30"></div>
            </div>
        </div>
    );
};
