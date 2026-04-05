
import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { NotificationType } from '../Notification';
import { CustomerDetailModal } from './CustomerDetailModal';

interface AdminCustomersProps {
    users: User[];
}

const StatusBadge: React.FC<{ status?: 'Active' | 'Inactive' }> = ({ status }) => {
    const s = status || 'Active';
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    if (s === 'Active') {
        return <span className={`${baseClasses} text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-300`}>Active</span>;
    }
    return <span className={`${baseClasses} text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-300`}>Inactive</span>;
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-xs p-2 border border-gray-300 rounded-md dark:bg-brand-surface dark:border-brand-border dark:text-white"
                />
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="w-full sm:w-auto p-2 border border-gray-300 rounded-md dark:bg-brand-surface dark:border-brand-border dark:text-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className="bg-white dark:bg-brand-charcoal rounded-lg shadow-md border border-gray-200 dark:border-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Date Joined</th>
                                <th scope="col" className="px-6 py-3">Total Spent</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="bg-white dark:bg-brand-charcoal border-b dark:border-brand-border hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        <div className="font-semibold">{customer.name}</div>
                                        <div className="text-xs text-gray-500">{customer.email}</div>
                                    </th>
                                    <td className="px-6 py-4"><StatusBadge status={customer.status} /></td>
                                    <td className="px-6 py-4">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4">Rs. {customer.orders?.reduce((sum, o) => sum + o.total, 0).toLocaleString() || 0}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setCustomerToView(customer)} className="font-medium text-brand-gold hover:underline">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
