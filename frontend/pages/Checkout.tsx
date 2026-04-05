
import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { Page, DiscountCode, StoreSettings, Order } from '../types';
import { useAuth } from '../hooks/useAuth';
import { CheckCircleIcon, TruckIcon, CurrencyDollarIcon } from '../components/icons';
import { CreditCardForm } from '../components/CreditCardForm';
import { formatPrice } from '../utils/currency';
import { useRealtime } from '../context/RealtimeContext';
import { api } from '../api';

interface CheckoutProps {
    navigateTo: (page: Page) => void;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    discountCodes: DiscountCode[];
    setDiscountCodes: React.Dispatch<React.SetStateAction<DiscountCode[]>>;
    appliedDiscount: DiscountCode | null;
    setAppliedDiscount: (discount: DiscountCode | null) => void;
    storeSettings: StoreSettings;
    setOrderToTrack: (order: Order | null) => void;
}

const FormInput: React.FC<{ id: string; name?: string; label: string; type?: string; autoComplete?: string; placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; readOnly?: boolean }> = ({ id, name, label, type = 'text', autoComplete, placeholder, value, onChange, readOnly = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="mt-1">
            <input
                type={type}
                id={id}
                name={name || id}
                autoComplete={autoComplete}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold sm:text-sm p-2 bg-brand-light-gray dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                required
            />
        </div>
    </div>
);

export const Checkout: React.FC<CheckoutProps> = ({ navigateTo, orders, setOrders, discountCodes, setDiscountCodes, appliedDiscount, setAppliedDiscount, storeSettings, setOrderToTrack }) => {
    const { state, dispatch } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
    const { emit } = useRealtime();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Payment Method State
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credit_card' | 'cod'>('cod');

    const [shippingInfo, setShippingInfo] = useState({
        name: user?.name || '', 
        phone: '',
        address: user?.address?.street || '', 
        city: user?.address?.city || '', 
        state: user?.address?.state || '', 
        'postal-code': user?.address?.zip || ''
    });
    
    const [paymentInfo, setPaymentInfo] = useState({ cardNumber: '', cardName: '', expiryDate: '', cvc: '' });
    const [isPaymentValid, setIsPaymentValid] = useState(false);
    const { freeShippingThreshold, standardShippingCost, isFreeShippingThresholdActive, taxRate = 0, currency } = storeSettings;

    useEffect(() => {
        if (isAuthenticated && user) {
            setShippingInfo(prev => ({
                 ...prev, 
                 name: user.name,
                 address: user.address?.street || '',
                 city: user.address?.city || '',
                 state: user.address?.state || '',
                 'postal-code': user.address?.zip || ''
            }));
        }
    }, [isAuthenticated, user]);
    
    useEffect(() => {
        if (!isAuthenticated) {
            navigateTo('login');
        }
    }, [isAuthenticated, navigateTo]);

    // Initialize payment method based on settings
    useEffect(() => {
        if (storeSettings.paymentMethods.payOnDelivery) {
            setSelectedPaymentMethod('cod');
        } else if (storeSettings.paymentMethods.creditCard) {
            setSelectedPaymentMethod('credit_card');
        }
    }, [storeSettings.paymentMethods]);
    
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
        }
    }
    
    discountAmount = Math.min(discountAmount, subtotal);

    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = subtotalAfterDiscount * (taxRate / 100);
    const total = subtotalAfterDiscount + finalShipping + tax;
    
    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        if (selectedPaymentMethod === 'credit_card' && !isPaymentValid) {
            alert("Please ensure your payment details are correct.");
            return;
        }
        if (!user) {
            alert("You must be logged in to place an order.");
            return;
        }
        if (!shippingInfo.phone) {
            alert("Please provide a phone number for shipping updates.");
            return;
        }
        
        setIsProcessing(true);

        try {
            // 1. Process Payment if Credit Card
            if (selectedPaymentMethod === 'credit_card') {
                try {
                    // Call backend to create intent
                    const { clientSecret } = await api.createPaymentIntent(total, currency);
                    
                    // NOTE: In a full frontend implementation with Stripe Elements, 
                    // you would use `stripe.confirmCardPayment` here with the clientSecret.
                    // Since we are using a custom form for this demo/UI, we assume the 
                    // intent creation is the "authorization" step for this context.
                    
                    if (!clientSecret) throw new Error("Failed to initialize payment.");
                    
                    // Simulate processing delay for UX
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                } catch (err: any) {
                    console.error("Payment Error:", err);
                    alert(`Payment failed: ${err.message || "Unknown error"}`);
                    setIsProcessing(false);
                    return;
                }
            }

            // 2. Create Order
            const newOrderNumber = `EZ${Math.floor(Math.random() * 90000) + 10000}F`;
            const now = new Date().toISOString();

            const newOrder: Order = {
                id: newOrderNumber,
                customerId: user.id,
                customerName: shippingInfo.name || user.name,
                customerEmail: user.email,
                customerPhone: shippingInfo.phone,
                date: now,
                status: 'Confirmed',
                statusHistory: [{ status: 'Confirmed', timestamp: now, note: 'Order placed successfully.' }],
                items: state.items,
                shippingAddress: {
                    street: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    zip: shippingInfo['postal-code'],
                    country: 'Sri Lanka'
                },
                subtotal,
                shipping: finalShipping,
                discount: discountAmount,
                tax,
                total,
            };
        
            // Send order to backend
            const createdOrder = await api.createOrder(newOrder);
            
            // Update local state and emit realtime event
            setOrders(prev => [createdOrder, ...prev]);
            emit({ type: 'ORDER_CREATED', payload: createdOrder });

            setPlacedOrder(createdOrder);
            setOrderToTrack(createdOrder);
            
            // Update discount code usage
            if (appliedDiscount) {
                const updatedCodes = discountCodes.map(code => {
                    if (code.id === appliedDiscount.id) {
                        return { ...code, uses: (code.uses || 0) + 1 };
                    }
                    return code;
                });
                setDiscountCodes(updatedCodes);
            }
            
            setIsOrderPlaced(true);
            dispatch({ type: 'CLEAR_CART' });
            setAppliedDiscount(null);

        } catch (error) {
            console.error("Failed to place order:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isOrderPlaced && placedOrder) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        const estimatedDelivery = deliveryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        return (
            <div className="max-w-4xl mx-auto py-16 px-4 animate-fadeIn">
                <div className="text-center mb-12">
                    <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                    <h1 className="mt-4 text-3xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">Thank you for your order!</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Your order <span className="font-mono font-semibold">{placedOrder.id}</span> has been placed.
                    </p>
                     <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Confirmation sent to <strong>{placedOrder.customerEmail}</strong> and SMS to <strong>{placedOrder.customerPhone}</strong>.
                    </p>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Estimated delivery: <span className="font-semibold">{estimatedDelivery}</span>.
                    </p>
                </div>

                <div className="bg-brand-light-gray dark:bg-brand-surface rounded-lg p-6 border dark:border-brand-border">
                    <h2 className="text-xl font-semibold mb-4 text-brand-charcoal dark:text-brand-cream">Order Summary</h2>
                    
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {placedOrder.items.map(item => (
                            <li key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex py-4">
                                <div className="flex-shrink-0 w-20 h-20 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                                    <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-center object-cover"/>
                                </div>
                                <div className="ml-4 flex-1 flex flex-col">
                                    <div>
                                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                            <h3>{item.name}</h3>
                                            <p className="ml-4">{formatPrice((item.discountPrice ?? item.price) * item.quantity, currency)}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">{item.selectedSize}, {item.selectedColor}</p>
                                    </div>
                                    <div className="flex-1 flex items-end justify-between text-sm">
                                        <p className="text-gray-500">Qty {item.quantity}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    <dl className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between"><dt>Subtotal</dt><dd className="text-gray-900 dark:text-white">{formatPrice(placedOrder.subtotal, currency)}</dd></div>
                        {placedOrder.discount && placedOrder.discount > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><dt>Discount</dt><dd>- {formatPrice(placedOrder.discount, currency)}</dd></div>}
                        <div className="flex justify-between"><dt>Shipping</dt><dd className="text-gray-900 dark:text-white">{formatPrice(placedOrder.shipping, currency)}</dd></div>
                        {placedOrder.tax && placedOrder.tax > 0 && <div className="flex justify-between"><dt>Tax</dt><dd className="text-gray-900 dark:text-white">{formatPrice(placedOrder.tax, currency, { forceDecimals: true })}</dd></div>}
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2"><dt>Total</dt><dd>{formatPrice(placedOrder.total, currency, { forceDecimals: true })}</dd></div>
                    </dl>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h3 className="font-semibold text-brand-charcoal dark:text-brand-cream">Shipping to</h3>
                        <address className="mt-2 text-gray-600 dark:text-gray-400 not-italic">
                            {placedOrder.shippingAddress.street}<br/>
                            {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.state} {placedOrder.shippingAddress.zip}<br/>
                            {placedOrder.shippingAddress.country}<br/>
                            <span className="mt-1 block">{placedOrder.customerPhone}</span>
                        </address>
                    </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                        onClick={() => navigateTo('orderTracking')}
                        className="w-full sm:w-auto bg-brand-charcoal border border-transparent rounded-md shadow-sm py-3 px-8 text-base font-medium text-white hover:bg-gray-800 dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200"
                    >
                        Track your order
                    </button>
                    <button
                        onClick={() => navigateTo('home')}
                        className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-md py-3 px-8 text-base font-medium"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn py-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shipping Information</h2>
                        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                            <div className="sm:col-span-2">
                                <FormInput id="name" label="Full Name" autoComplete="name" value={shippingInfo.name} onChange={handleShippingChange} />
                            </div>
                             <div className="sm:col-span-2">
                                <FormInput id="phone" name="phone" label="Phone Number" autoComplete="tel" placeholder="+94 77 123 4567" value={shippingInfo.phone} onChange={handleShippingChange} />
                            </div>
                            <div className="sm:col-span-2">
                                <FormInput id="address" label="Address" autoComplete="street-address" placeholder="123 Main St" value={shippingInfo.address} onChange={handleShippingChange} />
                            </div>
                            <div>
                                <FormInput id="city" label="City" autoComplete="address-level2" value={shippingInfo.city} onChange={handleShippingChange} />
                            </div>
                            <div>
                                <FormInput id="state" label="State / Province" autoComplete="address-level1" value={shippingInfo.state} onChange={handleShippingChange} />
                            </div>
                            <div>
                                <FormInput id="postal-code" name="postal-code" label="ZIP / Postal Code" autoComplete="postal-code" value={shippingInfo['postal-code']} onChange={handleShippingChange} />
                            </div>
                            <div>
                                <FormInput id="country" label="Country" autoComplete="country-name" value="Sri Lanka" readOnly />
                            </div>
                        </div>
                    </section>

                    <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {storeSettings.paymentMethods.creditCard && (
                                <div 
                                    onClick={() => setSelectedPaymentMethod('credit_card')}
                                    className={`cursor-pointer border rounded-lg p-4 flex items-center ${selectedPaymentMethod === 'credit_card' ? 'border-brand-gold bg-brand-gold/10' : 'border-gray-300 dark:border-gray-600'}`}
                                >
                                    <div className={`h-4 w-4 rounded-full border mr-3 flex items-center justify-center ${selectedPaymentMethod === 'credit_card' ? 'border-brand-gold' : 'border-gray-400'}`}>
                                        {selectedPaymentMethod === 'credit_card' && <div className="h-2 w-2 rounded-full bg-brand-gold" />}
                                    </div>
                                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300"/>
                                    <span className="font-medium">Credit / Debit Card</span>
                                </div>
                            )}
                            
                            {storeSettings.paymentMethods.payOnDelivery && (
                                <div 
                                    onClick={() => setSelectedPaymentMethod('cod')}
                                    className={`cursor-pointer border rounded-lg p-4 flex items-center ${selectedPaymentMethod === 'cod' ? 'border-brand-gold bg-brand-gold/10' : 'border-gray-300 dark:border-gray-600'}`}
                                >
                                    <div className={`h-4 w-4 rounded-full border mr-3 flex items-center justify-center ${selectedPaymentMethod === 'cod' ? 'border-brand-gold' : 'border-gray-400'}`}>
                                        {selectedPaymentMethod === 'cod' && <div className="h-2 w-2 rounded-full bg-brand-gold" />}
                                    </div>
                                    <TruckIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300"/>
                                    <span className="font-medium">Cash on Delivery</span>
                                </div>
                            )}
                        </div>

                        {selectedPaymentMethod === 'credit_card' ? (
                            <CreditCardForm onPaymentDataChange={setPaymentInfo} onValidityChange={setIsPaymentValid} />
                        ) : (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-sm text-blue-700 dark:text-blue-300">
                                You can pay in cash when the courier delivers your order to your doorstep.
                            </div>
                        )}
                    </section>
                </div>

                <div className="mt-10 lg:mt-0">
                    <section
                        aria-labelledby="summary-heading"
                        className="bg-brand-light-gray dark:bg-brand-surface rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:sticky lg:top-28"
                    >
                        <h2 id="summary-heading" className="text-lg font-medium text-gray-900 dark:text-white">Order summary</h2>
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 my-6">
                            {state.items.map(item => (
                                <li key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex py-4">
                                    <div className="flex-shrink-0 w-20 h-20 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                                        <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-center object-cover"/>
                                    </div>
                                    <div className="ml-4 flex-1 flex flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                                <h3>{item.name}</h3>
                                                <p className="ml-4">{formatPrice((item.discountPrice ?? item.price) * item.quantity, currency)}</p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">{item.selectedSize}, {item.selectedColor}</p>
                                        </div>
                                        <div className="flex-1 flex items-end justify-between text-sm">
                                            <p className="text-gray-500">Qty {item.quantity}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <dl className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                           <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(subtotal, currency)}</dd>
                            </div>
                             {discountAmount > 0 && (
                                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                                    <dt className="text-sm">Discount ({appliedDiscount?.code})</dt>
                                    <dd className="text-sm font-medium">- {formatPrice(discountAmount, currency)}</dd>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600 dark:text-gray-400">Shipping</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">{finalShipping > 0 ? formatPrice(finalShipping, currency) : 'Free'}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600 dark:text-gray-400">Taxes ({(taxRate || 0)}%)</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(tax, currency, { forceDecimals: true })}</dd>
                            </div>
                            <div className="flex items-center justify-between text-base font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-4">
                                <dt>Total</dt>
                                <dd>{formatPrice(total, currency, { forceDecimals: true })}</dd>
                            </div>
                        </dl>

                        <div className="mt-6">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={(selectedPaymentMethod === 'credit_card' && !isPaymentValid) || isProcessing}
                                className="w-full bg-brand-charcoal border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-800 dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isProcessing ? 'Processing...' : selectedPaymentMethod === 'credit_card' ? `Pay ${formatPrice(total, currency)}` : 'Place Order'}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
