
import React from 'react';
import { JobOpening, CareersPageContent } from '../types';

const JobOpeningCard: React.FC<{ opening: JobOpening }> = ({ opening }) => (
    <div className="py-8 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-shadow hover:shadow-xl">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">{opening.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{opening.department} &middot; {opening.location}</p>
            </div>
            <button className="text-sm font-semibold text-brand-gold hover:underline whitespace-nowrap">
                Apply Now &rarr;
            </button>
        </div>
    </div>
);

interface CareersPageProps {
    content: CareersPageContent;
}

export const CareersPage: React.FC<CareersPageProps> = ({ content }) => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
             <div className="relative bg-brand-charcoal py-24 sm:py-32">
                 <img
                    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                    alt="ezooze office"
                    className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
                />
                <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">Join Our Team</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">Help us shape the future of timeless fashion. Explore a career at ezooze.</p>
                </div>
            </div>

            {/* Our Culture Section */}
            <div className="py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">Our Culture</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                        At ezooze, we foster a collaborative and innovative environment where creativity and passion thrive. We are a team of thinkers, creators, and artisans dedicated to our craft. We believe in nurturing talent, encouraging growth, and building a workplace that is as inspiring as the pieces we create.
                    </p>
                </div>
            </div>

            {/* Open Positions Section */}
            <div className="bg-brand-light-gray dark:bg-brand-charcoal py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center">
                         <h2 className="text-3xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">Open Positions</h2>
                         <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                            Find your next opportunity and grow with us.
                        </p>
                    </div>
                    <div className="mt-16 space-y-8">
                        {content.length > 0 ? (
                            content.map(job => <JobOpeningCard key={job.id} opening={job} />)
                        ) : (
                            <p className="text-center text-gray-500">There are currently no open positions.</p>
                        )}
                    </div>
                    <div className="text-center mt-12">
                        <p className="text-gray-600 dark:text-gray-400">Don't see a role that fits? <a href="#" className="font-semibold text-brand-gold hover:underline">Send us your resume</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
