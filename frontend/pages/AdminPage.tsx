
import React, { useState, useEffect, useRef } from 'react';
import { Product, AdminSection, HomePageContent, AboutPageContent, StoreSettings, Page, Order, User, DiscountCode, ProductAttributes, NavLink, CareersPageContent, PressPageContent, FAQPageContent, PrivacyPolicyPageContent, TermsOfServicePageContent } from '../types';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminCustomers } from '../components/admin/AdminCustomers';
import { AdminContent } from '../components/admin/AdminContent';
import { AdminHomepage } from '../components/admin/AdminHomepage';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminOrders } from '../components/admin/AdminOrders';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { NotificationContainer } from '../components/Notification';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
import { AdminDiscounts } from '../components/admin/AdminDiscounts';
import { AdminAttributes } from '../components/admin/AdminAttributes';
import { AdminUserManagement } from '../components/admin/AdminUserManagement';
import { AdminNavigation } from '../components/admin/AdminNavigation';
import { useNotificationCenter } from '../hooks/useNotificationCenter';

interface AdminPageProps {
    navigateTo: (page: Page, filters?: { category?: string; subCategory?: string }) => void;
    viewProductOnSite: (product: Product) => void;
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    users: User[];
    onUpdateUser: (user: Partial<User> & {id: string}) => Promise<void>;
    discountCodes: DiscountCode[];
    setDiscountCodes: React.Dispatch<React.SetStateAction<DiscountCode[]>>;
    productAttributes: ProductAttributes;
    setProductAttributes: React.Dispatch<React.SetStateAction<ProductAttributes>>;
    navLinks: NavLink[];
    setNavLinks: React.Dispatch<React.SetStateAction<NavLink[]>>;
    homeContent: HomePageContent;
    setHomeContent: React.Dispatch<React.SetStateAction<HomePageContent>>;
    aboutContent: AboutPageContent;
    setAboutContent: React.Dispatch<React.SetStateAction<AboutPageContent>>;
    careersContent: CareersPageContent;
    setCareersContent: React.Dispatch<React.SetStateAction<CareersPageContent>>;
    pressContent: PressPageContent;
    setPressContent: React.Dispatch<React.SetStateAction<PressPageContent>>;
    faqContent: FAQPageContent;
    setFaqContent: React.Dispatch<React.SetStateAction<FAQPageContent>>;
    privacyPolicyContent: PrivacyPolicyPageContent;
    setPrivacyPolicyContent: React.Dispatch<React.SetStateAction<PrivacyPolicyPageContent>>;
    termsContent: TermsOfServicePageContent;
    setTermsContent: React.Dispatch<React.SetStateAction<TermsOfServicePageContent>>;
    storeSettings: StoreSettings;
    setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  // FIX: The useEffect hook was missing a dependency array. This caused it to run on every render. Adding `value` to the dependency array ensures the effect only runs when the value changes, which is the correct behavior for this hook.
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}


