
import React from 'react';
import { PressFeature, PressPageContent } from '../types';

const PressFeatureCard: React.FC<{ feature: PressFeature }> = ({ feature }) => (
    <div className="py-8 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">{feature.date}</p>
        <a href={feature.link} target="_blank" rel="noopener noreferrer" className="block mt-2">
            <p className="text-xl font-serif font-bold text-brand-charcoal dark:text-brand-cream hover:text-brand-gold">{feature.title}</p>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300 font-semibold">{feature.publication}</p>
        </a>
    </div>
);

interface PressPageProps {
    content: PressPageContent;
}

export const PressPage: React.FC<PressPageProps> = ({ content }) => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="bg-brand-light-gray dark:bg-gray-800 py-24 sm:py-32">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-brand-charcoal dark:text-brand-cream sm:text-5xl lg:text-6xl">Press & Media</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">Information for journalists, bloggers, and media professionals.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-x-12">
                        <div className="lg:col-span-1">
                            <h2 className="text-2xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">Media Inquiries</h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">
                                For all media and press-related inquiries, please contact our public relations team. We are happy to provide you with information, high-resolution images, and interview opportunities.
                            </p>
                            <div className="mt-6">
                                <p className="font-semibold">Email:</p>
                                <a href="mailto:press@ezooze.com" className="text-brand-gold hover:underline">press@ezooze.com</a>
                            </div>
                             <div className="mt-6">
                                <p className="font-semibold">Press Kit:</p>
                                <a href="#" className="text-brand-gold hover:underline">Download Here</a>
                            </div>
                        </div>

                        <div className="mt-16 lg:mt-0 lg:col-span-2">
                            <h2 className="text-2xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">Featured In</h2>
                             <div className="mt-6">
                                {content.length > 0 ? (
                                    content.map(feature => <PressFeatureCard key={feature.id} feature={feature} />)
                                ) : (
                                    <p className="text-gray-500 mt-4">We have not been featured in the press yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};