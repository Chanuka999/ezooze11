

import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { PlusIcon, MinusIcon, ShoppingBagIcon, LockClosedIcon, ArrowLeftIcon, XCircleIcon } from '../components/icons';
import { Page, Product, DiscountCode, StoreSettings } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/currency';

interface CartProps {
  navigateTo: (page: Page) => void;
  viewProduct: (product: Product) => void;
  discountCodes: DiscountCode[];
  appliedDiscount: DiscountCode | null;
  setAppliedDiscount: (discount: DiscountCode | null) => void;
  storeSettings: StoreSettings;
}

const CartItemRow: React.FC<{ item: import('../types').CartItem; viewProduct: (product: Product) => void; storeSettings: StoreSettings; }> = ({ item, viewProduct, storeSettings }) => {
    const { dispatch } = useCart();

    const handleQuantityChange = (newQuantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, selectedSize: item.selectedSize, selectedColor: item.selectedColor, quantity: newQuantity } });
    };

    return (
        <li className="flex py-6">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                <img
                    src={item.imageUrls[0]}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                />
            </div>

            <div className="ml-4 flex flex-1 flex-col">
                <div>
                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                        <h3>
                            <button onClick={() => viewProduct(item)} className="hover:underline">{item.name}</button>
                        </h3>
                        <p className="ml-4">{formatPrice(item.discountPrice ?? item.price, storeSettings.currency)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 capitalize">{item.selectedColor}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Size: {item.selectedSize}</p>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                     <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                        <button onClick={() => handleQuantityChange(item.quantity - 1)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-50" aria-label="Decrease quantity" disabled={item.quantity <= 1}>
                            <MinusIcon className="h-4 w-4"/>
                        </button>
                        <span className="px-3 text-base" aria-live="polite">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.quantity + 1)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white" aria-label="Increase quantity">
                            <PlusIcon className="h-4 w-4"/>
                        </button>
                    </div>

                    <div className="flex">
                        <button
                            type="button"
                            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id, selectedSize: item.selectedSize, selectedColor: item.selectedColor }})}
                            className="font-medium text-brand-gold hover:text-yellow-600"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </li>
    );
};

