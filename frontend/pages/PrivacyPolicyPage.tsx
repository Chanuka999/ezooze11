
import React from 'react';
import { PrivacyPolicyPageContent } from '../types';

const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">{title}</h2>
        <div className="mt-4 prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
            {/* Use dangerouslySetInnerHTML to render multiline content with potential simple formatting */}
            <div dangerouslySetInnerHTML={{ __html: String(children).replace(/\n/g, '<br />') }} />
        </div>
    </div>
);

interface PrivacyPolicyPageProps {
    content: PrivacyPolicyPageContent;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ content }) => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="bg-brand-light-gray dark:bg-gray-800 py-24 sm:py-32">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-brand-charcoal dark:text-brand-cream sm:text-5xl lg:text-6xl">Privacy Policy</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

             {/* Content Section */}
            <div className="py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {content.sections.map(section => (
                        <PolicySection key={section.id} title={section.title}>
                            {section.content}
                        </PolicySection>
                    ))}
                </div>
            </div>
        </div>
    );
};