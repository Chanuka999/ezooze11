import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Order, Page } from '../types';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  ChevronRightIcon, 
  SettingsIcon, 
  LogOutIcon, 
  PackageIcon, 
  ClockIcon,
  CheckCircleIcon
} from '../components/icons';

interface DashboardProps {
  navigateTo: (page: Page) => void;
  orders: Order[];
}

export const Dashboard: React.FC<DashboardProps> = ({ navigateTo, orders }) => {
  const { user, logout } = useAuth();

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Confirmed').length;
    return { totalSpent, pendingOrders, totalOrders: orders.length };
  }, [orders]);

  const handleLogout = () => {
    logout();
    navigateTo('home');
  };

  return (
    <div className="min-h-screen bg-brand-charcoal text-brand-cream pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="relative overflow-hidden glass-card rounded-3xl p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-brand-gold font-medium tracking-[0.2em] uppercase text-xs mb-2">Welcome Back</p>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-2">
                Hello, <span className="text-gradient-gold">{user?.name || 'Aether'}</span>
              </h1>
              <p className="text-gray-400 max-w-md">Your fashion journey continues here. Manage your orders and profile with ease.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigateTo('shop' as any)} className="px-6 py-3 bg-brand-gold text-white rounded-xl font-bold hover:bg-yellow-600 transition-luxury hover-glow text-sm">
                Shop New Arrivals
              </button>
              <button onClick={handleLogout} className="p-3 glass-panel rounded-xl hover:bg-white/10 transition-luxury group">
                <LogOutIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: PackageIcon },
            { label: 'Total Investment', value: `Rs. ${stats.totalSpent.toLocaleString()}`, icon: ShoppingBagIcon },
            { label: 'In Transit', value: stats.pendingOrders, icon: ClockIcon },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 border-l-4 border-brand-gold">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-gold/10 rounded-lg">
                  <stat.icon className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders & Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Tracking: Galaxy View */}
          <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-white">Order Tracking</h2>
              <button 
                onClick={() => navigateTo('shop' as any)}
                className="text-xs text-brand-gold hover:underline tracking-widest uppercase"
              >
                View History
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="glass-panel rounded-2xl p-6 hover:bg-white/5 transition-luxury group border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                          <PackageIcon className="w-6 h-6 text-brand-gold/60" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Order #{order.id}</p>
                          <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500' : 'bg-brand-gold/10 text-brand-gold'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    
                    {/* Status Progress Bar */}
                    <div className="relative h-1 bg-white/5 rounded-full overflow-hidden mt-6">
                      <div 
                        className="absolute h-full bg-gradient-gold"
                        style={{ width: order.status === 'Delivered' ? '100%': order.status === 'Shipped' ? '75%' : '25%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
                <div className="w-20 h-20 bg-brand-gold/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBagIcon className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">No active orders found</h3>
                <p className="text-gray-500 text-sm mb-6">Explore our curated collections and start your premium journey.</p>
                <button onClick={() => navigateTo('shop' as any)} className="px-8 py-3 glass-panel rounded-xl text-brand-gold font-bold hover:bg-brand-gold hover:text-white transition-luxury">
                   Visit Shop
                </button>
              </div>
            )}
          </div>

          {/* Side Panel: Profile Settings */}
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <h2 className="text-2xl font-serif font-bold text-white">Account Details</h2>
            
            <div className="glass-card rounded-3xl p-8 space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative group cursor-pointer mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-gold p-1">
                    <div className="w-full h-full rounded-full bg-brand-charcoal flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                       {user?.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-luxury">
                    <SettingsIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-brand-gold/10 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></div>
                   <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{user?.role}</span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Edit Profile', icon: UserIcon },
                  { label: 'Security Settings', icon: SettingsIcon },
                  { label: 'Shipping Address', icon: PackageIcon },
                  { label: 'Newsletter Preference', icon: CheckCircleIcon },
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-luxury group">
                    <div className="flex items-center gap-4">
                      <item.icon className="w-5 h-5 text-gray-500 group-hover:text-brand-gold" />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white">{item.label}</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-zinc-700 group-hover:text-brand-gold" />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
