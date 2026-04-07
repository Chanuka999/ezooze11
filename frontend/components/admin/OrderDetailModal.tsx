
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

        const updatedOrder = { ...localOrder, status: newStatus };

        if (newStatus !== order.status) {
            const newHistoryEntry = {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: statusNote || undefined
            };
            updatedOrder.statusHistory = [...(order.statusHistory || []), newHistoryEntry];
        } else if (statusNote) {
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

    const inputClass = "block w-full mt-2 p-3 glass-panel rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 ring-brand-gold/30 bg-white/5 border border-white/5 disabled:opacity-20";
    const labelClass = "block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1";
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-500" onClick={onClose}>
            <div 
                className="glass-card rounded-[3rem] w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden relative border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[100px] -z-10"></div>

                {/* Header */}
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20 uppercase tracking-[0.2em]">Transaction Log</span>
                            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Audit: <span className="text-brand-gold">{order.id}</span></h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                            <CalendarDaysIcon className="h-3 w-3 text-brand-gold" />
                            <span>Aquired on {new Date(order.date).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-3 glass-panel rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-luxury"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Info Section */}
                        <div className="lg:col-span-8 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Identity Box */}
                                <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] group hover:border-brand-gold/20 transition-luxury">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-6 flex items-center gap-3">
                                        <div className="h-px w-6 bg-brand-gold/30"></div>
                                        Client Identity
                                    </h3>
                                    <div className="flex items-start gap-4">
                                        <div className="p-4 glass-panel rounded-2xl bg-brand-gold/5 border-brand-gold/10">
                                            <UserCircleIcon className="h-6 w-6 text-brand-gold" />
                                        </div>
                                        <div>
                                            <button 
                                                onClick={viewCustomer} 
                                                className="text-lg font-bold text-white hover:text-brand-gold transition-luxury block mb-1"
                                            >
                                                {order.customerName}
                                            </button>
                                            <p className="text-sm font-medium text-zinc-300 mb-1">{order.customerEmail}</p>
                                            {order.customerPhone && <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{order.customerPhone}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics Box */}
                                <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] group hover:border-brand-gold/20 transition-luxury">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-6 flex items-center gap-3">
                                        <div className="h-px w-6 bg-brand-gold/30"></div>
                                        Logistics Destination
                                    </h3>
                                    <div className="flex items-start gap-4">
                                        <div className="p-4 glass-panel rounded-2xl bg-brand-gold/5 border-brand-gold/10">
                                            <MapPinIcon className="h-6 w-6 text-brand-gold" />
                                        </div>
                                        <address className="text-sm not-italic font-medium text-zinc-300 leading-relaxed">
                                            {order.shippingAddress.street}<br/>
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br/>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold mt-2 block">{order.shippingAddress.country}</span>
                                        </address>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Inventory Manifest */}
                            <div>
                                <h3 className="text-xl font-serif font-bold text-white mb-6 pl-2 border-l-2 border-brand-gold">Inventory Manifest</h3>
                                <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 bg-white/[0.01]">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/[0.03] text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                                <th className="px-6 py-4">Item Catalog</th>
                                                <th className="px-6 py-4 text-right">Valuation</th>
                                                <th className="px-6 py-4 text-center">Unit Count</th>
                                                <th className="px-6 py-4 text-right">Summation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {order.items.map(item => (
                                                <tr key={item.id} className="group hover:bg-white/[0.02] transition-luxury">
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-luxury">{item.name}</p>
                                                        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{item.selectedSize} <span className="mx-1 text-zinc-600">|</span> {item.selectedColor}</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm text-zinc-300 font-medium text-right">Rs. {(item.discountPrice ?? item.price).toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-[10px] font-black text-zinc-400 px-3 py-1 glass-panel rounded-lg">x{item.quantity}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-black text-white text-right">Rs. {((item.discountPrice ?? item.price) * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                             {/* Final Ledger */}
                            <div className="flex justify-end pr-4">
                                <div className="w-full max-w-sm space-y-4">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400"><span>Manifest Subtotal</span><span className="text-white">Rs. {order.subtotal.toLocaleString()}</span></div>
                                     {order.discount && order.discount > 0 ? (
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-brand-gold"><span>Protocol Rebate</span><span>- Rs. {order.discount.toLocaleString()}</span></div>
                                    ) : null}
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400"><span>Logistics Fee</span><span className="text-white">Rs. {order.shipping.toLocaleString()}</span></div>
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Total Valuation</span>
                                        <span className="text-3xl font-serif font-bold text-white">Rs. {order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Control Column */}
                        <div className="lg:col-span-4 space-y-10">
                            {/* Command Center */}
                            <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 bg-white/[0.03] shadow-2xl">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white flex items-center mb-8">
                                    <TruckIcon className="h-4 w-4 mr-3 text-brand-gold"/>
                                    Command Center
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="status" className={labelClass}>Operational Status</label>
                                        <div className="relative group">
                                            <select 
                                                id="status" 
                                                value={newStatus} 
                                                onChange={(e) => setNewStatus(e.target.value as OrderStatus)} 
                                                className={`${inputClass} appearance-none cursor-pointer hover:border-brand-gold/30 transition-luxury`}
                                            >
                                                {StatusOptions.map(status => (
                                                    <option key={status} value={status} className="bg-brand-charcoal text-white">{status}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-gold opacity-50">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label htmlFor="statusNote" className={labelClass}>Protocol Note <span className="text-[9px] text-gray-500 opacity-60">(MEMO)</span></label>
                                        <textarea 
                                            id="statusNote" 
                                            value={statusNote}
                                            rows={2}
                                            onChange={(e) => setStatusNote(e.target.value)}
                                            placeholder="Append specific details to transaction logs..."
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>

                                     <div className="space-y-2">
                                        <label htmlFor="trackingCarrier" className={labelClass}>Logistics Carrier</label>
                                        <select
                                            id="trackingCarrier"
                                            name="trackingCarrier"
                                            value={localOrder.trackingCarrier || ''}
                                            onChange={handleInputChange}
                                            className={`${inputClass} disabled:opacity-5 appearance-none cursor-pointer`}
                                            disabled={newStatus !== 'Shipped' && newStatus !== 'Out for Delivery' && newStatus !== 'Delivered'}
                                        >
                                            <option value="" className="bg-brand-charcoal text-white">Select Agency</option>
                                            <option value="UPS" className="bg-brand-charcoal text-white">UPS Global</option>
                                            <option value="FedEx" className="bg-brand-charcoal text-white">FedEx Express</option>
                                            <option value="DHL" className="bg-brand-charcoal text-white">DHL Worldwide</option>
                                            <option value="Other" className="bg-brand-charcoal text-white">Bespoke Logistics</option>
                                        </select>
                                    </div>

                                     <div className="space-y-2">
                                        <label htmlFor="trackingNumber" className={labelClass}>Tracking Serial</label>
                                        <input 
                                            type="text" 
                                            id="trackingNumber" 
                                            name="trackingNumber" 
                                            value={localOrder.trackingNumber || ''} 
                                            onChange={handleInputChange} 
                                            className={`${inputClass} disabled:opacity-5`}
                                            placeholder="Awaiting registration..."
                                            disabled={newStatus !== 'Shipped' && newStatus !== 'Out for Delivery' && newStatus !== 'Delivered'}
                                        />
                                    </div>
                                    
                                    <button 
                                        onClick={handleSave} 
                                        className="w-full mt-6 bg-gradient-gold text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-luxury shadow-xl shadow-brand-gold/20"
                                    >
                                        Confirm Modifications
                                    </button>
                                </div>
                            </div>

                            {/* Audit Timeline */}
                            <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-white/[0.01]">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 flex items-center">
                                    <CalendarDaysIcon className="h-4 w-4 mr-3 text-gray-400"/>
                                    Audit Timeline
                                </h3>
                                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                                    {sortedHistory.length > 0 ? sortedHistory.map((event, idx) => (
                                        <div key={idx} className="relative pl-10 group">
                                            <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-brand-charcoal ring-2 transition-luxury ${idx === 0 ? 'bg-brand-gold ring-brand-gold/40' : 'bg-gray-600 ring-white/10'}`}></span>
                                            <p className={`text-xs font-black uppercase tracking-widest ${idx === 0 ? 'text-brand-gold' : 'text-white'}`}>{event.status}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{new Date(event.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                            {event.note && (
                                                <div className="mt-2 p-3 glass-panel rounded-xl bg-white/5 border-white/5">
                                                    <p className="text-[10px] text-zinc-300 leading-relaxed italic font-medium">"{event.note}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <p className="text-[10px] font-bold text-gray-700 italic uppercase tracking-widest text-center py-4">No audit trails recorded.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

