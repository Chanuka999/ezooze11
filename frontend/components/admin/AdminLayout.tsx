
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
        <div className="flex h-screen bg-gray-100 dark:bg-brand-surface text-gray-800 dark:text-gray-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-brand-charcoal flex-shrink-0 flex flex-col justify-between border-r border-gray-200 dark:border-brand-border">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-brand-border">
                        <h1 className="text-xl font-serif font-semibold cursor-pointer" onClick={() => setActiveSection('dashboard')}>ezooze Admin</h1>
                    </div>
                    <nav className="mt-4 px-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as AdminSection)}
                                className={`w-full flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    activeSection === item.id 
                                    ? 'bg-brand-gold/20 text-brand-gold' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-brand-border">
                     <button
                        onClick={() => navigateTo('home')}
                        className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-3" />
                        <span>View Store</span>
                    </button>
                </div>
            </aside>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-brand-charcoal border-b border-gray-200 dark:border-brand-border flex items-center justify-between px-6 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold capitalize">{activeItem?.name}</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative" ref={searchRef}>
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="Search products, orders, customers..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 1 && setIsSearchOpen(true)}
                                className="pl-10 pr-4 py-2 w-72 text-sm bg-gray-100 dark:bg-brand-surface rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                             {isSearchOpen && searchResults.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-brand-charcoal rounded-md shadow-lg border dark:border-brand-border z-50">
                                    <ul className="py-1">
                                        {searchResults.map(result => (
                                            <li key={`${result.type}-${result.id}`}>
                                                <button onClick={() => handleSearchClick(result.section as AdminSection)} className="w-full text-left flex items-center px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-brand-surface">
                                                    <result.icon className="h-5 w-5 mr-3 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{result.name}</p>
                                                        <p className="text-xs text-gray-500">{result.type}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={notificationRef}>
                            <button onClick={handleNotificationToggle} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-brand-surface">
                                <BellIcon className="h-6 w-6 text-gray-500 dark:text-gray-400"/>
                                {hasUnread && <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-brand-charcoal"></span>}
                            </button>
                             {isNotificationOpen && (
                                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-brand-charcoal rounded-md shadow-lg border dark:border-brand-border z-50 animate-fadeIn">
                                    <div className="p-3 font-semibold border-b dark:border-brand-border flex justify-between items-center">
                                        <span>Notifications</span>
                                        {notifications.length > 0 && <button onClick={clearNotifications} className="text-xs font-medium text-brand-gold hover:underline">Clear All</button>}
                                    </div>
                                    {notifications.length > 0 ? (
                                        <ul className="max-h-96 overflow-y-auto">
                                            {notifications.map(notification => {
                                                const Icon = notificationIcons[notification.type];
                                                return (
                                                    <li key={notification.id} className={`border-b dark:border-brand-border last:border-b-0 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                                        <button onClick={() => handleNotificationClick(notification)} className="w-full text-left flex items-start p-3 hover:bg-gray-100 dark:hover:bg-brand-surface">
                                                            <Icon className="h-5 w-5 mr-3 mt-0.5 text-gray-400 flex-shrink-0"/>
                                                            <div>
                                                                <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{timeSince(notification.timestamp)}</p>
                                                            </div>
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 p-4 text-center">No new notifications.</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <button onClick={() => setActiveSection('settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-brand-surface"><Cog6ToothIcon className="h-6 w-6 text-gray-500 dark:text-gray-400"/></button>
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center space-x-3 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-brand-surface">
                                <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <UserCircleIcon className="h-8 w-8 text-gray-400"/>
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                            </button>
                             {isProfileOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-brand-charcoal rounded-md shadow-lg border dark:border-brand-border py-1 z-50">
                                    <div className="px-4 py-2 border-b dark:border-brand-border">
                                        <p className="text-sm font-medium truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                    <button className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-brand-surface">
                                        <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400"/>
                                        Your Profile
                                    </button>
                                     <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-brand-surface text-red-600 dark:text-red-400">
                                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2"/>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-8xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