export const AdminPage: React.FC<AdminPageProps> = ({
    navigateTo, viewProductOnSite, products, setProducts, orders, setOrders, users, onUpdateUser, discountCodes, setDiscountCodes, productAttributes, setProductAttributes, navLinks, setNavLinks,
    homeContent, setHomeContent, aboutContent, setAboutContent, careersContent, setCareersContent, pressContent, setPressContent, faqContent, setFaqContent, privacyPolicyContent, setPrivacyPolicyContent, termsContent, setTermsContent, storeSettings, setStoreSettings
}) => {
    const { user, isAuthenticated } = useAuth();
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
    const { notifications, addNotification, removeNotification } = useNotification();
    const { notifications: adminNotifications, hasUnread, addNotification: addAdminNotification, markAllAsRead, clearNotifications } = useNotificationCenter();
    
    // Track previous state for generating notifications
    const prevOrders = usePrevious(orders);
    const prevProducts = usePrevious(products);
    const prevUsers = usePrevious(users);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigateTo('home');
        }
    }, [isAuthenticated, user, navigateTo]);
    
    // Effect to create notifications for new orders
    useEffect(() => {
        if (prevOrders && orders.length > prevOrders.length) {
            const newOrder = orders[0];
            addAdminNotification('order', `New Order #${newOrder.id} from ${newOrder.customerName}`, { section: 'orders' });
        }
    }, [orders, prevOrders, addAdminNotification]);

    // Effect to create notifications for low stock
    useEffect(() => {
        if (prevProducts && products) {
            products.forEach(product => {
                const prevProduct = prevProducts.find(p => p.id === product.id);
                if (prevProduct && prevProduct.stock > 5 && product.stock <= 5 && product.stock > 0) {
                     addAdminNotification('stock', `${product.name} is low on stock (${product.stock} left).`, { section: 'products' });
                }
            });
        }
    }, [products, prevProducts, addAdminNotification]);
    
    // Effect to create notifications for new customers
    useEffect(() => {
        if (prevUsers && users.length > prevUsers.length) {
            const newUsers = users.filter(u => !prevUsers.some(pu => pu.id === u.id));
            newUsers.forEach(newUser => {
                if (newUser.role !== 'admin') {
                    addAdminNotification('customer', `New customer signed up: ${newUser.name}.`, { section: 'customers' });
                }
            });
        }
    }, [users, prevUsers, addAdminNotification]);


    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return <AdminDashboard products={products} setActiveSection={setActiveSection} />;
            case 'analytics':
                return <AdminAnalytics orders={orders} products={products} viewProductOnSite={viewProductOnSite} setActiveSection={setActiveSection} />;
            case 'products':
                return <AdminProducts products={products} setProducts={setProducts} addNotification={addNotification} productAttributes={productAttributes} />;
            case 'orders':
                return <AdminOrders orders={orders} setOrders={setOrders} addNotification={addNotification} setActiveSection={setActiveSection} />;
            case 'customers':
                return <AdminCustomers users={users} />;
            case 'discounts':
                return <AdminDiscounts discountCodes={discountCodes} setDiscountCodes={setDiscountCodes} addNotification={addNotification} />;
            case 'attributes':
                return <AdminAttributes attributes={productAttributes} setAttributes={setProductAttributes} addNotification={addNotification} />;
            case 'navigation':
                return <AdminNavigation navLinks={navLinks} setNavLinks={setNavLinks} addNotification={addNotification} />;
            case 'userManagement':
                return <AdminUserManagement users={users} onUpdateUser={onUpdateUser} addNotification={addNotification} currentUser={user}/>;
            case 'content':
                return <AdminContent 
                    aboutContent={aboutContent} setAboutContent={setAboutContent}
                    careersContent={careersContent} setCareersContent={setCareersContent}
                    pressContent={pressContent} setPressContent={setPressContent}
                    faqContent={faqContent} setFaqContent={setFaqContent}
                    privacyPolicyContent={privacyPolicyContent} setPrivacyPolicyContent={setPrivacyPolicyContent}
                    termsContent={termsContent} setTermsContent={setTermsContent}
                    addNotification={addNotification}
                 />;
            case 'homepageSettings':
                return <AdminHomepage homeContent={homeContent} setHomeContent={setHomeContent} />;
            case 'settings':
                return <AdminSettings 
                    settings={storeSettings} 
                    setSettings={setStoreSettings} 
                    addNotification={addNotification} 
                    currentUser={user}
                    onUpdateUser={onUpdateUser}
                />;
            default:
                return <AdminDashboard products={products} setActiveSection={setActiveSection} />;
        }
    }

    return (
        <>
            <NotificationContainer notifications={notifications} onClose={removeNotification} />
            <AdminLayout
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                navigateTo={navigateTo}
                products={products}
                orders={orders}
                users={users}
                notifications={adminNotifications}
                hasUnread={hasUnread}
                markAllAsRead={markAllAsRead}
                clearNotifications={clearNotifications}
            >
                {renderSection()}
            </AdminLayout>
        </>
    );
};
