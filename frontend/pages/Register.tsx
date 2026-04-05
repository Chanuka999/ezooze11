import React, { useState } from 'react';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { GoogleIcon } from '../components/icons';

interface RegisterProps {
    navigateTo: (page: Page) => void;
}

export const Register: React.FC<RegisterProps> = ({ navigateTo }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigateTo('home');
        } catch (err) {
            setError('Failed to create an account. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            navigateTo('home');
        } catch (err) {
             setError('Failed to sign in with Google.');
        } finally {
            setLoading(false);
        }
    }

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
                            Create Your Account
                        </h2>
                         <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Join the world of lasting elegance.
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <p className="text-center text-sm text-red-600 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="full-name" className="sr-only">Full Name</label>
                                <input id="full-name" name="name" type="text" required className={`${inputClasses} rounded-t-md`} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="email-register" className="sr-only">Email address</label>
                                <input id="email-register" name="email" type="email" autoComplete="email" required className={`${inputClasses}`} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="password-register" className="sr-only">Password</label>
                                <input id="password-register" name="password" type="password" required className={`${inputClasses}`} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                                <input id="confirm-password" name="confirm-password" type="password" required className={`${inputClasses} rounded-b-md`} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-charcoal hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-brand-cream dark:bg-brand-charcoal text-gray-500 dark:text-gray-400">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    
                    <div>
                         <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            <GoogleIcon className="h-5 w-5 mr-2" />
                            Sign up with Google
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <button onClick={() => navigateTo('login')} type="button" className="font-medium text-brand-gold hover:text-yellow-600 hover:underline">
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
             <div className="hidden md:block relative">
                <img className="absolute inset-0 h-full w-full object-cover" src="https://picsum.photos/seed/register/1080/1920" alt="Woman in elegant clothing" />
                <div className="absolute inset-0 bg-brand-charcoal/30"></div>
            </div>
        </div>
    );
};