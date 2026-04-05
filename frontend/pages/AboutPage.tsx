import React from 'react';
import { AboutPageContent } from '../types';

interface AboutPageProps {
    content: AboutPageContent;
}

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div>
        <dt className="text-4xl font-serif font-bold text-brand-gold">{value}</dt>
        <dd className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-400">{label}</dd>
    </div>
);

export const AboutPage: React.FC<AboutPageProps> = ({ content }) => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="relative bg-brand-charcoal py-24 sm:py-32">
                 <img
                    src="https://picsum.photos/seed/about/1800/1000"
                    alt="Our Team"
                    className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
                />
                <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">About ezooze</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">The Art of Lasting Elegance - Discover the story behind our craft.</p>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">Our Story</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                        {content.story}
                    </p>
                </div>
            </div>

            {/* Image Section */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <img src="https://picsum.photos/seed/atelier/1600/900" alt="ezooze atelier" className="rounded-lg shadow-xl" />
            </div>

            {/* Our Values Section */}
            <div className="py-24 sm:py-32">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                         <h2 className="text-3xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">Our Core Values</h2>
                         <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                            The pillars that guide every stitch and decision.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <h3 className="text-xl font-semibold font-serif text-brand-charcoal dark:text-brand-cream">Quality Craftsmanship</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Every piece is meticulously crafted by skilled artisans who share our commitment to excellence.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold font-serif text-brand-charcoal dark:text-brand-cream">Sustainable Approach</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">We prioritize ethically sourced materials and responsible production methods to minimize our impact.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold font-serif text-brand-charcoal dark:text-brand-cream">Timeless Design</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">We create enduring styles that form the foundation of a versatile and elegant wardrobe.</p>
                        </div>
                    </div>
                </div>
            </div>
            
             {/* Stats Section */}
            <div className="bg-brand-light-gray dark:bg-gray-800 py-24 sm:py-32">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <dl className="grid grid-cols-1 gap-y-16 text-center lg:grid-cols-3">
                       <Stat value="2015" label="Founded" />
                       <Stat value="50+" label="Artisan Partners" />
                       <Stat value="100%" label="Commitment to Quality" />
                    </dl>
                </div>
            </div>

        </div>
    );
};