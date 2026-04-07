
import React from 'react';
import { User } from '../../types';
import { CloseIcon, UserIcon, MapPinIcon, CalendarDaysIcon } from '../icons';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: User;
}

const DetailItem: React.FC<{ icon: React.FC<{className?: string}>, label: string, value?: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center text-sm group">
        <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-brand-gold/30 transition-luxury mr-4">
            <Icon className="h-4 w-4 text-brand-gold" />
        </div>
        <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{value || 'UNSPECIFIED'}</p>
        </div>
    </div>
);

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
    if (!isOpen) return null;
    
    const totalSpent = customer.orders?.reduce((acc, order) => acc + order.total, 0) || 0;

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 lg:p-8 overflow-hidden" onClick={onClose}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500"></div>
            
            <div className="glass-card rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 border border-white/10 animate-in zoom-in-95 duration-500 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-gold/5 rounded-full blur-[80px] -z-10"></div>

                <div className="p-8 lg:p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-white tracking-wide">Client Audit Profile</h2>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-1">Centralized intelligence Ledger</p>
                    </div>
                    <button onClick={onClose} className="p-3 glass-panel rounded-2xl hover:bg-white/10 transition-luxury group">
                        <CloseIcon className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar p-8 lg:p-12 space-y-12">
                    {/* Customer Identity Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-[2rem] border border-white/5 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-luxury"></div>
                        <div className="h-24 w-24 rounded-3xl bg-gradient-gold flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-brand-gold/30 border border-brand-gold/40 relative z-10">
                            {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-grow text-center md:text-left relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                <h3 className="text-3xl font-bold text-white tracking-tight">{customer.name}</h3>
                                <span className={`w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.status === 'Active' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                                    {customer.status || 'UNVERIFIED'}
                                </span>
                            </div>
                            <p className="text-zinc-400 font-medium tracking-wide">{customer.email}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Intelligence Metrics */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black text-brand-gold uppercase tracking-[0.4em]">Intelligence metrics</h4>
                                <div className="h-px flex-grow ml-4 bg-gradient-to-r from-brand-gold/20 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <DetailItem icon={CalendarDaysIcon} label="Protocol Init" value={customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : undefined} />
                                <DetailItem icon={CalendarDaysIcon} label="Last Presence" value={customer.lastSeen ? new Date(customer.lastSeen).toLocaleDateString() : undefined} />
                                <div className="sm:col-span-2">
                                   <DetailItem icon={MapPinIcon} label="Logistics Endpoint" value={customer.address ? `${customer.address.street}, ${customer.address.city}, ${customer.address.zip}` : undefined} />
                                </div>
                            </div>
                        </div>

                        {/* Financial Snapshot */}
                        <div className="glass-panel p-8 rounded-[2rem] border-white/5 relative overflow-hidden group h-fit">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-luxury">
                                <UserIcon className="h-20 w-20 text-brand-gold" />
                            </div>
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 text-center lg:text-left">Lifetime acquisition value</h4>
                            <p className="text-5xl font-black text-white text-center lg:text-left tracking-tighter">
                                <span className="text-xl text-brand-gold mr-2 font-serif italic">Rs.</span>
                                {totalSpent.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Acquisition History */}
                    <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black text-brand-gold uppercase tracking-[0.4em]">Acquisition log history</h4>
                            <div className="h-px flex-grow ml-4 bg-gradient-to-r from-brand-gold/20 to-transparent"></div>
                        </div>
                        
                        <div className="glass-panel rounded-[2rem] overflow-hidden border-white/5 bg-white/[0.02]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5 bg-white/5">
                                        <th className="px-6 py-4">Protocol ID</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Valuation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {customer.orders?.length ? customer.orders.map(order => (
                                        <tr key={order.id} className="group hover:bg-white/5 transition-luxury">
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-brand-gold tracking-widest uppercase">{order.id}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-zinc-400">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-white/10 text-zinc-300">{order.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-black text-white">Rs. {order.total.toLocaleString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12">
                                                <p className="text-xs font-serif italic text-zinc-600">Zero transaction records detected in current protocol.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-8 lg:p-10 border-t border-white/5 flex justify-end bg-white/[0.02]">
                    <button 
                        onClick={onClose} 
                        className="px-10 py-3 glass-panel rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-luxury"
                    >
                        Terminal Session Clear
                    </button>
                </div>
            </div>
        </div>
    );
};
