
import React, { useState } from 'react';
import { ChevronDownIcon } from '../components/icons';
import { FAQPageContent, FAQItem } from '../types';

const AccordionItem: React.FC<{ item: FAQItem; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 py-6">
            <dt>
                <button onClick={onClick} className="flex w-full items-start justify-between text-left text-gray-400">
                    <span className="text-base font-medium text-gray-900 dark:text-white">{item.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                        <ChevronDownIcon className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                </button>
            </dt>
            <dd className={`mt-2 pr-12 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className="text-base text-gray-600 dark:text-gray-400 pt-4">{item.answer}</p>
            </dd>
        </div>
    );
};

interface FAQPageProps {
    content: FAQPageContent;
}

export const FAQPage: React.FC<FAQPageProps> = ({ content }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="bg-brand-light-gray dark:bg-gray-800 py-24 sm:py-32">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-brand-charcoal dark:text-brand-cream sm:text-5xl lg:text-6xl">Frequently Asked Questions</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">Have questions? We have answers. Find what you're looking for below.</p>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <dl className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700">
                        {content.length > 0 ? (
                            content.map((faq, index) => (
                                <AccordionItem 
                                    key={faq.id} 
                                    item={faq}
                                    isOpen={openIndex === index}
                                    onClick={() => handleToggle(index)}
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No frequently asked questions have been added yet.</p>
                        )}
                    </dl>
                </div>
            </div>
        </div>
    );
};