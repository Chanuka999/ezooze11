
import React from 'react';
import { User } from '../../types';
import { CloseIcon, UserIcon, MapPinIcon, CalendarDaysIcon } from '../icons';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: User;
}

const DetailItem: React.FC<{ icon: React.FC<{className?: string}>, label: string, value?: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center text-sm">
        <Icon className="h-5 w-5 text-gray-400 mr-3" />
        <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{label}:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{value || 'N/A'}</span>
        </div>
    </div>
);

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
    if (!isOpen) return null;
    
    const totalSpent = customer.orders?.reduce((acc, order) => acc + order.total, 0) || 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-charcoal rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-brand-border flex justify-between items-center">
                    <h2 className="text-xl font-serif font-semibold">Customer Details</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><CloseIcon className="h-6 w-6" /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    {/* Customer Info Header */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <UserIcon className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-2xl font-bold">{customer.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                    </div>
                    
                    {/* Key Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <DetailItem icon={CalendarDaysIcon} label="Joined" value={customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'} />
                        <DetailItem icon={CalendarDaysIcon} label="Last Seen" value={customer.lastSeen ? new Date(customer.lastSeen).toLocaleDateString() : 'N/A'} />
                        <div className="flex items-center text-sm">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">Status:</span>
                            <span className={`px-2 py-1 rounded-full font-semibold text-xs ${customer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {customer.status || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                        <h4 className="text-lg font-semibold flex items-center"><MapPinIcon className="h-5 w-5 mr-2 text-gray-400"/> Shipping Address</h4>
                       <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {customer.address ? `${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}` : 'No address provided.'}
                       </p>
                    </div>

                    {/* Order History */}
                    <div>
                        <h4 className="text-lg font-semibold">Order History</h4>
                        <p className="text-sm text-gray-500">Total Spent: <span className="font-bold text-gray-700 dark:text-gray-200">Rs. {totalSpent.toLocaleString()}</span></p>
                        <div className="mt-4 border rounded-lg overflow-hidden dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Order ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-brand-charcoal divide-y divide-gray-200 dark:divide-gray-700">
                                    {customer.orders?.length ? customer.orders.map(order => (
                                        <tr key={order.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{order.id}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{order.status}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right">Rs. {order.total.toLocaleString()}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="text-center py-4 text-gray-500">No orders found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-brand-border flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
                </div>
            </div>
        </div>
    );
};
