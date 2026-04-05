

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string | number;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
  category: 'men' | 'women' | 'unisex' | 'sportswear';
  subCategory: string;
  imageUrls: string[];
  sizes: string[];
  colors: string[];
  material: string;
  featured: boolean;
  stock: number; // Total stock fallback or sum
  variants?: ProductVariant[];
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type OrderStatus = 'Confirmed' | 'Processing' | 'Packing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Refunded';

export interface UserOrder {
    id: string;
    date: string;
    status: OrderStatus;
    total: number;
}

export interface User {
    id: string;
    email: string;
    name: string;
    password?: string;
    role?: 'admin' | 'user';
    status?: 'Active' | 'Inactive';
    createdAt?: string;
    lastSeen?: string;
    address?: UserAddress;
    orders?: UserOrder[];
}

export type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'login' | 'register' | 'forgotPassword' | 'about' | 'careers' | 'press' | 'contact' | 'faq' | 'shipping' | 'privacy' | 'terms' | 'admin' | 'orderTracking';

// Types for Admin Panel Content Management
export interface HeroSlide {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  filters: { category?: string; subCategory?: string };
}

export interface MidBannerContent {
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
}

export interface CategoryShowcaseItem {
  title: string;
  imageUrl: string;
  filters: { category?: string; subCategory?: string };
}

export interface HomePageContent {
  heroSlides: HeroSlide[];
  midBanner: MidBannerContent;
  categoryShowcase: CategoryShowcaseItem[];
}

export interface AboutPageContent {
  story: string;
}

export interface JobOpening {
    id: string;
    title: string;
    location: string;
    department: string;
}
export type CareersPageContent = JobOpening[];

export interface PressFeature {
    id: string;
    publication: string;
    title: string;
    date: string;
    link: string;
}
export type PressPageContent = PressFeature[];

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}
export type FAQPageContent = FAQItem[];

export interface PolicySectionContent {
    id: string;
    title: string;
    content: string;
}
export interface PrivacyPolicyPageContent {
    sections: PolicySectionContent[];
}
export interface TermsOfServicePageContent {
    sections: PolicySectionContent[];
}


// Store Settings
export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  address: string;
  currency: 'LKR' | 'USD' | 'EUR';
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    pinterest: string;
  };
  standardShippingCost: number;
  freeShippingThreshold: number;
  isFreeShippingThresholdActive: boolean;
  taxRate?: number;
  paymentMethods: {
    creditCard: boolean;
    payOnDelivery: boolean;
  };
}

export interface OrderStatusHistory {
    status: OrderStatus;
    timestamp: string;
    note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: OrderStatus;
  statusHistory?: OrderStatusHistory[];
  items: CartItem[];
  shippingAddress: UserAddress;
  subtotal: number;
  shipping: number;
  discount?: number;
  tax?: number;
  total: number;
  trackingNumber?: string;
  trackingCarrier?: 'UPS' | 'FedEx' | 'DHL' | 'Other';
}

export interface DiscountCode {
    id: number;
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    isActive: boolean;
    minimumPurchase?: number;
    usageLimit?: number;
    uses?: number;
    expiresAt?: string;
}

export interface ProductAttributes {
  subCategories: string[];
  colors: string[];
  materials: string[];
  sizes: string[];
}

export interface ContactMessage {
    id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt?: string;
}


// Types for Admin Panel Navigation
export type AdminSection = 'dashboard' | 'products' | 'orders' | 'customers' | 'discounts' | 'attributes' | 'navigation' | 'userManagement' | 'content' | 'homepageSettings' | 'settings' | 'analytics';

// Types for site navigation
export interface NavLinkFilter {
    category?: string;
    subCategory?: string;
}

export interface NavLinkChild {
    id: string;
    name: string;
    filters: NavLinkFilter;
}

export interface NavLinkFeaturedLink {
    page: Page;
    filters: NavLinkFilter;
}

export interface NavLink {
    id: string;
    name: string;
    page: Page;
    filters?: NavLinkFilter;
    isMega?: boolean;
    featuredImage?: string;
    featuredTitle?: string;
    featuredLink?: NavLinkFeaturedLink;
    children?: NavLinkChild[];
}

// Types for Admin Panel Notification Center
export interface Notification {
    id: string;
    type: 'order' | 'stock' | 'customer';
    message: string;
    isRead: boolean;
    timestamp: string;
    link: { section: AdminSection };
}