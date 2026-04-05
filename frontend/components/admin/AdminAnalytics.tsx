
import React, { useState, useMemo } from 'react';
import { Order, Product, AdminSection } from '../../types';
import { CurrencyDollarIcon, ShoppingBagIcon, UsersIcon, ArrowRightIcon } from '../icons';

interface AdminAnalyticsProps {
    orders: Order[];
    products: Product[];
    viewProductOnSite: (product: Product) => void;
    setActiveSection: (section: AdminSection) => void;
}

type TimePeriod = '7d' | '30d' | 'all';

const StatCard: React.FC<{ title: string; value: string | number; change?: string; changeType?: 'increase' | 'decrease', icon: React.FC<{className?: string}> }> = ({ title, value, change, changeType, icon: Icon }) => (
    <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {change && (
                <p className={`text-sm mt-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {change} vs. previous period
                </p>
            )}
        </div>
        <div className="flex-shrink-0">
             <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
    </div>
);

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ orders, products, viewProductOnSite, setActiveSection }) => {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
    
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const cutoff = new Date();
        if (timePeriod === '7d') cutoff.setDate(now.getDate() - 7);
        else if (timePeriod === '30d') cutoff.setDate(now.getDate() - 30);
        else return orders.filter(o => o.status === 'Delivered' || o.status === 'Shipped');

        return orders.filter(o => (o.status === 'Delivered' || o.status === 'Shipped') && new Date(o.date) >= cutoff);
    }, [orders, timePeriod]);
    
    // --- KPIs ---
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const newCustomers = new Set(filteredOrders.map(o => o.customerId)).size; // Mocked as unique customers in period
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // --- Sales Chart Data ---
    const salesByDay = useMemo(() => {
        const days: Record<string, number> = {};
        filteredOrders.forEach(order => {
            const day = new Date(order.date).toLocaleDateString();
            days[day] = (days[day] || 0) + order.total;
        });
        return Object.entries(days).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    }, [filteredOrders]);

    const maxDailySale = Math.max(...salesByDay.map(([, total]) => total), 1);
    
    // --- Top Products ---
    const topProducts = useMemo(() => {
        const productSales: Record<string, { product: Product; quantity: number, revenue: number }> = {};
        
        orders.filter(o => o.status === 'Delivered' || o.status === 'Shipped').forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = { product: item, quantity: 0, revenue: 0 };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += (item.discountPrice ?? item.price) * item.quantity;
            });
        });
        
        return Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    }, [orders]);


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Gain insights into your store's performance.</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0 p-1 bg-gray-200 dark:bg-brand-surface rounded-lg">
                    {(['7d', '30d', 'all'] as TimePeriod[]).map(period => (
                        <button key={period} onClick={() => setTimePeriod(period)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timePeriod === period ? 'bg-white dark:bg-brand-charcoal shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
                            {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value={`Rs. ${Math.round(totalRevenue).toLocaleString()}`} icon={CurrencyDollarIcon} />
                <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBagIcon} />
                <StatCard title="New Customers" value={newCustomers} icon={UsersIcon} />
                <StatCard title="Avg. Order Value" value={`Rs. ${Math.round(avgOrderValue).toLocaleString()}`} icon={CurrencyDollarIcon} />
            </div>

            <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Sales Trend</h2>
                <div className="h-72 flex items-end space-x-2">
                    {salesByDay.length > 0 ? salesByDay.map(([day, total]) => (
                        <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${day}: Rs. ${total.toLocaleString()}`}>
                            <div 
                                className="w-full bg-brand-gold/80 hover:bg-brand-gold rounded-t-md transition-all duration-300" 
                                style={{ height: `${(total / maxDailySale) * 95}%` }}
                            ></div>
                        </div>
                    )) : (
                        <div className="w-full text-center text-gray-500 flex items-center justify-center h-full">No sales data for this period.</div>
                    )}
                </div>
                <div className="border-t dark:border-brand-border mt-2 pt-2 flex justify-between text-xs text-gray-400">
                    <span>{salesByDay.length > 0 ? new Date(salesByDay[0][0]).toLocaleDateString() : ''}</span>
                    <span>{salesByDay.length > 0 ? new Date(salesByDay[salesByDay.length-1][0]).toLocaleDateString() : ''}</span>
                </div>
            </div>

            <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Products</h2>
                    <button onClick={() => setActiveSection('products')} className="text-sm font-medium text-brand-gold hover:underline flex items-center">
                        View All Products <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </button>
                </div>
                 <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="py-2 px-3 font-medium">Product</th>
                                <th className="py-2 px-3 font-medium text-right">Units Sold</th>
                                <th className="py-2 px-3 font-medium text-right">Total Revenue</th>
                                <th className="py-2 px-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map(({ product, quantity, revenue }) => (
                                <tr key={product.id} className="border-t dark:border-brand-border">
                                    <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-3">
                                        <img src={product.imageUrls[0]} alt={product.name} className="h-10 w-10 object-cover rounded-md flex-shrink-0" />
                                        <span>{product.name}</span>
                                    </td>
                                    <td className="py-3 px-3 text-right">{quantity}</td>
                                    <td className="py-3 px-3 text-right font-semibold">Rs. {revenue.toLocaleString()}</td>
                                    <td className="py-3 px-3 text-right">
                                        <button onClick={() => viewProductOnSite(product)} className="font-medium text-brand-gold hover:underline">View on Store</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
