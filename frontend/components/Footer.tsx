
import React, { useState } from 'react';
import { Page, StoreSettings } from '../types';
import { FacebookIcon, InstagramIcon, PinterestIcon, TwitterIcon } from './icons';

interface FooterProps {
    navigateTo: (page: Page, filters?: { category?: string; subCategory?: string }) => void;
    storeSettings: StoreSettings;
}

const FooterLink: React.FC<{ page: Page; label: string; navigateTo: FooterProps['navigateTo']; filters?: { category?: string; subCategory?: string } }> = ({ page, label, navigateTo, filters }) => (
    <li>
        <button onClick={() => navigateTo(page, filters)} className="text-base text-gray-400 hover:text-white transition-colors duration-200">{label}</button>
    </li>
);

export const Footer: React.FC<FooterProps> = ({ navigateTo, storeSettings }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
        return 'Email is required';
    } else if (!regex.test(value)) {
        return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);
      if (isTouched) {
          setEmailError(validateEmail(value));
      }
  };

  const handleEmailBlur = () => {
      setIsTouched(true);
      setEmailError(validateEmail(email));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
        setEmailError(error);
        setIsTouched(true);
        return;
    }
    alert(`Thank you for subscribing, ${email}!`);
    setEmail('');
    setEmailError('');
    setIsTouched(false);
  };

  return (
    <footer className="bg-brand-charcoal dark:bg-black text-brand-cream mt-24">
      <div className="max-w-8xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Newsletter Section */}
            <div className="md:col-span-2 lg:col-span-4 border-b border-gray-700 pb-12 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <h3 className="text-2xl font-serif font-semibold text-white">Join The Inner Circle</h3>
                        <p className="mt-2 text-gray-400">Be the first to know about new arrivals, exclusive offers, and the latest from the world of ezooze.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col relative">
                        <div className="flex items-center">
                            <label htmlFor="email-address-footer" className="sr-only">Email address</label>
                            <input
                                id="email-address-footer"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                                className={`w-full px-4 py-3 bg-gray-800 border ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-700 focus:ring-brand-gold focus:border-brand-gold'} rounded-l-md placeholder-gray-500 text-white transition-colors`}
                                placeholder="Enter your email"
                            />
                            <button
                                type="submit"
                                disabled={!!emailError || !email}
                                className="flex-shrink-0 px-4 py-3 border border-transparent text-base font-medium rounded-r-md text-brand-charcoal bg-brand-cream hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            &rarr;
                            </button>
                        </div>
                        {emailError && <p className="absolute -bottom-6 left-0 text-xs text-red-500 mt-1">{emailError}</p>}
                    </form>
                </div>
            </div>

            {/* Company Info */}
            <div className="space-y-6">
              <h2 className="font-serif text-3xl font-bold text-brand-cream tracking-wider cursor-pointer" onClick={() => navigateTo('home')}>{storeSettings.storeName}</h2>
              <p className="text-gray-400 text-base">The Art of Lasting Elegance.</p>
              <div className="flex space-x-6">
                <a href={storeSettings.socialLinks.instagram || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="sr-only">Instagram</span><InstagramIcon className="h-6 w-6" /></a>
                <a href={storeSettings.socialLinks.facebook || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="sr-only">Facebook</span><FacebookIcon className="h-6 w-6" /></a>
                <a href={storeSettings.socialLinks.twitter || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="sr-only">Twitter</span><TwitterIcon className="h-6 w-6" /></a>
                <a href={storeSettings.socialLinks.pinterest || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="sr-only">Pinterest</span><PinterestIcon className="h-6 w-6" /></a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Shop</h3>
              <ul className="mt-4 space-y-4">
                <FooterLink page="shop" label="Men" navigateTo={navigateTo} filters={{ category: 'men' }} />
                <FooterLink page="shop" label="Women" navigateTo={navigateTo} filters={{ category: 'women' }} />
                <FooterLink page="shop" label="Accessories" navigateTo={navigateTo} filters={{ category: 'unisex', subCategory: 'accessories' }} />
                <FooterLink page="shop" label="Shop All" navigateTo={navigateTo} />
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <FooterLink page="about" label="About" navigateTo={navigateTo} />
                <FooterLink page="careers" label="Careers" navigateTo={navigateTo} />
                <FooterLink page="press" label="Press" navigateTo={navigateTo} />
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <FooterLink page="contact" label="Contact Us" navigateTo={navigateTo} />
                <FooterLink page="orderTracking" label="Track Your Order" navigateTo={navigateTo} />
                <FooterLink page="faq" label="FAQ" navigateTo={navigateTo} />
                <FooterLink page="shipping" label="Shipping & Returns" navigateTo={navigateTo} />
                <FooterLink page="privacy" label="Privacy Policy" navigateTo={navigateTo} />
                <FooterLink page="terms" label="Terms of Service" navigateTo={navigateTo} />
              </ul>
            </div>
            
        </div>
        <div className="mt-16 border-t border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} {storeSettings.storeName}, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