export const Cart: React.FC<CartProps> = ({ navigateTo, viewProduct, discountCodes, appliedDiscount, setAppliedDiscount, storeSettings }) => {
    const { state } = useCart();
    const { isAuthenticated } = useAuth();
    const [couponInput, setCouponInput] = useState('');
    const [couponMessage, setCouponMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const { freeShippingThreshold, standardShippingCost, isFreeShippingThresholdActive, taxRate = 0, currency } = storeSettings;
    
    const subtotal = state.items.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);
    const isEligibleForFreeShipping = isFreeShippingThresholdActive && subtotal >= freeShippingThreshold;
    const shipping = subtotal > 0 && !isEligibleForFreeShipping ? standardShippingCost : 0;
    
    let discountAmount = 0;
    let finalShipping = shipping;

    if (appliedDiscount) {
        if (appliedDiscount.type === 'percentage') {
            discountAmount = subtotal * (appliedDiscount.value / 100);
        } else if (appliedDiscount.type === 'fixed') {
            discountAmount = appliedDiscount.value;
        } else if (appliedDiscount.type === 'free_shipping') {
            finalShipping = 0;
            discountAmount = shipping; // Display the saved amount
        }
    }
    
    discountAmount = Math.min(discountAmount, subtotal + (appliedDiscount?.type !== 'free_shipping' ? 0 : shipping));
    
    const subtotalAfterDiscount = subtotal - (appliedDiscount?.type !== 'free_shipping' ? discountAmount : 0);
    const tax = subtotalAfterDiscount * (taxRate / 100);
    const total = subtotalAfterDiscount + finalShipping + tax;

    const amountForFreeShipping = freeShippingThreshold - subtotal;
    
    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        setCouponMessage(null);
        const code = discountCodes.find(c => c.code.toLowerCase() === couponInput.toLowerCase());

        if (!code) {
            setCouponMessage({ text: 'Invalid discount code.', type: 'error' });
            return;
        }

        if (!code.isActive) {
            setCouponMessage({ text: 'This discount code is inactive.', type: 'error' });
            return;
        }

        if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
            setCouponMessage({ text: 'This discount code has expired.', type: 'error' });
            return;
        }

        if (code.usageLimit && (code.uses || 0) >= code.usageLimit) {
            setCouponMessage({ text: 'This discount code has reached its usage limit.', type: 'error' });
            return;
        }

        if (code.minimumPurchase && subtotal < code.minimumPurchase) {
            setCouponMessage({ text: `You must spend at least ${formatPrice(code.minimumPurchase, currency)} to use this code.`, type: 'error' });
            return;
        }

        setAppliedDiscount(code);
        setCouponMessage({ text: 'Discount code applied!', type: 'success' });
    };

    const handleRemoveCoupon = () => {
        setAppliedDiscount(null);
        setCouponInput('');
        setCouponMessage(null);
    };

    if (state.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                <h2 className="mt-6 text-2xl font-serif font-semibold">Your cart is empty</h2>
                <p className="mt-2 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
                <button
                    onClick={() => navigateTo('shop')}
                    className="mt-8 bg-brand-charcoal border border-transparent rounded-md py-3 px-8 text-base font-medium text-white hover:bg-gray-800 dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }
    
    const handleCheckout = () => {
        if (isAuthenticated) {
            navigateTo('checkout');
        } else {
            navigateTo('login');
        }
    };

    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn py-12">
            <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                <section aria-labelledby="cart-heading" className="lg:col-span-7">
                    <h2 id="cart-heading" className="text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Shopping Cart
                    </h2>
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
                        {state.items.map(item => (
                            <CartItemRow key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} item={item} viewProduct={viewProduct} storeSettings={storeSettings} />
                        ))}
                    </ul>
                </section>

                <section
                    aria-labelledby="summary-heading"
                    className="mt-16 bg-brand-light-gray dark:bg-brand-surface rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:col-span-5 lg:mt-0 lg:sticky lg:top-28"
                >
                    <h2 id="summary-heading" className="text-lg font-medium text-gray-900 dark:text-white">Order summary</h2>

                    <dl className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                            <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(subtotal, currency)}</dd>
                        </div>
                        {appliedDiscount && (
                            <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                                <dt className="text-sm flex items-center">
                                    <span>Discount ({appliedDiscount.code})</span>
                                    <button onClick={handleRemoveCoupon} className="ml-2 text-red-500 hover:text-red-700">
                                        <XCircleIcon className="h-4 w-4" />
                                    </button>
                                </dt>
                                <dd className="text-sm font-medium">- {formatPrice(discountAmount, currency)}</dd>
                            </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                            <dt className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span>Shipping estimate</span>
                            </dt>
                            <dd className="text-sm font-medium text-gray-900 dark:text-white">{finalShipping > 0 ? formatPrice(finalShipping, currency) : 'Free'}</dd>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                            <dt className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span>Taxes ({(taxRate || 0)}%)</span>
                            </dt>
                            <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(tax, currency, { forceDecimals: true })}</dd>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between text-base font-medium text-gray-900 dark:text-white">
                            <dt>Order total</dt>
                            <dd>{formatPrice(total, currency, { forceDecimals: true })}</dd>
                        </div>
                    </dl>
                    
                     <div className="mt-6">
                        <form onSubmit={handleApplyCoupon} className="space-y-2">
                            <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount code</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    id="discount-code"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold sm:text-sm p-2 bg-white dark:bg-gray-800 dark:border-gray-600"
                                    placeholder="Enter code"
                                    disabled={!!appliedDiscount}
                                />
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50" disabled={!!appliedDiscount}>
                                    Apply
                                </button>
                            </div>
                            {couponMessage && <p className={`text-sm mt-2 ${couponMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{couponMessage.text}</p>}
                        </form>
                    </div>

                     {isFreeShippingThresholdActive && amountForFreeShipping > 0 && finalShipping > 0 && (
                        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>Add <span className="font-bold text-gray-700 dark:text-gray-200">{formatPrice(amountForFreeShipping, currency)}</span> more to get free shipping!</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                                <div className="bg-brand-gold h-2.5 rounded-full" style={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}></div>
                            </div>
                        </div>
                     )}

                    <div className="mt-6">
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-brand-charcoal border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-800 dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-brand-gold"
                        >
                            <div className="flex items-center justify-center">
                                <LockClosedIcon className="h-5 w-5 mr-2" />
                                <span>{isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}</span>
                            </div>
                        </button>
                    </div>
                     <div className="mt-6 text-center text-sm">
                        <p>
                        or{' '}
                        <button onClick={() => navigateTo('shop')} className="font-medium text-brand-gold hover:text-yellow-600">
                            Continue Shopping<span aria-hidden="true"> &rarr;</span>
                        </button>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};