
import React, { useState, useEffect } from 'react';
import { Order, Page, StoreSettings } from '../types';
import { CubeTransparentIcon, CheckCircleIcon, ArrowLeftIcon, TruckIcon, MapPinIcon } from '../components/icons';
import { formatPrice } from '../utils/currency';
import { useRealtime } from '../context/RealtimeContext';

interface OrderTrackingPageProps {
    orders: Order[];
    navigateTo: (page: Page) => void;
    orderToTrack: Order | null;
    setOrderToTrack: (order: Order | null) => void;
    storeSettings: StoreSettings;
}

const getTrackingUrl = (order: Order): string | null => {
    if (!order.trackingNumber || !order.trackingCarrier) return null;

    switch(order.trackingCarrier) {
        case 'UPS':
            return `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
        case 'FedEx':
            return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${order.trackingNumber}`;
        case 'DHL':
            return `https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`;
        default:
            return null; // Cannot generate URL for 'Other'
    }
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orders, navigateTo, orderToTrack, setOrderToTrack, storeSettings }) => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');

    // Realtime context isn't explicitly used for listening here because the `orders` prop 
    // passed from App.tsx is already updated in real-time via App's listener.
    // However, we need to make sure `foundOrder` updates when `orders` changes.

    useEffect(() => {
        if (orderToTrack) {
            setFoundOrder(orderToTrack);
            // Clear it so it's not reused on refresh or subsequent navigation
            setOrderToTrack(null);
        }
    }, [orderToTrack, setOrderToTrack]);

    // React to global order updates
    useEffect(() => {
        if (foundOrder) {
            const updated = orders.find(o => o.id === foundOrder.id);
            if (updated) {
                setFoundOrder(updated);
            }
        }
    }, [orders, foundOrder]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const order = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase().trim() && o.customerEmail.toLowerCase() === email.toLowerCase().trim());

        if (order) {
            setFoundOrder(order);
        } else {
            setError('No order found with that ID and email combination. Please check your details and try again.');
        }
    };

    
    if (foundOrder) {
        const trackingUrl = getTrackingUrl(foundOrder);
        
        // Ensure history exists (legacy support) or generate a basic one
        const history = foundOrder.statusHistory || [
            { status: foundOrder.status, timestamp: foundOrder.date, note: 'Order status updated.' }
        ];
        
        // Sort newest first for the timeline
        const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        const isCancelled = foundOrder.status === 'Cancelled';
        const isRefunded = foundOrder.status === 'Refunded';

        return (
             <div className="max-w-4xl mx-auto py-16 px-4 animate-fadeIn">
                <button onClick={() => { setFoundOrder(null); setOrderId(''); setEmail(''); }} className="flex items-center text-sm font-medium text-brand-gold hover:text-yellow-600 mb-8">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Look up another order
                </button>
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-serif font-bold text-brand-charcoal dark:text-brand-cream">Order Status</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Order <span className="font-mono font-semibold">{foundOrder.id}</span></p>
                    <div className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-500 ${
                        isCancelled || isRefunded ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        foundOrder.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                        {foundOrder.status}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Timeline */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-brand-surface rounded-lg shadow-sm border dark:border-brand-border p-6">
                            <h3 className="text-lg font-serif font-bold text-brand-charcoal dark:text-brand-cream mb-6">Order Activity</h3>
                            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                                {sortedHistory.map((event, index) => (
                                    <div key={index} className="relative pl-8 animate-fadeInUp">
                                        <span className={`absolute top-0 left-[-9px] h-4 w-4 rounded-full border-2 transition-colors duration-500 ${
                                            index === 0 ? 'bg-brand-gold border-brand-gold scale-125' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                                        }`}></span>
                                        <div>
                                            <p className={`text-sm font-bold ${index === 0 ? 'text-brand-charcoal dark:text-brand-cream' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {event.status}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(event.timestamp).toLocaleString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            {event.note && (
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                                    {event.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Tracking Link Section */}
                        {foundOrder.trackingNumber && (
                            <div className="mt-6 bg-white dark:bg-brand-surface p-6 rounded-lg border dark:border-brand-border flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                                    <p className="font-mono font-medium text-brand-charcoal dark:text-brand-cream text-lg">{foundOrder.trackingNumber}</p>
                                    <p className="text-xs text-gray-400">{foundOrder.trackingCarrier}</p>
                                </div>
                                {trackingUrl && (
                                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-brand-charcoal text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-800 dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 transition-colors">
                                        <TruckIcon className="h-4 w-4 mr-2" /> Track Package
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-brand-light-gray dark:bg-brand-surface rounded-lg p-6 border dark:border-brand-border sticky top-24">
                            <h3 className="text-lg font-serif font-bold text-brand-charcoal dark:text-brand-cream mb-4">Summary</h3>
                            
                            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 mb-6">
                                {foundOrder.items.map(item => (
                                    <li key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex py-3">
                                        <div className="flex-shrink-0 w-12 h-12 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                                            <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-center object-cover"/>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                                                <h4 className="truncate max-w-[120px]">{item.name}</h4>
                                                <p>{formatPrice(((item.discountPrice ?? item.price) * item.quantity), storeSettings.currency)}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            
                            <dl className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between"><dt>Subtotal</dt><dd className="text-gray-900 dark:text-white">{formatPrice(foundOrder.subtotal, storeSettings.currency)}</dd></div>
                                {foundOrder.discount && foundOrder.discount > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><dt>Discount</dt><dd>- {formatPrice(foundOrder.discount, storeSettings.currency)}</dd></div>}
                                <div className="flex justify-between"><dt>Shipping</dt><dd className="text-gray-900 dark:text-white">{formatPrice(foundOrder.shipping, storeSettings.currency)}</dd></div>
                                {foundOrder.tax && foundOrder.tax > 0 && <div className="flex justify-between"><dt>Tax</dt><dd className="text-gray-900 dark:text-white">{formatPrice(foundOrder.tax, storeSettings.currency, { forceDecimals: true })}</dd></div>}
                                <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2"><dt>Total</dt><dd>{formatPrice(foundOrder.total, storeSettings.currency, { forceDecimals: true })}</dd></div>
                            </dl>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <h4 className="font-semibold text-sm text-brand-charcoal dark:text-brand-cream flex items-center"><MapPinIcon className="h-4 w-4 mr-1"/> Shipping Address</h4>
                                <address className="mt-2 text-sm text-gray-600 dark:text-gray-400 not-italic">
                                    {foundOrder.shippingAddress.street}<br/>
                                    {foundOrder.shippingAddress.city}, {foundOrder.shippingAddress.state} {foundOrder.shippingAddress.zip}<br/>
                                    {foundOrder.shippingAddress.country}
                                </address>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    return (
        <div className="animate-fadeIn">
            <div className="bg-brand-light-gray dark:bg-gray-800 py-24 sm:py-32">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <CubeTransparentIcon className="mx-auto h-12 w-12 text-brand-gold" />
                    <h1 className="mt-4 text-4xl font-serif font-bold tracking-tight text-brand-charcoal dark:text-brand-cream sm:text-5xl lg:text-6xl">Track Your Order</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">Enter your order details below to see its current status.</p>
                </div>
            </div>
            <div className="py-16 sm:py-24">
                <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSearch} className="space-y-6">
                        {error && <p className="text-center text-sm text-red-600 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}
                        <div>
                            <label htmlFor="order-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Order ID
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="order-id"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold sm:text-sm p-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="e.g., EZ73847F"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold sm:text-sm p-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                             <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-charcoal hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 transition-colors"
                            >
                                Track Order
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
