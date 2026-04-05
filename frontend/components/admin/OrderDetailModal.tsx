
import React, { useState, useEffect } from 'react';
import { Order, AdminSection, OrderStatus } from '../../types';
import { CloseIcon, UserCircleIcon, MapPinIcon, TruckIcon, CalendarDaysIcon } from '../icons';
import { useRealtime } from '../../context/RealtimeContext';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: Order) => void;
    order: Order;
    setActiveSection: (section: AdminSection) => void;
}

const StatusOptions: OrderStatus[] = ['Confirmed', 'Processing', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, onSave, order, setActiveSection }) => {
    const [localOrder, setLocalOrder] = useState(order);
    const [statusNote, setStatusNote] = useState('');
    const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
    const { emit } = useRealtime();

    useEffect(() => {
        setLocalOrder(order);
        setNewStatus(order.status);
        setStatusNote('');
    }, [order]);
    
    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalOrder(prev => ({ ...prev, [name]: value } as Order));
    };
    
    const handleSave = () => {
        if (newStatus === 'Shipped' && (!localOrder.trackingNumber || !localOrder.trackingCarrier)) {
            alert('Please provide a tracking number and shipping carrier before marking the order as shipped.');
            return;
        }

        // Create updated order object
        const updatedOrder = { ...localOrder, status: newStatus };

        // If status changed, update history
        if (newStatus !== order.status) {
            const newHistoryEntry = {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: statusNote || undefined
            };
            updatedOrder.statusHistory = [...(order.statusHistory || []), newHistoryEntry];
        } else if (statusNote) {
            // Allow adding a note without changing status
             const newHistoryEntry = {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: statusNote
            };
             updatedOrder.statusHistory = [...(order.statusHistory || []), newHistoryEntry];
        }

        onSave(updatedOrder);
        emit({ type: 'ORDER_UPDATED', payload: updatedOrder });
    };

    const viewCustomer = () => {
        onClose();
        setActiveSection('customers');
    };

    const sortedHistory = [...(localOrder.statusHistory || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const inputClass = "block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold dark:bg-brand-surface dark:border-brand-border dark:text-white disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-charcoal rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-brand-border flex justify-between items-center sticky top-0 bg-white dark:bg-brand-charcoal z-10">
                    <div>
                        <h2 className="text-xl font-serif font-semibold">Order Details: <span className="font-mono">{order.id}</span></h2>
                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><CloseIcon className="h-6 w-6" /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Column: Order Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div className="space-y-3 bg-gray-50 dark:bg-brand-surface p-4 rounded-lg border dark:border-brand-border">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center"><UserCircleIcon className="h-4 w-4 mr-2"/>Customer</h3>
                                    <div>
                                        <button onClick={viewCustomer} className="text-base font-medium text-brand-gold hover:underline">{order.customerName}</button>
                                        <p className="text-sm text-gray-500">{order.customerEmail}</p>
                                        {order.customerPhone && <p className="text-sm text-gray-500">{order.customerPhone}</p>}
                                    </div>
                                </div>
                                {/* Shipping Info */}
                                <div className="space-y-3 bg-gray-50 dark:bg-brand-surface p-4 rounded-lg border dark:border-brand-border">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center"><MapPinIcon className="h-4 w-4 mr-2"/>Shipping To</h3>
                                    <address className="text-sm not-italic text-gray-600 dark:text-gray-400">
                                        {order.shippingAddress.street}<br/>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br/>
                                        {order.shippingAddress.country}
                                    </address>
                                </div>
                            </div>
                            
                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
                                <div className="border rounded-lg overflow-hidden dark:border-brand-border">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-brand-border">
                                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Product</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">Price</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Qty</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-brand-charcoal divide-y divide-gray-200 dark:divide-brand-border">
                                            {order.items.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{item.name} <span className="text-gray-500">({item.selectedSize}, {item.selectedColor})</span></td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">Rs. {(item.discountPrice ?? item.price).toLocaleString()}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold">Rs. {((item.discountPrice ?? item.price) * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                             {/* Cost Summary */}
                            <div className="flex justify-end">
                                <div className="w-full max-w-sm space-y-2">
                                    <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Subtotal</span><span>Rs. {order.subtotal.toLocaleString()}</span></div>
                                     {order.discount && order.discount > 0 ? (
                                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400"><span>Discount</span><span>- Rs. {order.discount.toLocaleString()}</span></div>
                                    ) : null}
                                    <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Shipping</span><span>Rs. {order.shipping.toLocaleString()}</span></div>
                                    {order.tax && order.tax > 0 ? (
                                        <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Tax</span><span>Rs. {order.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                    ) : null}
                                    <div className="flex justify-between font-bold text-base border-t pt-2 dark:border-brand-border"><span >Total</span><span>Rs. {order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & History */}
                        <div className="space-y-6">
                            {/* Order Management */}
                            <div className="bg-gray-50 dark:bg-brand-surface p-5 rounded-lg border dark:border-brand-border">
                                <h3 className="text-lg font-semibold flex items-center mb-4"><TruckIcon className="h-5 w-5 mr-2 text-gray-400"/>Management</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="status" className={labelClass}>Update Status</label>
                                        <select 
                                            id="status" 
                                            value={newStatus} 
                                            onChange={(e) => setNewStatus(e.target.value as OrderStatus)} 
                                            className={inputClass}
                                        >
                                            {StatusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Note field (Optional) */}
                                    <div>
                                        <label htmlFor="statusNote" className={labelClass}>Status Note <span className="text-xs text-gray-400">(Optional)</span></label>
                                        <input 
                                            type="text" 
                                            id="statusNote" 
                                            value={statusNote}
                                            onChange={(e) => setStatusNote(e.target.value)}
                                            placeholder={newStatus === order.status ? "Add note without changing status..." : "Reason for change..."}
                                            className={inputClass}
                                        />
                                    </div>

                                     <div>
                                        <label htmlFor="trackingCarrier" className={labelClass}>Shipping Carrier</label>
                                        <select
                                            id="trackingCarrier"
                                            name="trackingCarrier"
                                            value={localOrder.trackingCarrier || ''}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            disabled={newStatus !== 'Shipped' && newStatus !== 'Out for Delivery' && newStatus !== 'Delivered'}
                                        >
                                            <option value="">Select Carrier</option>
                                            <option value="UPS">UPS</option>
                                            <option value="FedEx">FedEx</option>
                                            <option value="DHL">DHL</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                     <div>
                                        <label htmlFor="trackingNumber" className={labelClass}>Tracking Number</label>
                                        <input 
                                            type="text" 
                                            id="trackingNumber" 
                                            name="trackingNumber" 
                                            value={localOrder.trackingNumber || ''} 
                                            onChange={handleInputChange} 
                                            className={inputClass}
                                            placeholder="Enter tracking #"
                                            disabled={newStatus !== 'Shipped' && newStatus !== 'Out for Delivery' && newStatus !== 'Delivered'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="bg-white dark:bg-brand-surface border dark:border-brand-border rounded-lg p-5 max-h-96 overflow-y-auto">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-2"/>Timeline</h3>
                                <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-2 space-y-6">
                                    {sortedHistory.length > 0 ? sortedHistory.map((event, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            <span className="absolute top-1.5 left-[-5px] h-2.5 w-2.5 rounded-full bg-gray-400 ring-4 ring-white dark:ring-brand-charcoal"></span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{event.status}</p>
                                            <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                                            {event.note && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">"{event.note}"</p>}
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500 pl-6">No history available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-brand-border flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-brand-charcoal z-10">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600">Update Order</button>
                </div>
            </div>
        </div>
    );
};
