
import React from 'react';
import { AdminSection, Product } from '../../types';
import { ShoppingBagIcon, CurrencyDollarIcon, StarIcon, ArchiveBoxXMarkIcon, ArrowRightIcon } from '../icons';

interface AdminDashboardProps {
    products: Product[];
    setActiveSection: (section: AdminSection) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.FC<{className?: string}>; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
            <Icon className="h-7 w-7 text-white" />
        </div>
    </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, setActiveSection }) => {
    const totalSales = 1256000; // Mock data
    const featuredCount = products.filter(p => p.featured).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    const categoryCounts = products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const maxCategoryCount = Math.max(...(Object.values(categoryCounts) as number[]), 1);

    const recentProducts = [...products].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).sort((a, b) => a.stock - b.stock);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Sales" value={`Rs. ${totalSales.toLocaleString()}`} icon={CurrencyDollarIcon} color="bg-blue-500" />
                <StatCard title="Total Products" value={products.length} icon={ShoppingBagIcon} color="bg-green-500" />
                <StatCard title="Featured Products" value={featuredCount} icon={StarIcon} color="bg-yellow-500" />
                <StatCard title="Out of Stock" value={outOfStockCount} icon={ArchiveBoxXMarkIcon} color="bg-red-500" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Products by Category</h2>
                    <div className="h-72 flex items-end space-x-4 text-center">
                        {Object.entries(categoryCounts).map(([category, count]: [string, number]) => (
                            <div key={category} className="flex-1 flex flex-col items-center justify-end h-full">
                                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{count}</div>
                                <div 
                                    className="w-4/5 bg-brand-gold/80 hover:bg-brand-gold rounded-t-md transition-all duration-300" 
                                    style={{ height: `${(count / maxCategoryCount) * 80}%` }}
                                ></div>
                                <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{category}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Products</h2>
                        <button onClick={() => setActiveSection('products')} className="text-sm font-medium text-brand-gold hover:underline">View All</button>
                    </div>
                    <ul className="mt-4 space-y-4">
                        {recentProducts.map(p => (
                            <li key={p.id} className="flex items-center space-x-4">
                                <img src={p.imageUrls[0]} alt={p.name} className="h-12 w-12 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">{p.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Rs. {p.price.toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

             <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
                    <button onClick={() => setActiveSection('products')} className="text-sm font-medium text-brand-gold hover:underline flex items-center">
                        Manage Inventory <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </button>
                </div>
                {lowStockProducts.length > 0 ? (
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 dark:text-gray-400">
                                <tr><th className="py-2 px-3 font-medium">Product</th><th className="py-2 px-3 font-medium">Stock Left</th></tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.map(p => (
                                    <tr key={p.id} className="border-t dark:border-gray-700">
                                        <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">{p.name}</td>
                                        <td className="py-3 px-3">
                                            <span className="font-bold text-red-500 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full text-xs">{p.stock} units</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mt-4 text-gray-600 dark:text-gray-400">No products are currently low on stock. Great job!</p>
                )}
            </div>
        </div>
    );
};
