
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { Page, Product, HomePageContent, AboutPageContent, StoreSettings, Order, User, DiscountCode, ProductAttributes, NavLink, CareersPageContent, PressPageContent, FAQPageContent, PrivacyPolicyPageContent, TermsOfServicePageContent } from './types';
import { AboutPage } from './pages/AboutPage';
import { CareersPage } from './pages/CareersPage';
import { PressPage } from './pages/PressPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { ShippingReturnsPage } from './pages/ShippingReturnsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { SpinnerIcon } from './components/icons';
import { AdminPage } from './pages/AdminPage';
import useLocalStorage from './hooks/useLocalStorage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { api } from './api';
import { useNotificationCenter } from './hooks/useNotificationCenter';
import { logger } from './utils/logger';

// Mock Data with Variants Logic
const MOCK_PRODUCTS: Product[] = [
  // Women
  { 
      id: 1, 
      name: 'Classic Wool Trench Coat', 
      price: 75000, 
      discountPrice: 68500, 
      description: 'A timeless trench coat made from premium Italian wool. Perfect for any occasion.', 
      category: 'women', 
      subCategory: 'coats', 
      imageUrls: ['https://picsum.photos/seed/p1/800/1000', 'https://picsum.photos/seed/p1-2/800/1000', 'https://picsum.photos/seed/p1-3/800/1000'], 
      sizes: ['S', 'M', 'L'], 
      colors: ['Beige', 'Black'], 
      material: 'Wool', 
      featured: true, 
      stock: 15,
      variants: [
          { size: 'S', color: 'Beige', stock: 5 },
          { size: 'M', color: 'Beige', stock: 0 }, // Out of stock variant
          { size: 'L', color: 'Beige', stock: 3 },
          { size: 'S', color: 'Black', stock: 2 },
          { size: 'M', color: 'Black', stock: 5 },
          { size: 'L', color: 'Black', stock: 0 }  // Out of stock variant
      ],
      createdAt: new Date('2024-05-20T10:00:00Z').toISOString() 
  },
  { id: 3, name: 'Silk Slip Dress', price: 54000, description: 'An elegant slip dress crafted from pure mulberry silk, with a flattering bias cut.', category: 'women', subCategory: 'dresses', imageUrls: ['https://picsum.photos/seed/p3/800/1000', 'https://picsum.photos/seed/p3-2/800/1000'], sizes: ['XS', 'S', 'M'], colors: ['Champagne', 'Navy'], material: 'Silk', featured: true, stock: 8, createdAt: new Date('2024-05-18T11:30:00Z').toISOString() },
  { id: 5, name: 'Cashmere Crewneck Sweater', price: 66000, discountPrice: 59000, description: 'Incredibly soft and warm, this 100% cashmere sweater is a wardrobe staple.', category: 'women', subCategory: 'sweaters', imageUrls: ['https://picsum.photos/seed/p5/800/1000'], sizes: ['S', 'M', 'L'], colors: ['HeatherGray', 'Camel'], material: 'Cashmere', featured: false, stock: 25, createdAt: new Date('2024-05-15T09:00:00Z').toISOString() },
  { id: 7, name: 'High-Waisted Trousers', price: 45000, description: 'Tailored trousers with a high waist and wide leg for a sophisticated silhouette.', category: 'women', subCategory: 'pants', imageUrls: ['https://picsum.photos/seed/p7/800/1000'], sizes: ['2', '4', '6', '8'], colors: ['Black', 'Cream'], material: 'Wool Blend', featured: false, stock: 4, createdAt: new Date('2024-05-22T14:00:00Z').toISOString() },
  { id: 9, name: 'Tailored Single-Button Blazer', price: 84000, description: 'A sharp, single-button blazer in a virgin wool blend, perfect for power dressing.', category: 'women', subCategory: 'blazers', imageUrls: ['https://picsum.photos/seed/p9/800/1000'], sizes: ['2', '4', '6', '8'], colors: ['Navy', 'White'], material: 'Virgin Wool', featured: true, stock: 12, createdAt: new Date('2024-05-25T16:20:00Z').toISOString() },
  { id: 11, name: 'Structured Leather Tote', price: 105000, description: 'A spacious and elegant tote bag crafted from Italian pebbled leather, with room for all your essentials.', category: 'women', subCategory: 'accessories', imageUrls: ['https://picsum.photos/seed/p11/800/1000'], sizes: ['One Size'], colors: ['Black', 'Cognac'], material: 'Leather', featured: false, stock: 0, createdAt: new Date('2024-04-30T10:00:00Z').toISOString() },
  { id: 13, name: 'Women\'s Cotton T-Shirt', price: 13500, description: 'A classic cotton t-shirt for everyday wear.', category: 'women', subCategory: 't-shirts', imageUrls: ['https://picsum.photos/seed/p13/800/1000'], sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Pink'], material: 'Cotton', featured: false, stock: 50, createdAt: new Date('2024-05-02T10:00:00Z').toISOString() },
  { id: 14, name: 'Ribbed Crop Top', price: 16500, description: 'A trendy ribbed crop top.', category: 'women', subCategory: 'crop-tops', imageUrls: ['https://picsum.photos/seed/p14/800/1000'], sizes: ['XS', 'S', 'M'], colors: ['White', 'Black'], material: 'Cotton', featured: false, stock: 30, createdAt: new Date('2024-05-19T13:00:00Z').toISOString() },
  { id: 15, name: 'A-Line Denim Skirt', price: 25500, description: 'A versatile A-line denim skirt.', category: 'women', subCategory: 'skirts', imageUrls: ['https://picsum.photos/seed/p15/800/1000'], sizes: ['2', '4', '6', '8'], colors: ['Blue', 'Black'], material: 'Denim', featured: false, stock: 22, createdAt: new Date('2024-05-11T10:00:00Z').toISOString() },
  
  // Men
  { id: 2, name: 'Linen Button-Up Shirt', price: 28500, description: 'Lightweight and breathable, this linen shirt is a summer essential.', category: 'men', subCategory: 'shirts', imageUrls: ['https://picsum.photos/seed/p2/800/1000', 'https://picsum.photos/seed/p2-2/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'SkyBlue'], material: 'Linen', featured: true, stock: 18, createdAt: new Date('2024-05-24T12:00:00Z').toISOString() },
  { id: 4, name: 'Slim-Fit Chinos', price: 33000, discountPrice: 29500, description: 'Versatile chinos with a modern slim fit, made from comfortable stretch cotton.', category: 'men', subCategory: 'pants', imageUrls: ['https://picsum.photos/seed/p4/800/1000'], sizes: ['30', '32', '34', '36'], colors: ['Khaki', 'Olive'], material: 'Cotton', featured: true, stock: 2, createdAt: new Date('2024-05-23T11:00:00Z').toISOString() },
  { id: 6, name: 'Leather Derby Shoes', price: 90000, description: 'Handcrafted from full-grain leather, these Derby shoes offer classic style and durability.', category: 'men', subCategory: 'shoes', imageUrls: ['https://picsum.photos/seed/p6/800/1000'], sizes: ['9', '10', '11', '12'], colors: ['Brown', 'Black'], material: 'Leather', featured: false, stock: 10, createdAt: new Date('2024-05-05T10:00:00Z').toISOString() },
  { id: 8, name: 'Denim Work Jacket', price: 52500, description: 'A rugged yet refined work jacket made from premium Japanese selvedge denim.', category: 'men', subCategory: 'jackets', imageUrls: ['https://picsum.photos/seed/p8/800/1000'], sizes: ['M', 'L', 'XL'], colors: ['Indigo'], material: 'Denim', featured: false, stock: 7, createdAt: new Date('2024-05-14T15:00:00Z').toISOString() },
  { id: 10, name: 'Merino Wool Socks', price: 10500, description: 'Keep your feet comfortable and dry with these premium merino wool dress socks.', category: 'men', subCategory: 'accessories', imageUrls: ['https://picsum.photos/seed/p10/800/1000'], sizes: ['One Size'], colors: ['Charcoal', 'Burgundy'], material: 'Merino Wool', featured: false, stock: 40, createdAt: new Date('2024-04-28T10:00:00Z').toISOString() },
  { id: 12, name: 'The Minimalist Watch', price: 64500, description: 'A classic timepiece with a clean, minimalist dial and a genuine leather strap.', category: 'men', subCategory: 'accessories', imageUrls: ['https://picsum.photos/seed/p12/800/1000'], sizes: ['40mm'], colors: ['Silver', 'Gold'], material: 'Leather', featured: false, stock: 9, createdAt: new Date('2024-05-26T09:45:00Z').toISOString() },
  { id: 16, name: 'Men\'s Graphic T-Shirt', price: 15000, description: 'A soft graphic t-shirt.', category: 'men', subCategory: 't-shirts', imageUrls: ['https://picsum.photos/seed/p16/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'], material: 'Cotton', featured: false, stock: 60, createdAt: new Date('2024-05-01T10:00:00Z').toISOString() },
  { id: 17, name: 'Classic Polo Shirt', price: 22500, description: 'A timeless polo shirt for a smart-casual look.', category: 'men', subCategory: 'polo-shirts', imageUrls: ['https://picsum.photos/seed/p17/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Navy', 'White', 'Red'], material: 'Cotton', featured: true, stock: 0, createdAt: new Date('2024-05-17T18:00:00Z').toISOString() },
  { id: 18, name: 'Cargo Shorts', price: 19500, description: 'Comfortable and practical cargo shorts.', category: 'men', subCategory: 'shorts', imageUrls: ['https://picsum.photos/seed/p18/800/1000'], sizes: ['30', '32', '34', '36'], colors: ['Khaki', 'Green'], material: 'Cotton', featured: false, stock: 25, createdAt: new Date('2024-05-12T10:00:00Z').toISOString() },

  // Unisex
  { id: 19, name: 'Classic Hoodie', price: 36000, description: 'A comfortable and stylish hoodie.', category: 'unisex', subCategory: 'hoodies', imageUrls: ['https://picsum.photos/seed/p19/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Gray', 'Navy'], material: 'Cotton', featured: false, stock: 15, createdAt: new Date('2024-05-21T10:00:00Z').toISOString() },
  { id: 20, name: 'Crewneck Sweater', price: 33000, description: 'A cozy crewneck sweater.', category: 'unisex', subCategory: 'sweaters', imageUrls: ['https://picsum.photos/seed/p20/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Gray', 'Black', 'Green'], material: 'Cotton', featured: false, stock: 18, createdAt: new Date('2024-05-13T10:00:00Z').toISOString() },
  { id: 21, name: 'Baseball Cap', price: 12000, discountPrice: 9500, description: 'A classic baseball cap.', category: 'unisex', subCategory: 'accessories', imageUrls: ['https://picsum.photos/seed/p21/800/1000'], sizes: ['One Size'], colors: ['Black', 'White', 'Blue'], material: 'Cotton', featured: true, stock: 35, createdAt: new Date('2024-05-08T10:00:00Z').toISOString() },
  
  // Sportswear
  { id: 22, name: 'Performance Jersey', price: 27000, description: 'A breathable performance jersey for your workout.', category: 'sportswear', subCategory: 'jerseys', imageUrls: ['https://picsum.photos/seed/p22/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Red', 'Blue', 'Black'], material: 'Polyester', featured: true, stock: 20, createdAt: new Date('2024-05-25T10:00:00Z').toISOString() },
  { id: 23, name: 'Training Shorts', price: 18000, description: 'Lightweight shorts for training.', category: 'sportswear', subCategory: 'practice-wear', imageUrls: ['https://picsum.photos/seed/p23/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Gray'], material: 'Polyester', featured: false, stock: 30, createdAt: new Date('2024-05-09T10:00:00Z').toISOString() },
  { id: 24, name: 'Active Leggings', price: 24000, description: 'Supportive and flexible leggings for any activity.', category: 'sportswear', subCategory: 'active-bottoms', imageUrls: ['https://picsum.photos/seed/p24/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Purple'], material: 'Polyester', featured: false, stock: 3, createdAt: new Date('2024-05-22T17:00:00Z').toISOString() },
];

const MOCK_ORDERS: Order[] = [
    {
        id: 'EZ73847F', customerId: '1', customerName: 'John Doe', customerEmail: 'john.doe@example.com', customerPhone: '+94 77 123 4567', date: new Date('2024-05-25T10:30:00Z').toISOString(), status: 'Shipped',
        items: [{ ...MOCK_PRODUCTS[0], quantity: 1, selectedSize: 'M', selectedColor: 'Beige' }],
        shippingAddress: { street: '123 Oak Ave', city: 'Metropolis', state: 'NY', zip: '10001', country: 'USA' },
        subtotal: 68500, shipping: 0, total: 68500, trackingNumber: '1Z999AA10123456789', trackingCarrier: 'UPS',
        statusHistory: [
            { status: 'Confirmed', timestamp: new Date('2024-05-25T10:30:00Z').toISOString(), note: 'Order placed successfully.' },
            { status: 'Processing', timestamp: new Date('2024-05-25T14:00:00Z').toISOString(), note: 'Payment verified.' },
            { status: 'Packing', timestamp: new Date('2024-05-26T09:00:00Z').toISOString(), note: 'Items gathered.' },
            { status: 'Shipped', timestamp: new Date('2024-05-26T16:30:00Z').toISOString(), note: 'Package handed over to carrier.' },
        ]
    },
    {
        id: 'EZ64920A', customerId: '2', customerName: 'Jane Google', customerEmail: 'jane.google@example.com', customerPhone: '+94 71 987 6543', date: new Date('2024-05-24T12:00:00Z').toISOString(), status: 'Delivered',
        items: [{ ...MOCK_PRODUCTS[2], quantity: 1, selectedSize: 'S', selectedColor: 'Champagne' }, { ...MOCK_PRODUCTS[3], quantity: 1, selectedSize: '32', selectedColor: 'Khaki' }],
        shippingAddress: { street: '456 Pine St', city: 'Gotham', state: 'NJ', zip: '07001', country: 'USA' },
        subtotal: 83500, shipping: 0, total: 83500,
        statusHistory: [
             { status: 'Confirmed', timestamp: new Date('2024-05-24T12:00:00Z').toISOString() },
             { status: 'Shipped', timestamp: new Date('2024-05-25T10:00:00Z').toISOString() },
             { status: 'Delivered', timestamp: new Date('2024-05-27T15:20:00Z').toISOString(), note: 'Delivered to front porch.' },
        ]
    },
    {
        id: 'EZ98451B', customerId: '3', customerName: 'Sam Smith', customerEmail: 'sam.smith@example.com', customerPhone: '+94 75 555 5555', date: new Date('2024-05-26T09:15:00Z').toISOString(), status: 'Processing',
        items: [{ ...MOCK_PRODUCTS[18], quantity: 2, selectedSize: 'M', selectedColor: 'Black' }],
        shippingAddress: { street: '789 Birch Rd', city: 'Star City', state: 'CA', zip: '90210', country: 'USA' },
        subtotal: 72000, shipping: 0, total: 72000,
        statusHistory: [
            { status: 'Confirmed', timestamp: new Date('2024-05-26T09:15:00Z').toISOString() },
            { status: 'Processing', timestamp: new Date('2024-05-26T11:00:00Z').toISOString(), note: 'Verifying stock availability.' },
        ]
    },
    {
        id: 'EZ10384C', customerId: '1', customerName: 'John Doe', customerEmail: 'john.doe@example.com', customerPhone: '+94 77 123 4567', date: new Date('2024-04-10T11:00:00Z').toISOString(), status: 'Cancelled',
        items: [{ ...MOCK_PRODUCTS[1], quantity: 1, selectedSize: 'L', selectedColor: 'White' }],
        shippingAddress: { street: '123 Oak Ave', city: 'Metropolis', state: 'NY', zip: '10001', country: 'USA' },
        subtotal: 28500, shipping: 0, total: 28500,
        statusHistory: [
            { status: 'Confirmed', timestamp: new Date('2024-04-10T11:00:00Z').toISOString() },
            { status: 'Cancelled', timestamp: new Date('2024-04-10T12:00:00Z').toISOString(), note: 'Customer requested cancellation.' },
        ]
    },
];

// Static Content Defaults (CMS Content remains client-side default until moved to DB schemas)
const INITIAL_HOME_CONTENT: HomePageContent = {
  heroSlides: [
    { imageUrl: "https://picsum.photos/seed/slide1/1920/1080", title: "Autumn Collection", subtitle: "Embrace the new season with timeless layers.", buttonText: "Shop Now", filters: { category: 'women' } },
    { imageUrl: "https://picsum.photos/seed/slide2/1920/1080", title: "Men's Essentials", subtitle: "Crafted for comfort, designed for life.", buttonText: "Discover Men's", filters: { category: 'men' } },
    { imageUrl: "https://picsum.photos/seed/slide3/1920/1080", title: "The Sportswear Edit", subtitle: "Performance meets lasting elegance.", buttonText: "Explore Sportswear", filters: { category: 'sportswear' } },
  ],
  midBanner: {
    title: "The Essentials Collection",
    subtitle: "Timeless design meets unparalleled comfort. The foundation of a modern wardrobe.",
    buttonText: "Shop Essentials",
    imageUrl: "https://picsum.photos/seed/banner/1920/800",
  },
  categoryShowcase: [
    { title: "Men", imageUrl: "https://picsum.photos/seed/cat-men/800/1000", filters: { category: 'men' } },
    { title: "Women", imageUrl: "https://picsum.photos/seed/cat-women/800/1000", filters: { category: 'women' } },
    { title: "Unisex", imageUrl: "https://picsum.photos/seed/cat-unisex/800/1000", filters: { category: 'unisex' } },
    { title: "Sportswear", imageUrl: "https://picsum.photos/seed/cat-sport/800/1000", filters: { category: 'sportswear' } },
  ]
};

const INITIAL_ABOUT_CONTENT: AboutPageContent = {
  story: "Founded on the principles of timeless design and impeccable quality, ezooze began as a small atelier with a grand vision: to create clothing that transcends fleeting trends. We believe in the power of a well-crafted garment to not only look beautiful but to feel exceptional and endure for years to come. Our journey is one of passion for artistry, dedication to sustainable practices, and a deep respect for the materials we use."
};

const INITIAL_CAREERS_CONTENT: CareersPageContent = [
    { id: '1', title: 'Senior Fashion Designer', location: 'Fashion City', department: 'Design' },
    { id: '2', title: 'Digital Marketing Manager', location: 'Remote', department: 'Marketing' },
    { id: '3', title: 'Customer Experience Specialist', location: 'Fashion City', department: 'Support' },
    { id: '4', title: 'Supply Chain Coordinator', location: 'Fashion City', department: 'Operations' },
];

const INITIAL_PRESS_CONTENT: PressPageContent = [
    { id: '1', publication: "Vogue", title: "ezooze: Redefining Modern Elegance", date: "October 2023", link: "#" },
    { id: '2', publication: "GQ", title: "The Only Blazer You'll Ever Need", date: "September 2023", link: "#" },
    { id: '3', publication: "The Financial Times", title: "Sustainable Luxury Finds Its Champion in ezooze", date: "July 2023", link: "#" },
];

const INITIAL_FAQ_CONTENT: FAQPageContent = [
    { id: '1', question: "What is your shipping policy?", answer: "We offer complimentary standard shipping on all orders over Rs. 15,000. For orders under Rs. 15,000, standard shipping is a flat rate of Rs. 500. Expedited shipping options are also available at checkout. Please allow 1-2 business days for order processing." },
    { id: '2', question: "How do I return or exchange an item?", answer: "We accept returns and exchanges on unworn, unwashed items with tags attached within 30 days of purchase. To initiate a return, please visit our Shipping & Returns page and follow the instructions. A pre-paid shipping label will be provided." },
    { id: '3', question: "What materials do you use?", answer: "We are committed to using high-quality, sustainable materials. Our collections feature natural fibers like organic cotton, linen, silk, and responsibly sourced wool and cashmere. You can find detailed material information on each product page." },
    { id: '4', question: "How should I care for my garments?", answer: "To ensure the longevity of your ezooze pieces, we recommend following the specific care instructions on the garment's label. In general, we advise gentle washing, minimal heat, and avoiding harsh detergents." },
    { id: '5', question: "Do you have physical store locations?", answer: "Currently, ezooze operates exclusively online. This allows us to reach a global audience and focus on providing the best possible digital experience. Sign up for our newsletter to be the first to know about any future pop-up shops or retail locations." }
];

const INITIAL_PRIVACY_POLICY_CONTENT: PrivacyPolicyPageContent = {
    sections: [
        { id: '1', title: 'Introduction', content: "Welcome to ezooze. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site." },
        { id: '2', title: 'Collection of Your Information', content: "We may collect information about you in a variety of ways. The information we may collect on the Site includes personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards." },
        { id: '3', title: 'Use of Your Information', content: "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:\n- Create and manage your account.\n- Email you regarding your account or order.\n- Fulfill and manage purchases, orders, payments, and other transactions related to the Site.\n- Improve our website and offerings." },
        { id: '4', title: 'Security of Your Information', content: "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse." },
        { id: '5', title: 'Contact Us', content: "If you have questions or comments about this Privacy Policy, please contact us at: privacy@ezooze.com." }
    ]
};

const INITIAL_TERMS_CONTENT: TermsOfServicePageContent = {
    sections: [
        { id: '1', title: '1. Agreement to Terms', content: "By using our website, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the website. We may revise the Terms from time to time, and the most current version will always be posted on our website." },
        { id: '2', title: '2. Use of the Website', content: "You may use the website only for lawful purposes and in accordance with these Terms. You agree not to use the website:\n- In any way that violates any applicable federal, state, local, or international law or regulation.\n- To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website." },
        { id: '3', title: '3. Intellectual Property Rights', content: "The website and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by ezooze, its licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws." },
        { id: '4', title: '4. Governing Law', content: "All matters relating to the website and these Terms of Service, and any dispute or claim arising therefrom or related thereto, shall be governed by and construed in accordance with the internal laws of the State of [Your State] without giving effect to any choice or conflict of law provision or rule." },
        { id: '5', title: '5. Contact Us', content: "If you have questions or comments about these Terms of Service, please contact us at: legal@ezooze.com." }
    ]
};

const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: "ezooze",
  contactEmail: "contact@ezooze.com",
  address: "123 Elegance Ave, Fashion City, 10001",
  currency: "LKR",
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    pinterest: "https://pinterest.com",
  },
  standardShippingCost: 500,
  freeShippingThreshold: 15000,
  isFreeShippingThresholdActive: true,
  taxRate: 8, // Default 8% tax rate
  paymentMethods: {
    creditCard: true,
    payOnDelivery: true,
  },
};

const INITIAL_NAV_LINKS: NavLink[] = [
    { id: 'home', name: 'Home', page: 'home' as Page },
    {
      id: 'men',
      name: 'Men',
      page: 'shop' as Page,
      filters: { category: 'men' },
      isMega: true,
      children: [
        { id: 'men-tshirts', name: 'T-shirts', filters: { category: 'men', subCategory: 't-shirts'} },
        { id: 'men-polos', name: 'Polo Shirts', filters: { category: 'men', subCategory: 'polo-shirts'} },
        { id: 'men-shirts', name: 'Shirts', filters: { category: 'men', subCategory: 'shirts'} },
        { id: 'men-shorts', name: 'Shorts', filters: { category: 'men', subCategory: 'shorts'} },
        { id: 'men-pants', name: 'Pants', filters: { category: 'men', subCategory: 'pants'} },
        { id: 'men-jackets', name: 'Jackets', filters: { category: 'men', subCategory: 'jackets'} },
      ],
    },
    {
        id: 'women',
        name: 'Women',
        page: 'shop' as Page,
        filters: { category: 'women' },
        isMega: true,
        children: [
            { id: 'women-tshirts', name: 'T-shirts', filters: { category: 'women', subCategory: 't-shirts'} },
            { id: 'women-croptops', name: 'Crop Tops', filters: { category: 'women', subCategory: 'crop-tops'} },
            { id: 'women-dresses', name: 'Dresses', filters: { category: 'women', subCategory: 'dresses'} },
            { id: 'women-skirts', name: 'Skirts', filters: { category: 'women', subCategory: 'skirts'} },
            { id: 'women-pants', name: 'Pants', filters: { category: 'women', subCategory: 'pants'} },
            { id: 'women-blazers', name: 'Blazers', filters: { category: 'women', subCategory: 'blazers'} },
        ],
    },
    {
        id: 'unisex',
        name: 'Unisex',
        page: 'shop' as Page,
        filters: { category: 'unisex' },
        children: [
            { id: 'unisex-hoodies', name: 'Hoodies', filters: { category: 'unisex', subCategory: 'hoodies'} },
            { id: 'unisex-sweaters', name: 'Sweaters', filters: { category: 'unisex', subCategory: 'sweaters'} },
            { id: 'unisex-accessories', name: 'Accessories', filters: { category: 'unisex', subCategory: 'accessories'} },
        ],
    },
    {
        id: 'sportswear',
        name: 'Sportswear',
        page: 'shop' as Page,
        filters: { category: 'sportswear' },
        children: [
            { id: 'sportswear-jerseys', name: 'Jerseys', filters: { category: 'sportswear', subCategory: 'jerseys'} },
            { id: 'sportswear-practice', name: 'Practice Wear', filters: { category: 'sportswear', subCategory: 'practice-wear'} },
            { id: 'sportswear-bottoms', name: 'Active Bottoms', filters: { category: 'sportswear', subCategory: 'active-bottoms'} },
        ],
    },
    { id: 'shop-all', name: 'Shop All', page: 'shop' as Page },
];

const MOCK_DISCOUNTS: DiscountCode[] = [
    { id: 1, code: 'SAVE10', type: 'percentage', value: 10, isActive: true, uses: 5, usageLimit: 100 },
    { id: 2, code: 'FREESHIP', type: 'free_shipping', value: 0, isActive: true, minimumPurchase: 10000, uses: 10 },
    { id: 3, code: 'SUMMER20', type: 'percentage', value: 20, isActive: false },
    { id: 4, code: '500OFF', type: 'fixed', value: 500, isActive: true, minimumPurchase: 5000, uses: 2 },
    { id: 5, code: 'EXPIRED', type: 'percentage', value: 15, isActive: true, expiresAt: new Date('2023-01-01T00:00:00Z').toISOString() },
    { id: 6, code: 'USEDUP', type: 'fixed', value: 1000, isActive: true, uses: 20, usageLimit: 20 },
];

type ShopFilters = {
  category?: string;
  subCategory?: string;
  maxPrice?: number;
  colors: string[];
  sizes: string[];
  materials: string[];
};

interface AppContentProps {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const AppContent: React.FC<AppContentProps> = ({ orders, setOrders, products, setProducts }) => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shopFilters, setShopFilters] = useState<ShopFilters>({
    colors: [],
    sizes: [],
    materials: [],
  });
  
  const [contentKey, setContentKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotificationCenter();

  // Data state
  // products and orders are now received as props from AppWrapper
  const [homePageContent, setHomePageContent] = useLocalStorage<HomePageContent>('ezooze_home_content', INITIAL_HOME_CONTENT);
  const [aboutPageContent, setAboutPageContent] = useLocalStorage<AboutPageContent>('ezooze_about_content', INITIAL_ABOUT_CONTENT);
  const [careersPageContent, setCareersPageContent] = useLocalStorage<CareersPageContent>('ezooze_careers_content', INITIAL_CAREERS_CONTENT);
  const [pressPageContent, setPressPageContent] = useLocalStorage<PressPageContent>('ezooze_press_content', INITIAL_PRESS_CONTENT);
  const [faqPageContent, setFaqPageContent] = useLocalStorage<FAQPageContent>('ezooze_faq_content', INITIAL_FAQ_CONTENT);
  const [privacyPolicyPageContent, setPrivacyPolicyPageContent] = useLocalStorage<PrivacyPolicyPageContent>('ezooze_privacy_policy_content', INITIAL_PRIVACY_POLICY_CONTENT);
  const [termsOfServicePageContent, setTermsOfServicePageContent] = useLocalStorage<TermsOfServicePageContent>('ezooze_terms_content', INITIAL_TERMS_CONTENT);
  const [storeSettings, setStoreSettings] = useLocalStorage<StoreSettings>('ezooze_settings', INITIAL_STORE_SETTINGS);
  
  const [users, setUsers] = useState<User[]>([]);
  const [discountCodes, setDiscountCodes] = useLocalStorage<DiscountCode[]>('ezooze_discounts', MOCK_DISCOUNTS);
  const [productAttributes, setProductAttributes] = useLocalStorage<ProductAttributes>('ezooze_attributes', {
      subCategories: [],
      colors: [],
      materials: [],
      sizes: [],
  });
  const [navLinks, setNavLinks] = useLocalStorage<NavLink[]>('ezooze_nav_links', INITIAL_NAV_LINKS);
  const [appliedDiscount, setAppliedDiscount] = useLocalStorage<DiscountCode | null>('ezooze_applied_discount', null);
  const [orderToTrack, setOrderToTrack] = useState<Order | null>(null);


  const newArrivals = products.filter(p => p.featured);

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            // Try to fetch data from API (Mock or DB)
            // If DB is forced but server down, this will fail.
            // If Mock is used, this will succeed with mock data.
            try {
                const fetchedUsers = await api.getUsers();
                setUsers(fetchedUsers);
            } catch (e) {
                console.warn("Could not fetch users from API, using local/mock defaults.");
            }
            
            try {
                const fetchedProducts = await api.getProducts();
                if (fetchedProducts && fetchedProducts.length > 0) {
                    setProducts(fetchedProducts);
                }
            } catch (e) {
                console.warn("Could not fetch products from API, using local/mock defaults.");
            }
            
            try {
                const fetchedOrders = await api.getOrders();
                if (fetchedOrders && fetchedOrders.length > 0) {
                    setOrders(fetchedOrders);
                }
            } catch (e) {
                console.warn("Could not fetch orders from API, using local/mock defaults.");
            }

        } catch (error) {
            console.error("Failed to load initial data", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, [setProducts, setOrders]);

  const handleUpdateUser = async (userToUpdate: Partial<User> & {id: string}) => {
    try {
        const updatedUser = await api.updateUser(userToUpdate.id, userToUpdate);
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch(error) {
        console.error("Failed to update user:", error);
    }
  };
  
  useEffect(() => {
    // One-time initialization of attributes from existing products if attributes are empty
    if (productAttributes.subCategories.length === 0 && products.length > 0) {
        const allSubCategories = [...new Set(products.map(p => p.subCategory).filter(Boolean))];
        const allColors = [...new Set(products.flatMap(p => p.colors).filter(Boolean))];
        const allMaterials = [...new Set(products.map(p => p.material).filter(Boolean))];
        const allSizes = [...new Set(products.flatMap(p => p.sizes).filter(Boolean))];
        
        setProductAttributes({
            subCategories: allSubCategories.sort(),
            colors: allColors.sort(),
            materials: allMaterials.sort(),
            sizes: allSizes.sort(),
        });
    }
  }, [products, productAttributes, setProductAttributes]);

  const usePageTransition = (page: Page) => {
     useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [page, selectedProduct]);
  }

  const navigateTo = (page: Page, navFilters: { category?: string; subCategory?: string } = {}) => {
    // Log page visit
    logger.log(page, 'navigate');
    
    setCurrentPage(page);
    setSelectedProduct(null);
    setContentKey(prevKey => prevKey + 1);

    if (page === 'shop') {
      // When navigating from the navbar, reset all filters and apply the new category/sub-category.
      setShopFilters({
        ...navFilters,
        colors: [],
        sizes: [],
        materials: [],
        maxPrice: undefined,
      });
    } else if (currentPage === 'shop') {
      // When navigating away from shop, reset all filters.
      setShopFilters({ colors: [], sizes: [], materials: [], maxPrice: undefined });
    }
  };


  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
  };

  const viewProductOnSite = (product: Product) => {
    viewProduct(product);
  }
  
  usePageTransition(currentPage);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-cream dark:bg-brand-charcoal">
        <div className="text-center animate-pulse">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-5xl font-serif font-bold tracking-widest text-brand-charcoal dark:text-brand-cream">ezooze</h1>
                <div className="h-0.5 w-16 bg-brand-gold my-4"></div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Lasting Elegance</p>
            </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (currentPage === 'product' && selectedProduct) {
      return <ProductDetail product={selectedProduct} products={products} viewProduct={viewProduct} storeSettings={storeSettings} />;
    }
    switch (currentPage) {
      case 'home':
        return <Home navigateTo={navigateTo} newArrivals={newArrivals} viewProduct={viewProduct} homeContent={homePageContent} storeSettings={storeSettings} />;
      case 'shop':
        return <Shop products={products} viewProduct={viewProduct} filters={shopFilters} setFilters={setShopFilters} navLinks={navLinks} productAttributes={productAttributes} storeSettings={storeSettings} />;
      case 'cart':
        return <Cart navigateTo={navigateTo} viewProduct={viewProduct} discountCodes={discountCodes} appliedDiscount={appliedDiscount} setAppliedDiscount={setAppliedDiscount} storeSettings={storeSettings} />;
      case 'checkout':
        return <Checkout navigateTo={navigateTo} orders={orders} setOrders={setOrders} discountCodes={discountCodes} setDiscountCodes={setDiscountCodes} appliedDiscount={appliedDiscount} setAppliedDiscount={setAppliedDiscount} storeSettings={storeSettings} setOrderToTrack={setOrderToTrack} />;
      case 'login':
        return <Login navigateTo={navigateTo} />;
      case 'register':
        return <Register navigateTo={navigateTo} />;
      case 'forgotPassword':
        return <ForgotPassword navigateTo={navigateTo} />;
      case 'about':
        return <AboutPage content={aboutPageContent} />;
      case 'careers':
        return <CareersPage content={careersPageContent} />;
      case 'press':
        return <PressPage content={pressPageContent} />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage content={faqPageContent} />;
      case 'shipping':
        return <ShippingReturnsPage storeSettings={storeSettings} />;
      case 'privacy':
        return <PrivacyPolicyPage content={privacyPolicyPageContent} />;
      case 'terms':
        return <TermsOfServicePage content={termsOfServicePageContent} />;
      case 'orderTracking':
        return <OrderTrackingPage orders={orders} navigateTo={navigateTo} orderToTrack={orderToTrack} setOrderToTrack={setOrderToTrack} storeSettings={storeSettings} />;
      case 'admin':
        return <AdminPage 
                    navigateTo={navigateTo}
                    viewProductOnSite={viewProductOnSite}
                    products={products} 
                    setProducts={setProducts}
                    orders={orders}
                    setOrders={setOrders}
                    users={users}
                    onUpdateUser={handleUpdateUser}
                    discountCodes={discountCodes}
                    setDiscountCodes={setDiscountCodes}
                    productAttributes={productAttributes}
                    setProductAttributes={setProductAttributes}
                    navLinks={navLinks}
                    setNavLinks={setNavLinks}
                    homeContent={homePageContent}
                    setHomeContent={setHomePageContent}
                    aboutContent={aboutPageContent}
                    setAboutContent={setAboutPageContent}
                    careersContent={careersPageContent}
                    setCareersContent={setCareersPageContent}
                    pressContent={pressPageContent}
                    setPressContent={setPressPageContent}
                    faqContent={faqPageContent}
                    setFaqContent={setFaqPageContent}
                    privacyPolicyContent={privacyPolicyPageContent}
                    setPrivacyPolicyContent={setPrivacyPolicyPageContent}
                    termsContent={termsOfServicePageContent}
                    setTermsContent={setTermsOfServicePageContent}
                    storeSettings={storeSettings}
                    setStoreSettings={setStoreSettings}
                />;
      default:
        return <Home navigateTo={navigateTo} newArrivals={newArrivals} viewProduct={viewProduct} homeContent={homePageContent} storeSettings={storeSettings} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentPage !== 'admin' && <Navbar navigateTo={navigateTo} navLinks={navLinks} currentPage={currentPage} />}
      <main className={`flex-grow ${currentPage !== 'admin' ? 'pt-16' : ''}`}>
        <div key={contentKey}>
            {renderContent()}
        </div>
      </main>
      {currentPage !== 'admin' && <Footer navigateTo={navigateTo} storeSettings={storeSettings} />}
    </div>
  )
}


