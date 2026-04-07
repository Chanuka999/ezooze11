
import React, { useState, useEffect, useRef } from 'react';
import { ChartBarIcon, ShoppingBagIcon, UsersIcon, CogIcon, DocumentTextIcon, HomeIcon, ArrowTopRightOnSquareIcon, ClipboardDocumentListIcon, PresentationChartLineIcon, TagIcon, SearchIcon, BellIcon, Cog6ToothIcon, UserCircleIcon, RectangleStackIcon, UserGroupIcon, ViewColumnsIcon, ArrowRightOnRectangleIcon } from '../icons';
import { AdminSection, Page, Product, Order, User, Notification } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useClickOutside } from '../../hooks/useClickOutside';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeSection: string;
    setActiveSection: (section: AdminSection) => void;
    navigateTo: (page: Page) => void;
    products: Product[];
    orders: Order[];
    users: User[];
    notifications: Notification[];
    hasUnread: boolean;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'analytics', name: 'Analytics', icon: PresentationChartLineIcon },
    { id: 'products', name: 'Products', icon: ShoppingBagIcon },
    { id: 'orders', name: 'Orders', icon: ClipboardDocumentListIcon },
    { id: 'customers', name: 'Customers', icon: UsersIcon },
    { id: 'discounts', name: 'Discounts', icon: TagIcon },
    { id: 'attributes', name: 'Attributes', icon: RectangleStackIcon },
    { id: 'navigation', name: 'Navigation', icon: ViewColumnsIcon },
    { id: 'userManagement', name: 'User Management', icon: UserGroupIcon },
    { id: 'content', name: 'Content', icon: DocumentTextIcon },
    { id: 'homepageSettings', name: 'Homepage', icon: HomeIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
];

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

