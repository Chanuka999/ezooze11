

import React from 'react';
import { StoreSettings } from '../types';
import { formatPrice } from '../utils/currency';

const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-12">
        <h2 className="text-2xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">{title}</h2>
        <div className="mt-4 prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
            {children}
        </div>
    </div>
);

interface ShippingReturnsPageProps {
    storeSettings: StoreSettings;
}

export const ShippingReturnsPage: React.FC<ShippingReturnsPageProps> = ({ storeSettings }) => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="bg-brand-light-gray dark:bg-gray-800 py-24 sm:py-32">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-brand-charcoal dark:text-brand-cream sm:text-5xl lg:text-6xl">Shipping & Returns</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">Everything you need to know about receiving and returning your ezooze products.</p>
                </div>
            </div>

            {/* Content Section */}
            <div className="py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PolicySection title="Shipping Policy">
                        <p>We are pleased to offer comprehensive shipping options to meet your needs. All orders are processed within 1-2 business days.</p>
                        <ul>
                            <li>
                                <strong>Standard Shipping (5-7 business days):</strong>
                                {storeSettings.isFreeShippingThresholdActive
                                    ? ` Complimentary on orders over ${formatPrice(storeSettings.freeShippingThreshold, storeSettings.currency)}. A flat rate of ${formatPrice(storeSettings.standardShippingCost, storeSettings.currency)} applies to all other orders.`
                                    : ` A flat rate of ${formatPrice(storeSettings.standardShippingCost, storeSettings.currency)} applies to all orders.`
                                }
                            </li>
                            <li><strong>Expedited Shipping (2-3 business days):</strong> Available for a flat rate of {formatPrice(1500, storeSettings.currency)}.</li>
                            <li><strong>Overnight Shipping (1 business day):</strong> Available for a flat rate of {formatPrice(2500, storeSettings.currency)}.</li>
                        </ul>
                        <p>Once your order has shipped, you will receive a confirmation email with a tracking number. We currently ship within Sri Lanka. We are working on expanding our international shipping options soon.</p>
                    </PolicySection>

                     <PolicySection title="Return & Exchange Policy">
                        <p>Your satisfaction is our priority. If you are not completely satisfied with your purchase, you may return it for a full refund or exchange within 30 days of the delivery date.</p>
                        <p>To be eligible for a return:</p>
                        <ul>
                            <li>Items must be unworn, unwashed, and in their original condition.</li>
                            <li>All original tags must be attached.</li>
                            <li>Final sale items are not eligible for returns or exchanges.</li>
                        </ul>
                        <h4>How to Initiate a Return:</h4>
                        <ol>
                            <li>Visit our online returns portal (link here) and enter your order number and email address.</li>
                            <li>Select the items you wish to return and the reason.</li>
                            <li>A prepaid shipping label will be generated for you to print.</li>
                            <li>Package your items securely and drop them off at your nearest shipping center.</li>
                        </ol>
                        <p>Refunds will be processed to the original form of payment within 5-7 business days after we receive and inspect the returned items.</p>
                    </PolicySection>
                </div>
            </div>
        </div>
    );
};