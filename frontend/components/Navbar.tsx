
import React, { useState, useEffect } from 'react';
import { Page, NavLink } from '../types';
import { useCart } from '../hooks/useCart';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { UserIcon, ShoppingBagIcon, SunIcon, MoonIcon, ChevronDownIcon, CloseIcon, ChevronRightIcon, ChevronLeftIcon } from './icons';
import { AnimatedHamburgerIcon } from './AnimatedHamburgerIcon';

interface NavbarProps {
  navigateTo: (page: Page, filters?: { category?: string; subCategory?: string }) => void;
  navLinks: NavLink[];
  currentPage?: Page;
}

export const Navbar: React.FC<NavbarProps> = ({ navigateTo, navLinks, currentPage = 'home' }) => {
  const { state: cartState } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const cartItemCount = cartState.items.reduce((acc, item) => acc + item.quantity, 0);
  
  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        setScrolled(currentScrollY > 20);
        
        // Detect scroll direction
        if (currentScrollY > lastScrollY) {
            setScrollDirection('down');
        } else {
            setScrollDirection('up');
        }
        setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const toggleMobileMenu = () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);
    if (!nextState) {
      setTimeout(() => {
          setActiveMegaMenu(null);
      }, 300);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigateTo('home');
  }

  const activeMenuData = navLinks.find(link => link.name === activeMegaMenu);

  const navClass = `fixed top-0 w-full z-40 transition-all duration-300 ease-out ${
      scrolled 
      ? 'bg-white/90 dark:bg-brand-charcoal/90 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700' 
      : 'bg-transparent backdrop-blur-none'
  }`;
  
  const textColorClass = 'text-brand-charcoal dark:text-brand-cream';

  return (
    <header className="relative z-50">
      <nav className={navClass}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigateTo('home')} className={`font-serif text-2xl font-bold tracking-widest uppercase transition-all duration-500 ${textColorClass}`}>
                ezooze
              </button>
            </div>
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <div key={link.id} className="relative group">
                      <button
                        onClick={() => navigateTo(link.page, link.filters)}
                        className={`${textColorClass} hover:text-brand-gold dark:hover:text-brand-gold px-1 py-2 text-sm font-medium tracking-widest uppercase transition-all duration-500 flex items-center relative`}
                      >
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-400 group-hover:w-full ease-out"></span>
                      </button>
                      
                      {link.children && (
                        link.isMega ? (() => {
                            if (!link.children) return null;
                            const half = Math.ceil(link.children.length / 2);
                            const firstHalf = link.children.slice(0, half);
                            const secondHalf = link.children.slice(half);
                            return (
                                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-screen max-w-2xl rounded-lg shadow-2xl bg-white/95 dark:bg-brand-surface/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 ease-out origin-top">
                                    <div className="grid grid-cols-2 gap-12 p-10">
                                        <div className="space-y-0">
                                            <button onClick={() => navigateTo(link.page, link.filters)} className="font-serif text-lg font-bold text-brand-charcoal dark:text-brand-cream hover:text-brand-gold transition-all duration-300 mb-4 block border-b-2 border-transparent hover:border-brand-gold pb-2 w-full text-left">All {link.name}</button>
                                            <ul className="space-y-3">
                                                {firstHalf.map(child => (
                                                    <li key={child.id} className="transform transition-all duration-300 hover:translate-x-1">
                                                        <button
                                                            onClick={() => navigateTo('shop', child.filters)}
                                                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-gold dark:hover:text-brand-gold transition-all duration-300 text-left w-full"
                                                        >
                                                            {child.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-0">
                                            <p className="font-serif text-lg font-bold text-transparent mb-4 block border-b-2 border-transparent pb-2 select-none">.</p>
                                            <ul className="space-y-3">
                                                {secondHalf.map(child => (
                                                    <li key={child.id} className="transform transition-all duration-300 hover:translate-x-1">
                                                        <button
                                                            onClick={() => navigateTo('shop', child.filters)}
                                                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-gold dark:hover:text-brand-gold transition-all duration-300 text-left w-full"
                                                        >
                                                            {child.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div className="absolute left-0 mt-2 w-56 rounded-lg shadow-xl bg-white/95 dark:bg-brand-charcoal/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 transform group-hover:translate-y-0 group-focus-within:translate-y-0 translate-y-2 origin-top-left">
                                <div className="py-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    {link.children.map((child, index) => (
                                        <button
                                            key={child.id}
                                            onClick={() => navigateTo('shop', child.filters)}
                                            className="block w-full text-left px-6 py-3 text-sm text-brand-charcoal dark:text-brand-cream hover:bg-gradient-to-r hover:from-transparent hover:to-brand-gold/5 dark:hover:to-brand-gold/10 transition-all duration-300 hover:text-brand-gold hover:translate-x-1 transform"
                                            role="menuitem"
                                            style={{
                                              transitionDelay: `${index * 30}ms`
                                            }}
                                        >
                                            {child.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                      )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden lg:flex items-center space-x-6">
                  <button onClick={toggleTheme} aria-label="Toggle theme" className={`p-2.5 rounded-full ${textColorClass} hover:text-brand-gold dark:hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-brand-surface/50 focus:outline-none transition-all duration-300 transform hover:scale-110`}>
                      {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                  </button>
                  <div className="relative group">
                      <button aria-label={isAuthenticated ? "User account" : "Login"} onClick={() => !isAuthenticated && navigateTo('login')} className={`p-2.5 rounded-full ${textColorClass} hover:text-brand-gold dark:hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-brand-surface/50 focus:outline-none transition-all duration-300 transform hover:scale-110`}>
                          <UserIcon className="h-5 w-5" />
                      </button>
                      {isAuthenticated && (
                           <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-2xl bg-white dark:bg-brand-charcoal ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 transform group-hover:translate-y-0 group-focus-within:translate-y-0 translate-y-2 origin-top-right">
                              <div className="py-2" role="menu" aria-orientation="vertical">
                                  <div className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-brand-gold/5 to-transparent dark:from-brand-gold/10">
                                      <p className="font-bold text-brand-charcoal dark:text-brand-cream">{user?.name}</p>
                                      <p className="truncate text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                                  </div>
                                  {user?.role === 'admin' && (
                                    <button
                                        onClick={() => navigateTo('admin')}
                                        className="block w-full text-left px-4 py-3 text-sm text-brand-charcoal dark:text-brand-cream hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 hover:text-brand-gold transition-all duration-300 hover:translate-x-1 transform"
                                        role="menuitem"
                                    >
                                        Admin Panel
                                    </button>
                                  )}
                                  <button
                                      onClick={handleLogout}
                                      className="block w-full text-left px-4 py-3 text-sm text-brand-charcoal dark:text-brand-cream hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 hover:text-brand-gold transition-all duration-300 hover:translate-x-1 transform"
                                      role="menuitem"
                                  >
                                      Logout
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
                  <button
                      onClick={() => navigateTo('cart')}
                      aria-label={`View shopping cart, ${cartItemCount} items`}
                      className={`relative p-2.5 rounded-full ${textColorClass} hover:text-brand-gold dark:hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-brand-surface/50 focus:outline-none transition-all duration-300 transform hover:scale-110`}
                  >
                      <ShoppingBagIcon className="h-5 w-5" />
                      {cartItemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-brand-gold rounded-full shadow-md animate-pulse">
                          {cartItemCount}
                      </span>
                      )}
                  </button>
              </div>
              <div className="lg:hidden flex items-center">
                   <button
                      onClick={() => navigateTo('cart')}
                      aria-label={`View shopping cart, ${cartItemCount} items`}
                      className={`relative p-2 mr-2 rounded-full ${textColorClass} hover:text-brand-gold focus:outline-none transition-colors`}
                  >
                      <ShoppingBagIcon className="h-6 w-6" />
                      {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-brand-gold rounded-full">
                          {cartItemCount}
                      </span>
                      )}
                  </button>
                  <AnimatedHamburgerIcon 
                      isOpen={isMenuOpen} 
                      onClick={toggleMobileMenu} 
                      className={`${textColorClass} hover:text-brand-gold transition-colors`}
                  />
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-500" onClick={toggleMobileMenu} aria-hidden="true"></div>
          
          <div className={`relative flex flex-col w-full max-w-xs h-full bg-white dark:bg-brand-charcoal shadow-2xl transition-all duration-500 ease-out ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-brand-gold/5 to-transparent dark:from-brand-gold/10">
                  <h2 className="font-serif text-2xl font-bold tracking-wide text-brand-charcoal dark:text-brand-cream">Menu</h2>
                  <button onClick={toggleMobileMenu} className="p-2 -mr-2 text-gray-500 hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-brand-surface rounded-lg transition-all duration-300">
                      <CloseIcon className="h-6 w-6"/>
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                  {/* Level 1: Main Menu */}
                  <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeMegaMenu ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
                      <ul className="py-2">
                          {navLinks.map((link, index) => (
                              <li key={link.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 transition-all duration-300" style={{
                                transitionDelay: isMenuOpen ? `${index * 40}ms` : '0'
                              }}>
                                  <button
                                      onClick={() => {
                                          if (link.children) {
                                              setActiveMegaMenu(link.name);
                                          } else {
                                              navigateTo(link.page, link.filters);
                                              toggleMobileMenu();
                                          }
                                      }}
                                      className="w-full flex justify-between items-center py-5 px-6 text-left text-lg font-medium text-brand-charcoal dark:text-brand-cream hover:bg-gradient-to-r hover:from-brand-gold/10 hover:to-transparent dark:hover:from-brand-gold/10 hover:text-brand-gold transition-all duration-300 hover:translate-x-2 transform"
                                  >
                                      <span>{link.name}</span>
                                      {link.children && <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-brand-gold transition-colors" />}
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Level 2: Sub-menu */}
                  <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeMegaMenu ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
                      {activeMenuData && (
                          <div className="bg-gray-50 dark:bg-brand-surface h-full">
                              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-brand-charcoal">
                                  <button onClick={() => setActiveMegaMenu(null)} className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-brand-surface/50 rounded-lg px-3 py-2 transition-all duration-300 mb-4">
                                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                                      Back
                                  </button>
                                  <h3 className="font-serif text-3xl font-bold text-brand-charcoal dark:text-brand-cream">{activeMenuData.name}</h3>
                              </div>
                              <div className="py-2">
                                  <ul>
                                      <li className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                                          <button onClick={() => { navigateTo(activeMenuData.page, activeMenuData.filters); toggleMobileMenu(); }} className="w-full py-4 px-6 text-left font-bold text-brand-charcoal dark:text-brand-cream hover:bg-gradient-to-r hover:from-brand-gold/10 hover:to-transparent dark:hover:from-brand-gold/10 hover:text-brand-gold transition-all duration-300 hover:translate-x-2 transform">
                                              View All {activeMenuData.name}
                                          </button>
                                      </li>
                                      {activeMenuData.children?.map((child, index) => (
                                          <li key={child.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 transition-all duration-300" style={{
                                            transitionDelay: `${index * 30}ms`
                                          }}>
                                              <button onClick={() => { navigateTo('shop', child.filters); toggleMobileMenu(); }} className="w-full py-4 px-6 text-left text-gray-600 dark:text-gray-300 hover:text-brand-gold hover:bg-gradient-to-r hover:from-brand-gold/10 hover:to-transparent dark:hover:from-brand-gold/10 transition-all duration-300 hover:translate-x-2 transform">
                                                  {child.name}
                                              </button>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Footer: Auth & Theme */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-r from-brand-gold/5 to-transparent dark:from-brand-gold/10">
                  <div className="flex items-center justify-between gap-4">
                      {isAuthenticated ? (
                          <div className="flex-1">
                              <div className="flex items-center mb-4 gap-3">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                                      {user?.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="overflow-hidden flex-1">
                                      <p className="font-medium truncate text-brand-charcoal dark:text-brand-cream">{user?.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                  </div>
                              </div>
                              {user?.role === 'admin' && (
                                <button onClick={() => { navigateTo('admin'); toggleMobileMenu(); }} className="block w-full text-left py-2 text-sm font-medium text-brand-gold hover:text-yellow-600 hover:translate-x-1 transition-all duration-300 transform">Admin Panel</button>
                              )}
                              <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="block w-full text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-charcoal dark:hover:text-white hover:translate-x-1 transition-all duration-300 transform">Sign Out</button>
                          </div>
                      ) : (
                          <button onClick={() => { navigateTo('login'); toggleMobileMenu(); }} className="flex items-center px-4 py-3 font-bold text-white bg-brand-gold hover:bg-yellow-600 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                              <UserIcon className="h-5 w-5 mr-2" />
                              <span>Sign In</span>
                          </button>
                      )}
                      <button onClick={toggleTheme} aria-label="Toggle theme" className="p-3 rounded-full bg-white dark:bg-brand-charcoal shadow-sm hover:shadow-md transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-brand-gold dark:hover:text-brand-gold hover:scale-110 transform">
                          {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </header>
  );
};
