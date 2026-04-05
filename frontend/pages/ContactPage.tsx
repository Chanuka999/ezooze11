
import React, { useState } from 'react';
import { api } from '../api';
import { SpinnerIcon } from '../components/icons';

export const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [emailError, setEmailError] = useState('');
    const [isTouched, setIsTouched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) ? '' : 'Please enter a valid email address';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'email' && isTouched) {
            setEmailError(validateEmail(value));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.name === 'email') {
            setIsTouched(true);
            setEmailError(validateEmail(formData.email));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        
        const error = validateEmail(formData.email);
        if (error) {
            setIsTouched(true);
            setEmailError(error);
            return;
        }
        
        setIsLoading(true);
        try {
            await api.submitContactForm(formData);
            setSuccessMessage("Message sent successfully! We'll get back to you soon.");
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsTouched(false);
            setEmailError('');
        } catch (err) {
            setErrorMessage("Failed to send message. Please try again later.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="bg-brand-light-gray dark:bg-gray-800 py-24 sm:py-32">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-brand-charcoal dark:text-brand-cream sm:text-5xl lg:text-6xl">Contact Us</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">We're here to help. Reach out to us anytime and we'll happily answer your questions.</p>
                </div>
            </div>

            {/* Contact Form & Info Section */}
            <div className="py-24 sm:py-32">
                 <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-semibold font-serif text-brand-charcoal dark:text-brand-cream">Contact Information</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Fill up the form and our Team will get back to you within 24 hours.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <svg className="h-6 w-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <svg className="h-6 w-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span className="text-gray-600 dark:text-gray-400">contact@ezooze.com</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <svg className="h-6 w-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-gray-600 dark:text-gray-400">123 Elegance Ave, Fashion City, 10001</span>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-2xl font-semibold font-serif text-brand-charcoal dark:text-brand-cream mt-8">Business Hours</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Monday - Friday: 9am - 5pm</p>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">Saturday: 10am - 4pm</p>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">Sunday: Closed</p>
                            </div>
                        </div>
                        {/* Contact Form */}
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {successMessage && <p className="text-green-600 bg-green-100 dark:bg-green-900/30 p-3 rounded-md">{successMessage}</p>}
                                {errorMessage && <p className="text-red-600 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{errorMessage}</p>}
                                <div>
                                    <label htmlFor="name" className="sr-only">Full name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        id="name" 
                                        autoComplete="name" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-brand-gold focus:border-brand-gold border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                        placeholder="Full name" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="sr-only">Email</label>
                                    <input 
                                        id="email" 
                                        name="email" 
                                        type="email" 
                                        autoComplete="email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-brand-gold focus:border-brand-gold border rounded-md dark:bg-gray-700 dark:text-white ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`} 
                                        placeholder="Email" 
                                        required 
                                    />
                                    {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                                </div>
                                <div>
                                    <label htmlFor="subject" className="sr-only">Subject</label>
                                    <input 
                                        type="text" 
                                        name="subject" 
                                        id="subject" 
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-brand-gold focus:border-brand-gold border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                        placeholder="Subject" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="sr-only">Message</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        rows={4} 
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-brand-gold focus:border-brand-gold border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                        placeholder="Message" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <button 
                                        type="submit" 
                                        disabled={!!emailError || !formData.email || isLoading}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-charcoal hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <SpinnerIcon className="h-5 w-5 mr-2 animate-spin"/>
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};