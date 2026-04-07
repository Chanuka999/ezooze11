import React from 'react';
import { AdminSection, Product } from '../../types';
import { ShoppingBagIcon, CurrencyDollarIcon, StarIcon, ArchiveBoxXMarkIcon, ArrowRightIcon } from '../icons';

interface AdminDashboardProps {
    products: Product[];
    setActiveSection: (section: AdminSection) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.FC<{className?: string}>; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card hover-glow p-6 rounded-3xl transition-luxury group relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl group-hover:bg-brand-gold/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-gold shadow-lg shadow-brand-gold/20 group-hover:scale-110 transition-luxury`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
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
        <div className="space-y-10 pb-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Revenue Stream" value={`Rs. ${totalSales.toLocaleString()}`} icon={CurrencyDollarIcon} color="bg-brand-gold" />
                <StatCard title="Inventory Size" value={products.length} icon={ShoppingBagIcon} color="bg-brand-gold" />
                <StatCard title="Featured Gems" value={featuredCount} icon={StarIcon} color="bg-brand-gold" />
                <StatCard title="Critical Stock" value={outOfStockCount} icon={ArchiveBoxXMarkIcon} color="bg-brand-gold" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Category Insights */}
                <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -z-10"></div>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Category Distribution</h2>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Inventory breakdown by segment</p>
                        </div>
                    </div>
                    
                    <div className="h-80 flex items-end justify-between px-4 pb-4">
                        {Object.entries(categoryCounts).map(([category, count]: [string, number]) => (
                            <div key={category} className="flex-1 flex flex-col items-center group">
                                <div className="mb-4 relative">
                                    <span className="text-sm font-bold text-brand-gold opacity-0 group-hover:opacity-100 transition-luxury absolute -top-8 left-1/2 -translate-x-1/2">{count}</span>
                                    <div 
                                        className="w-12 bg-white/5 group-hover:bg-brand-gold rounded-full transition-luxury relative overflow-hidden" 
                                        style={{ height: `${(count / maxCategoryCount) * 220}px` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest rotate-45 mt-4 origin-left group-hover:text-white transition-colors">{category}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Recent Inventory additions */}
                <div className="glass-card rounded-[2rem] p-8 border-t-4 border-brand-gold">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Recent Additions</h2>
                        <button onClick={() => setActiveSection('products')} className="p-2 glass-panel rounded-lg hover:bg-brand-gold group transition-luxury">
                            <ArrowRightIcon className="h-4 w-4 text-brand-gold group-hover:text-white" />
                        </button>
                    </div>
                    <ul className="space-y-6">
                        {recentProducts.map(p => (
                            <li key={p.id} className="flex items-center gap-4 group cursor-pointer hover:translate-x-2 transition-luxury">
                                <div className="h-14 w-14 rounded-2xl overflow-hidden border border-white/5 p-1 bg-white/5 group-hover:border-brand-gold transition-luxury">
                                    <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover rounded-xl" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-white group-hover:text-brand-gold transition-colors truncate">{p.name}</p>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className="text-sm font-black text-brand-gold">Rs.{Math.round(p.price/1000)}K</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Critical Inventory Monitoring */}
            <div className="glass-card rounded-[2rem] p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Critical Alerts</h2>
                        <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest mt-1">Inventory depletion warning</p>
                    </div>
                    <button onClick={() => setActiveSection('products')} className="px-6 py-2 glass-panel rounded-xl text-xs font-bold text-brand-gold hover:bg-brand-gold hover:text-white transition-luxury uppercase tracking-widest">
                        Manage Full Inventory
                    </button>
                </div>
                
                {lowStockProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStockProducts.map(p => (
                            <div key={p.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border-l-2 border-red-500/50">
                                <div>
                                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{p.name}</p>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">{p.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-red-500 animate-pulse">{p.stock}</span>
                                    <span className="text-[8px] block font-bold text-zinc-500 uppercase tracking-[0.2em]">Units Left</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-10 rounded-2xl text-center border-dashed border-2 border-brand-gold/10">
                        <ArchiveBoxXMarkIcon className="h-12 w-12 text-zinc-800 mx-auto mb-4 opacity-50" />
                        <p className="text-zinc-400 font-medium font-serif italic text-lg">Inventory levels are currently within optimal parameters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