const App: React.FC = () => {
    // We need to wrap AppContent with RealtimeProvider and access state setters for handling events
    return (
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
                <AppWrapper />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      );
};

// Helper wrapper to handle the event callback which needs access to context/hooks
// Lifted State: 'orders' and 'products' are now managed here to ensure single source of truth for realtime updates.
const AppWrapper: React.FC = () => {
    const [orders, setOrders] = useLocalStorage<Order[]>('ezooze_orders', MOCK_ORDERS); // Initialize with Mock for immediate display
    const [products, setProducts] = useLocalStorage<Product[]>('ezooze_products', MOCK_PRODUCTS); // Initialize with Mock for immediate display
    const { addNotification } = useNotificationCenter();

    const handleRealtimeEvent = useCallback((event: { type: string, payload: any }) => {
        if (event.type === 'ORDER_CREATED') {
            // Merge new order if it doesn't exist
            setOrders(prev => {
                if (prev.some(o => o.id === event.payload.id)) return prev;
                return [event.payload, ...prev];
            });
            addNotification('order', `New Order #${event.payload.id} from ${event.payload.customerName}`, { section: 'orders' });
        } else if (event.type === 'ORDER_UPDATED') {
            setOrders(prev => prev.map(o => o.id === event.payload.id ? event.payload : o));
        }
    }, [setOrders, addNotification]);

    return (
        <RealtimeProvider onEvent={handleRealtimeEvent}>
            <AppContent orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} />
        </RealtimeProvider>
    );
}

export default App;
