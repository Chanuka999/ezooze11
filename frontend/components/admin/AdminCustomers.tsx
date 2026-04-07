
import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { NotificationType } from '../Notification';
import { CustomerDetailModal } from './CustomerDetailModal';

interface AdminCustomersProps {
    users: User[];
}

const StatusBadge: React.FC<{ status?: 'Active' | 'Inactive' }> = ({ status }) => {
    const s = status || 'Active';
    if (s === 'Active') {
        return <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 rounded-full border border-emerald-400/20 shadow-sm shadow-emerald-400/5">Active</span>;
    }
    return <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-500/10 rounded-full border border-zinc-500/20">Inactive</span>;
};

const CustomerAvatar: React.FC<{ name: string }> = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
        <div className="h-12 w-12 rounded-2xl bg-gradient-gold flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-gold/20 border border-brand-gold/30">
            {initials}
        </div>
    );
};


export const AdminCustomers: React.FC<AdminCustomersProps> = ({ users }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
    const [customerToView, setCustomerToView] = useState<User | null>(null);

    const customers = useMemo(() => users.filter(u => u.role !== 'admin'), [users]);

    const filteredCustomers = useMemo(() => {
        return customers
            .filter(c => statusFilter === 'all' || c.status === statusFilter)
            .filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [customers, searchTerm, statusFilter]);

    const totalAcquisitions = customers.length;
    const activeProtocols = customers.filter(c => c.status === 'Active').length;
    const topSpender = customers.reduce((max, c) => {
        const spent = c.orders?.reduce((sum, o) => sum + o.total, 0) || 0;
        return spent > max.spent ? { name: c.name, spent } : max;
    }, { name: 'N/A', spent: 0 });

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Customer Intelligence Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-brand-gold/5 rounded-full blur-2xl"></div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Total Acquisitions</p>
                    <p className="text-3xl font-black text-white">{totalAcquisitions}</p>
                </div>
                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Active Protocols</p>
                    <p className="text-3xl font-black text-emerald-400">{activeProtocols}</p>
                </div>
                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Elite Spender</p>
                    <p className="text-xl font-bold text-brand-gold truncate">{topSpender.name}</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Rs. {topSpender.spent.toLocaleString()}</p>
                </div>
            </div>

            {/* Filtering Protocol */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="relative group w-full lg:max-w-md">
                    <div className="flex items-center glass-panel rounded-2xl px-4 py-2.5 bg-white/5 border border-white/5 focus-within:ring-2 ring-brand-gold/30 transition-luxury">
                        <input
                            type="text"
                            placeholder="Identify specific client protocol..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
                        />
                    </div>
                </div>
                <div className="glass-panel px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="bg-transparent text-xs font-black text-zinc-300 uppercase tracking-[0.15em] focus:outline-none cursor-pointer"
                    >
                        <option value="all" className="bg-brand-charcoal">Global Status</option>
                        <option value="Active" className="bg-brand-charcoal">Active Protocols</option>
                        <option value="Inactive" className="bg-brand-charcoal">Inactive Protocols</option>
                    </select>
                </div>
            </div>

            {/* Client Directory Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -z-10"></div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="glass-panel text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 border-b border-white/5">
                                <th className="px-8 py-6">Client Identity</th>
                                <th className="px-6 py-6 text-center">Status</th>
                                <th className="px-6 py-6 text-center">Verification Date</th>
                                <th className="px-6 py-6 text-center">Total Value Contribution</th>
                                <th className="px-8 py-6 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="group hover:bg-white/5 transition-luxury">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <CustomerAvatar name={customer.name} />
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-luxury">{customer.name}</p>
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center"><StatusBadge status={customer.status} /></td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest text-xs">
                                            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-sm font-black text-white">Rs. {(customer.orders?.reduce((sum, o) => sum + o.total, 0) || 0).toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button 
                                            onClick={() => setCustomerToView(customer)} 
                                            className="px-6 py-2.5 glass-panel rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-brand-gold hover:bg-brand-gold/10 hover:border-brand-gold/30 transition-luxury"
                                        >
                                            Full Audit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="opacity-20 flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-500 mb-4 animate-pulse"></div>
                                            <p className="text-sm font-serif italic text-zinc-500">No client protocols identified within parameters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {customerToView && (
                <CustomerDetailModal 
                    isOpen={!!customerToView}
                    onClose={() => setCustomerToView(null)}
                    customer={customerToView}
                />
            )}
        </div>
    );
};