const notificationIcons: { [key in Notification['type']]: React.FC<{className?: string}> } = {
    order: ClipboardDocumentListIcon,
    stock: ShoppingBagIcon,
    customer: UserCircleIcon,
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSection, setActiveSection, navigateTo, products, orders, users, notifications, hasUnread, markAllAsRead, clearNotifications }) => {
    const { user, logout } = useAuth();
    const activeItem = navItems.find(item => item.id === activeSection);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{type: string, name: string, id: string | number, icon: React.FC<{ className?: string }>, section: string}[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    useClickOutside(searchRef, () => setIsSearchOpen(false));

    // Notifications State
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    useClickOutside(notificationRef, () => setIsNotificationOpen(false));

    // Profile Dropdown State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    useClickOutside(profileRef, () => setIsProfileOpen(false));

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        
        const productResults = products
            .filter(p => p.name.toLowerCase().includes(lowerQuery))
            .map(p => ({ type: 'Product', name: p.name, id: p.id, icon: ShoppingBagIcon, section: 'products' }));
            
        const orderResults = orders
            .filter(o => o.id.toLowerCase().includes(lowerQuery) || o.customerName.toLowerCase().includes(lowerQuery))
            .map(o => ({ type: 'Order', name: `${o.id} - ${o.customerName}`, id: o.id, icon: ClipboardDocumentListIcon, section: 'orders' }));

        const customerResults = users
            .filter(u => u.role !== 'admin' && (u.name.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery)))
            .map(u => ({ type: 'Customer', name: u.name, id: u.id, icon: UsersIcon, section: 'customers' }));
            
        const combinedResults = [...productResults, ...orderResults, ...customerResults].slice(0, 7);
        setSearchResults(combinedResults);
        setIsSearchOpen(combinedResults.length > 0);
    }, [searchQuery, products, orders, users]);

    const handleSearchClick = (section: AdminSection) => {
        setActiveSection(section);
        setSearchQuery('');
        setIsSearchOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigateTo('home');
    };

    const handleNotificationToggle = () => {
        if (!isNotificationOpen) {
            markAllAsRead();
        }
        setIsNotificationOpen(prev => !prev);
    };

    const handleNotificationClick = (notification: Notification) => {
        setActiveSection(notification.link.section);
        setIsNotificationOpen(false);
    };
    
    return (
        <div className="flex h-screen bg-brand-charcoal text-brand-cream overflow-hidden font-sans">
            {/* Sidebar with Glassmorphism */}
            <aside className="w-72 glass-card m-4 mr-0 rounded-3xl flex-shrink-0 flex flex-col justify-between overflow-hidden border-r-0 shadow-2xl relative z-30">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-gold/10 to-transparent -z-10"></div>
                
                <div className="flex flex-col h-full">
                    <div className="h-24 flex items-center px-8">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveSection('dashboard')}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center glow-gold group-hover:scale-110 transition-luxury">
                                <span className="text-white font-serif font-bold text-xl">E</span>
                            </div>
                            <h1 className="text-xl font-serif font-bold tracking-widest text-white group-hover:text-brand-gold transition-colors uppercase">Admin</h1>
                        </div>
                    </div>

                    <nav className="flex-1 mt-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                        <p className="px-4 text-[10px] font-bold uppercase tracking-[.25em] text-gray-500 mb-4">Main Navigation</p>
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as AdminSection)}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-luxury relative group ${
                                    activeSection === item.id 
                                    ? 'bg-brand-gold/10 text-brand-gold' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {activeSection === item.id && (
                                    <div className="absolute left-0 w-1 h-6 bg-brand-gold rounded-r-full"></div>
                                )}
                                <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                                    activeSection === item.id ? 'text-brand-gold' : 'group-hover:text-brand-gold'
                                }`} />
                                <span className="tracking-wide">{item.name}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 mt-auto">
                        <button
                            onClick={() => navigateTo('home')}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold bg-white/5 hover:bg-brand-gold border border-white/5 hover:border-brand-gold rounded-2xl text-white transition-luxury hover-glow"
                        >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                            <span>Go to Store</span>
                        </button>
                    </div>
                </div>
            </aside>
            
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-brand-charcoal/50 backdrop-blur-md z-20">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[.3em] text-brand-gold mb-1 opacity-80">Section View</p>
                        <h2 className="text-2xl font-serif font-bold text-white tracking-wide capitalize">{activeItem?.name}</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar */}
                        <div className="relative group" ref={searchRef}>
                            <div className={`flex items-center glass-panel rounded-2xl px-4 py-2 w-80 group-focus-within:ring-2 ring-brand-gold/30 transition-luxury ${searchQuery.length > 0 ? 'bg-white/5' : ''}`}>
                                <SearchIcon className="h-5 w-5 text-gray-500 group-focus-within:text-brand-gold transition-colors"/>
                                <input 
                                    type="text" 
                                    placeholder="Search command center..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length > 1 && setIsSearchOpen(true)}
                                    className="ml-3 bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none w-full"
                                />
                            </div>
                             {isSearchOpen && searchResults.length > 0 && (
                                <div className="absolute top-full right-0 mt-4 w-96 glass-card rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-2">Search Results</div>
                                    <ul className="space-y-1">
                                        {searchResults.map(result => (
                                            <li key={`${result.type}-${result.id}`}>
                                                <button onClick={() => handleSearchClick(result.section as AdminSection)} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-brand-gold/10 hover:text-brand-gold transition-luxury group">
                                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-gold/10">
                                                        <result.icon className="h-5 w-5 text-gray-400 group-hover:text-brand-gold" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors truncate">{result.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-1">{result.type}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button onClick={handleNotificationToggle} className="p-3 glass-panel rounded-xl hover:bg-white/10 transition-luxury relative group">
                                <BellIcon className="h-5 w-5 text-gray-400 group-hover:text-brand-gold transition-colors"/>
                                {hasUnread && (
                                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-brand-gold border-2 border-brand-charcoal animate-pulse"></span>
                                )}
                            </button>
                             {isNotificationOpen && (
                                <div className="absolute top-full right-0 mt-4 w-96 glass-card rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 font-serif text-xl font-bold border-b border-white/5 flex justify-between items-center">
                                        <span>Notifications</span>
                                        {notifications.length > 0 && (
                                            <button onClick={clearNotifications} className="text-xs font-bold text-brand-gold hover:text-yellow-600 tracking-widest uppercase">Clear</button>
                                        )}
                                    </div>
                                    {notifications.length > 0 ? (
                                        <ul className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                            {notifications.map(notification => {
                                                const Icon = notificationIcons[notification.type];
                                                return (
                                                    <li key={notification.id} className="mb-1">
                                                        <button onClick={() => handleNotificationClick(notification)} className={`w-full text-left flex items-start gap-4 p-4 rounded-xl transition-luxury ${!notification.isRead ? 'bg-brand-gold/5 border-l-2 border-brand-gold' : 'hover:bg-white/5'}`}>
                                                            <div className={`p-2 rounded-lg ${!notification.isRead ? 'bg-brand-gold/20' : 'bg-white/5'}`}>
                                                                <Icon className={`h-5 w-5 ${!notification.isRead ? 'text-brand-gold' : 'text-gray-500'}`}/>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-sm ${!notification.isRead ? 'text-white font-bold' : 'text-gray-400'}`}>{notification.message}</p>
                                                                <p className="text-[10px] text-gray-500 mt-2 font-medium">{timeSince(notification.timestamp)}</p>
                                                            </div>
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <BellIcon className="h-10 w-10 text-gray-800 mx-auto mb-4" />
                                            <p className="text-sm text-gray-500">Everything is up to date.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center gap-4 p-1 pl-4 glass-panel rounded-2xl hover:bg-white/10 transition-luxury group">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors">{user?.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-none mt-1">{user?.role}</p>
                                </div>
                                <div className="h-10 w-10 bg-gradient-gold p-0.5 rounded-xl glow-gold group-hover:scale-105 transition-luxury">
                                    <div className="w-full h-full bg-brand-charcoal rounded-[10px] flex items-center justify-center text-white font-bold overflow-hidden">
                                        {user?.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </button>
                             {isProfileOpen && (
                                <div className="absolute top-full right-0 mt-4 w-64 glass-card rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/5 bg-white/5 mb-2">
                                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate mt-1">{user?.email}</p>
                                    </div>
                                    <button className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-400 hover:text-brand-gold hover:bg-white/5 transition-luxury group">
                                        <UserCircleIcon className="h-5 w-5 text-gray-600 group-hover:text-brand-gold"/>
                                        System Profile
                                    </button>
                                     <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-luxury group">
                                        <ArrowRightOnRectangleIcon className="h-5 w-5 opacity-50 group-hover:opacity-100"/>
                                        Terminate Session
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-1000">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
