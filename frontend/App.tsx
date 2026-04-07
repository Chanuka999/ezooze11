import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout.tsx";
import { OrderSuccessPage } from "./pages/OrderSuccessPage.tsx";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { RealtimeProvider } from "./context/RealtimeContext";
import {
  Page,
  Product,
  HomePageContent,
  AboutPageContent,
  StoreSettings,
  Order,
  User,
  DiscountCode,
  ProductAttributes,
  NavLink,
  CareersPageContent,
  PressPageContent,
  FAQPageContent,
  PrivacyPolicyPageContent,
  TermsOfServicePageContent,
} from "./types";
import { AboutPage } from "./pages/AboutPage";
import { CareersPage } from "./pages/CareersPage";
import { PressPage } from "./pages/PressPage";
import { ContactPage } from "./pages/ContactPage";
import { FAQPage } from "./pages/FAQPage";
import { ShippingReturnsPage } from "./pages/ShippingReturnsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";
import { SpinnerIcon } from "./components/icons";
import { AdminPage } from "./pages/AdminPage";
import useLocalStorage from "./hooks/useLocalStorage";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { api } from "./api";
import { useNotificationCenter } from "./hooks/useNotificationCenter";
import { logger } from "./utils/logger";
import { useAuth } from "./hooks/useAuth";

// Mock Data with Variants Logic
const MOCK_PRODUCTS: Product[] = [];

const MOCK_ORDERS: Order[] = [];

// Static Content Defaults (CMS Content remains client-side default until moved to DB schemas)
const INITIAL_HOME_CONTENT: HomePageContent = {
  heroSlides: [
    {
      imageUrl:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      title: "Autumn Collection",
      subtitle: "Embrace the new season with timeless layers.",
      buttonText: "Shop Now",
      filters: { category: "women" },
    },
    {
      imageUrl:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      title: "Men's Essentials",
      subtitle: "Crafted for comfort, designed for life.",
      buttonText: "Discover Men's",
      filters: { category: "men" },
    },
    {
      imageUrl:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      title: "The Sportswear Edit",
      subtitle: "Performance meets lasting elegance.",
      buttonText: "Explore Sportswear",
      filters: { category: "sportswear" },
    },
  ],
  midBanner: {
    title: "The Essentials Collection",
    subtitle:
      "Timeless design meets unparalleled comfort. The foundation of a modern wardrobe.",
    buttonText: "Shop Essentials",
    imageUrl:
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  },
  categoryShowcase: [
    {
      title: "Men",
      imageUrl:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      filters: { category: "men" },
    },
    {
      title: "Women",
      imageUrl:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      filters: { category: "women" },
    },
    {
      title: "Unisex",
      imageUrl:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      filters: { category: "unisex" },
    },
    {
      title: "Sportswear",
      imageUrl:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      filters: { category: "sportswear" },
    },
  ],
};

const INITIAL_ABOUT_CONTENT: AboutPageContent = {
  story:
    "Founded on the principles of timeless design and impeccable quality, ezooze began as a small atelier with a grand vision: to create clothing that transcends fleeting trends. We believe in the power of a well-crafted garment to not only look beautiful but to feel exceptional and endure for years to come. Our journey is one of passion for artistry, dedication to sustainable practices, and a deep respect for the materials we use.",
};

const INITIAL_CAREERS_CONTENT: CareersPageContent = [
  {
    id: "1",
    title: "Senior Fashion Designer",
    location: "Fashion City",
    department: "Design",
  },
  {
    id: "2",
    title: "Digital Marketing Manager",
    location: "Remote",
    department: "Marketing",
  },
  {
    id: "3",
    title: "Customer Experience Specialist",
    location: "Fashion City",
    department: "Support",
  },
  {
    id: "4",
    title: "Supply Chain Coordinator",
    location: "Fashion City",
    department: "Operations",
  },
];

const INITIAL_PRESS_CONTENT: PressPageContent = [
  {
    id: "1",
    publication: "Vogue",
    title: "ezooze: Redefining Modern Elegance",
    date: "October 2023",
    link: "#",
  },
  {
    id: "2",
    publication: "GQ",
    title: "The Only Blazer You'll Ever Need",
    date: "September 2023",
    link: "#",
  },
  {
    id: "3",
    publication: "The Financial Times",
    title: "Sustainable Luxury Finds Its Champion in ezooze",
    date: "July 2023",
    link: "#",
  },
];

const INITIAL_FAQ_CONTENT: FAQPageContent = [
  {
    id: "1",
    question: "What is your shipping policy?",
    answer:
      "We offer complimentary standard shipping on all orders over Rs. 15,000. For orders under Rs. 15,000, standard shipping is a flat rate of Rs. 500. Expedited shipping options are also available at checkout. Please allow 1-2 business days for order processing.",
  },
  {
    id: "2",
    question: "How do I return or exchange an item?",
    answer:
      "We accept returns and exchanges on unworn, unwashed items with tags attached within 30 days of purchase. To initiate a return, please visit our Shipping & Returns page and follow the instructions. A pre-paid shipping label will be provided.",
  },
  {
    id: "3",
    question: "What materials do you use?",
    answer:
      "We are committed to using high-quality, sustainable materials. Our collections feature natural fibers like organic cotton, linen, silk, and responsibly sourced wool and cashmere. You can find detailed material information on each product page.",
  },
  {
    id: "4",
    question: "How should I care for my garments?",
    answer:
      "To ensure the longevity of your ezooze pieces, we recommend following the specific care instructions on the garment's label. In general, we advise gentle washing, minimal heat, and avoiding harsh detergents.",
  },
  {
    id: "5",
    question: "Do you have physical store locations?",
    answer:
      "Currently, ezooze operates exclusively online. This allows us to reach a global audience and focus on providing the best possible digital experience. Sign up for our newsletter to be the first to know about any future pop-up shops or retail locations.",
  },
];

const INITIAL_PRIVACY_POLICY_CONTENT: PrivacyPolicyPageContent = {
  sections: [
    {
      id: "1",
      title: "Introduction",
      content:
        "Welcome to ezooze. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.",
    },
    {
      id: "2",
      title: "Collection of Your Information",
      content:
        "We may collect information about you in a variety of ways. The information we may collect on the Site includes personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.",
    },
    {
      id: "3",
      title: "Use of Your Information",
      content:
        "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:\n- Create and manage your account.\n- Email you regarding your account or order.\n- Fulfill and manage purchases, orders, payments, and other transactions related to the Site.\n- Improve our website and offerings.",
    },
    {
      id: "4",
      title: "Security of Your Information",
      content:
        "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.",
    },
    {
      id: "5",
      title: "Contact Us",
      content:
        "If you have questions or comments about this Privacy Policy, please contact us at: privacy@ezooze.com.",
    },
  ],
};

const INITIAL_TERMS_CONTENT: TermsOfServicePageContent = {
  sections: [
    {
      id: "1",
      title: "1. Agreement to Terms",
      content:
        "By using our website, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the website. We may revise the Terms from time to time, and the most current version will always be posted on our website.",
    },
    {
      id: "2",
      title: "2. Use of the Website",
      content:
        "You may use the website only for lawful purposes and in accordance with these Terms. You agree not to use the website:\n- In any way that violates any applicable federal, state, local, or international law or regulation.\n- To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website.",
    },
    {
      id: "3",
      title: "3. Intellectual Property Rights",
      content:
        "The website and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by ezooze, its licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.",
    },
    {
      id: "4",
      title: "4. Governing Law",
      content:
        "All matters relating to the website and these Terms of Service, and any dispute or claim arising therefrom or related thereto, shall be governed by and construed in accordance with the internal laws of the State of [Your State] without giving effect to any choice or conflict of law provision or rule.",
    },
    {
      id: "5",
      title: "5. Contact Us",
      content:
        "If you have questions or comments about these Terms of Service, please contact us at: legal@ezooze.com.",
    },
  ],
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
  { id: "home", name: "Home", page: "home" as Page },
  {
    id: "men",
    name: "Men",
    page: "shop" as Page,
    filters: { category: "men" },
    isMega: true,
    children: [
      {
        id: "men-tshirts",
        name: "T-shirts",
        filters: { category: "men", subCategory: "t-shirts" },
      },
      {
        id: "men-polos",
        name: "Polo Shirts",
        filters: { category: "men", subCategory: "polo-shirts" },
      },
      {
        id: "men-shirts",
        name: "Shirts",
        filters: { category: "men", subCategory: "shirts" },
      },
      {
        id: "men-shorts",
        name: "Shorts",
        filters: { category: "men", subCategory: "shorts" },
      },
      {
        id: "men-pants",
        name: "Pants",
        filters: { category: "men", subCategory: "pants" },
      },
      {
        id: "men-jackets",
        name: "Jackets",
        filters: { category: "men", subCategory: "jackets" },
      },
    ],
  },
  {
    id: "women",
    name: "Women",
    page: "shop" as Page,
    filters: { category: "women" },
    isMega: true,
    children: [
      {
        id: "women-tshirts",
        name: "T-shirts",
        filters: { category: "women", subCategory: "t-shirts" },
      },
      {
        id: "women-croptops",
        name: "Crop Tops",
        filters: { category: "women", subCategory: "crop-tops" },
      },
      {
        id: "women-dresses",
        name: "Dresses",
        filters: { category: "women", subCategory: "dresses" },
      },
      {
        id: "women-skirts",
        name: "Skirts",
        filters: { category: "women", subCategory: "skirts" },
      },
      {
        id: "women-pants",
        name: "Pants",
        filters: { category: "women", subCategory: "pants" },
      },
      {
        id: "women-blazers",
        name: "Blazers",
        filters: { category: "women", subCategory: "blazers" },
      },
    ],
  },
  {
    id: "unisex",
    name: "Unisex",
    page: "shop" as Page,
    filters: { category: "unisex" },
    children: [
      {
        id: "unisex-hoodies",
        name: "Hoodies",
        filters: { category: "unisex", subCategory: "hoodies" },
      },
      {
        id: "unisex-sweaters",
        name: "Sweaters",
        filters: { category: "unisex", subCategory: "sweaters" },
      },
      {
        id: "unisex-accessories",
        name: "Accessories",
        filters: { category: "unisex", subCategory: "accessories" },
      },
    ],
  },
  {
    id: "sportswear",
    name: "Sportswear",
    page: "shop" as Page,
    filters: { category: "sportswear" },
    children: [
      {
        id: "sportswear-jerseys",
        name: "Jerseys",
        filters: { category: "sportswear", subCategory: "jerseys" },
      },
      {
        id: "sportswear-practice",
        name: "Practice Wear",
        filters: { category: "sportswear", subCategory: "practice-wear" },
      },
      {
        id: "sportswear-bottoms",
        name: "Active Bottoms",
        filters: { category: "sportswear", subCategory: "active-bottoms" },
      },
    ],
  },
  { id: "shop-all", name: "Shop All", page: "shop" as Page },
];

const MOCK_DISCOUNTS: DiscountCode[] = [
  {
    id: 1,
    code: "SAVE10",
    type: "percentage",
    value: 10,
    isActive: true,
    uses: 5,
    usageLimit: 100,
  },
  {
    id: 2,
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    isActive: true,
    minimumPurchase: 10000,
    uses: 10,
  },
  { id: 3, code: "SUMMER20", type: "percentage", value: 20, isActive: false },
  {
    id: 4,
    code: "500OFF",
    type: "fixed",
    value: 500,
    isActive: true,
    minimumPurchase: 5000,
    uses: 2,
  },
  {
    id: 5,
    code: "EXPIRED",
    type: "percentage",
    value: 15,
    isActive: true,
    expiresAt: new Date("2023-01-01T00:00:00Z").toISOString(),
  },
  {
    id: 6,
    code: "USEDUP",
    type: "fixed",
    value: 1000,
    isActive: true,
    uses: 20,
    usageLimit: 20,
  },
];

type ShopFilters = {
  category?: string;
  subCategory?: string;
  maxPrice?: number;
  colors: string[];
  sizes: string[];
  materials: string[];
};

type LocationSnapshot = {
  page: Page;
  productId?: string;
  shopFilters?: Partial<ShopFilters>;
};

const isCloudinaryImageUrl = (url: string) =>
  /^https?:\/\/res\.cloudinary\.com\//i.test(url);

const sanitizeProductsForDisplay = (items: Product[]): Product[] =>
  items
    .map((product) => ({
      ...product,
      imageUrls: (product.imageUrls || []).filter((url) =>
        isCloudinaryImageUrl(String(url || "")),
      ),
    }))
    .filter((product) => product.imageUrls.length > 0);

const PAGE_PATHS: Record<Exclude<Page, "product">, string> = {
  home: "/",
  shop: "/shop",
  cart: "/cart",
  checkout: "/checkout",
  orderSuccess: "/order-success",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  about: "/about",
  careers: "/careers",
  press: "/press",
  contact: "/contact",
  faq: "/faq",
  shipping: "/shipping",
  privacy: "/privacy",
  terms: "/terms",
  dashboard: "/dashboard",
  admin: "/admin",
  orderTracking: "/order-tracking",
};

const getLocationSnapshot = (): LocationSnapshot => {
  if (typeof window === "undefined") {
    return { page: "home" };
  }

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const segments = pathname.split("/").filter(Boolean);
  const searchParams = new URLSearchParams(window.location.search);

  if (segments[0] === "product" && segments[1]) {
    return { page: "product", productId: segments[1] };
  }

  if (segments[0] === "shop") {
    const shopFilters: Partial<ShopFilters> = {
      category: searchParams.get("category") || undefined,
      subCategory: searchParams.get("subCategory") || undefined,
    };

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) {
      const parsedMaxPrice = Number(maxPrice);
      if (!Number.isNaN(parsedMaxPrice)) {
        shopFilters.maxPrice = parsedMaxPrice;
      }
    }

    return { page: "shop", shopFilters };
  }

  const staticPathToPage: Record<string, Page> = {
    "": "home",
    home: "home",
    shop: "shop",
    cart: "cart",
    checkout: "checkout",
    "order-success": "orderSuccess",
    login: "login",
    register: "register",
    "forgot-password": "forgotPassword",
    about: "about",
    careers: "careers",
    press: "press",
    contact: "contact",
    faq: "faq",
    shipping: "shipping",
    privacy: "privacy",
    terms: "terms",
    dashboard: "dashboard",
    admin: "admin",
    "order-tracking": "orderTracking",
  };

  const mappedPage = staticPathToPage[segments[0] || ""];
  if (mappedPage) {
    return { page: mappedPage };
  }

  const route = segments[0] as Page | undefined;
  if (route && route in PAGE_PATHS) {
    return { page: route };
  }

  return { page: "home" };
};

const buildPathForPage = (
  page: Page,
  navFilters: { category?: string; subCategory?: string } = {},
  productId?: string,
) => {
  if (page === "product") {
    return productId ? `/product/${productId}` : "/shop";
  }

  const basePath = PAGE_PATHS[page as Exclude<Page, "product">] || "/";
  if (page !== "shop") {
    return basePath;
  }

  const searchParams = new URLSearchParams();
  if (navFilters.category) {
    searchParams.set("category", navFilters.category);
  }
  if (navFilters.subCategory) {
    searchParams.set("subCategory", navFilters.subCategory);
  }

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
};

interface AppContentProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const AppContent: React.FC<AppContentProps> = ({
  orders,
  setOrders,
  products,
  setProducts,
}) => {
  const initialLocation = getLocationSnapshot();
  const [currentPage, setCurrentPage] = useState<Page>(initialLocation.page);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shopFilters, setShopFilters] = useState<ShopFilters>({
    colors: [],
    sizes: [],
    materials: [],
    ...(initialLocation.page === "shop" ? initialLocation.shopFilters : {}),
  });

  const [contentKey, setContentKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotificationCenter();
  const { isAuthenticated, token } = useAuth();

  // Update API token whenever auth state changes
  useEffect(() => {
    api.setAuthToken(token || null);
  }, [token]);

  // Data state
  // products and orders are now received as props from AppWrapper
  const [homePageContent, setHomePageContent] =
    useLocalStorage<HomePageContent>(
      "ezooze_home_content",
      INITIAL_HOME_CONTENT,
    );
  const [aboutPageContent, setAboutPageContent] =
    useLocalStorage<AboutPageContent>(
      "ezooze_about_content",
      INITIAL_ABOUT_CONTENT,
    );
  const [careersPageContent, setCareersPageContent] =
    useLocalStorage<CareersPageContent>(
      "ezooze_careers_content",
      INITIAL_CAREERS_CONTENT,
    );
  const [pressPageContent, setPressPageContent] =
    useLocalStorage<PressPageContent>(
      "ezooze_press_content",
      INITIAL_PRESS_CONTENT,
    );
  const [faqPageContent, setFaqPageContent] = useLocalStorage<FAQPageContent>(
    "ezooze_faq_content",
    INITIAL_FAQ_CONTENT,
  );
  const [privacyPolicyPageContent, setPrivacyPolicyPageContent] =
    useLocalStorage<PrivacyPolicyPageContent>(
      "ezooze_privacy_policy_content",
      INITIAL_PRIVACY_POLICY_CONTENT,
    );
  const [termsOfServicePageContent, setTermsOfServicePageContent] =
    useLocalStorage<TermsOfServicePageContent>(
      "ezooze_terms_content",
      INITIAL_TERMS_CONTENT,
    );
  const [storeSettings, setStoreSettings] = useLocalStorage<StoreSettings>(
    "ezooze_settings",
    INITIAL_STORE_SETTINGS,
  );

  const [users, setUsers] = useLocalStorage<User[]>("ezooze_users", []);
  const [discountCodes, setDiscountCodes] = useLocalStorage<DiscountCode[]>(
    "ezooze_discounts",
    MOCK_DISCOUNTS,
  );
  const [productAttributes, setProductAttributes] =
    useLocalStorage<ProductAttributes>("ezooze_attributes", {
      subCategories: [],
      colors: [],
      materials: [],
      sizes: [],
    });
  const [navLinks, setNavLinks] = useLocalStorage<NavLink[]>(
    "ezooze_nav_links",
    INITIAL_NAV_LINKS,
  );
  const [appliedDiscount, setAppliedDiscount] =
    useLocalStorage<DiscountCode | null>("ezooze_applied_discount", null);
  const [orderToTrack, setOrderToTrack] = useState<Order | null>(null);

  const newArrivals = products.filter((p) => p.featured);

  useEffect(() => {
    const loadData = async () => {
      // Set the auth token for all API requests
      api.setAuthToken(token || null);

      setIsLoading(true);
      try {
        // Try to fetch data from API (Mock or DB)
        // If DB is forced but server down, this will fail.
        // If Mock is used, this will succeed with mock data.
        try {
          const fetchedUsers = await api.getUsers();
          setUsers(fetchedUsers);
        } catch (e) {
          console.warn(
            "Could not fetch users from API, using local/mock defaults.",
          );
        }

        try {
          const fetchedProducts = await api.getProducts();
          setProducts(sanitizeProductsForDisplay(fetchedProducts || []));
        } catch (e) {
          console.warn(
            "Could not fetch products from API, using local/mock defaults.",
          );
        }

        try {
          const fetchedOrders = await api.getOrders();
          if (fetchedOrders && fetchedOrders.length > 0) {
            setOrders(fetchedOrders);
          }
        } catch (e) {
          console.warn(
            "Could not fetch orders from API, using local/mock defaults.",
          );
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [setProducts, setOrders, setUsers, isAuthenticated, token]);

  const handleUpdateUser = async (
    userToUpdate: Partial<User> & { id: string },
  ) => {
    try {
      const updatedUser = await api.updateUser(userToUpdate.id, userToUpdate);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  useEffect(() => {
    // One-time initialization of attributes from existing products if attributes are empty
    if (productAttributes.subCategories.length === 0 && products.length > 0) {
      const allSubCategories = [
        ...new Set(products.map((p) => p.subCategory).filter(Boolean)),
      ];
      const allColors = [
        ...new Set(products.flatMap((p) => p.colors).filter(Boolean)),
      ];
      const allMaterials = [
        ...new Set(products.map((p) => p.material).filter(Boolean)),
      ];
      const allSizes = [
        ...new Set(products.flatMap((p) => p.sizes).filter(Boolean)),
      ];

      setProductAttributes({
        subCategories: allSubCategories.sort(),
        colors: allColors.sort(),
        materials: allMaterials.sort(),
        sizes: allSizes.sort(),
      });
    }
  }, [products, productAttributes, setProductAttributes]);

  const syncFromLocation = useCallback(() => {
    const locationSnapshot = getLocationSnapshot();
    setCurrentPage(locationSnapshot.page);

    if (locationSnapshot.page === "shop") {
      setShopFilters((previousFilters) => ({
        ...previousFilters,
        colors: [],
        sizes: [],
        materials: [],
        maxPrice: locationSnapshot.shopFilters?.maxPrice,
        category: locationSnapshot.shopFilters?.category,
        subCategory: locationSnapshot.shopFilters?.subCategory,
      }));
      setSelectedProduct(null);
      return;
    }

    if (locationSnapshot.page === "product" && locationSnapshot.productId) {
      const matchedProduct = products.find(
        (product) => String(product.id) === locationSnapshot.productId,
      );
      setSelectedProduct(matchedProduct || null);
    } else {
      setSelectedProduct(null);
    }
  }, [products]);

  useEffect(() => {
    syncFromLocation();

    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [syncFromLocation]);

  const usePageTransition = (page: Page) => {
    useLayoutEffect(() => {
      window.scrollTo(0, 0);
    }, [page, selectedProduct]);
  };

  const navigateTo = (
    page: Page,
    navFilters: { category?: string; subCategory?: string } = {},
  ) => {
    // Log page visit
    logger.log(page, "navigate");

    const nextPath = buildPathForPage(page, navFilters);
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath !== currentPath) {
      window.history.pushState({ page, navFilters }, "", nextPath);
    }

    setCurrentPage(page);
    setContentKey((prevKey) => prevKey + 1);

    if (page === "shop") {
      // When navigating from the navbar, reset all filters and apply the new category/sub-category.
      setShopFilters({
        ...navFilters,
        colors: [],
        sizes: [],
        materials: [],
        maxPrice: undefined,
      });
      setSelectedProduct(null);
    } else {
      if (currentPage === "shop") {
        setShopFilters({
          colors: [],
          sizes: [],
          materials: [],
          maxPrice: undefined,
        });
      }
      setSelectedProduct(null);
    }
  };

  const viewProduct = (product: Product) => {
    const nextPath = buildPathForPage("product", {}, String(product.id));
    if (`${window.location.pathname}${window.location.search}` !== nextPath) {
      window.history.pushState(
        { page: "product", productId: product.id },
        "",
        nextPath,
      );
    }
    setSelectedProduct(product);
    setCurrentPage("product");
    setContentKey((prevKey) => prevKey + 1);
  };

  const viewProductOnSite = (product: Product) => {
    viewProduct(product);
  };

  usePageTransition(currentPage);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-cream dark:bg-brand-charcoal">
        <div className="text-center animate-pulse">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-5xl font-serif font-bold tracking-widest text-brand-charcoal dark:text-brand-cream">
              ezooze
            </h1>
            <div className="h-0.5 w-16 bg-brand-gold my-4"></div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
              Lasting Elegance
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (currentPage === "product" && selectedProduct) {
      return (
        <ProductDetail
          product={selectedProduct}
          products={products}
          viewProduct={viewProduct}
          storeSettings={storeSettings}
        />
      );
    }
    switch (currentPage) {
      case "dashboard":
        return <Dashboard navigateTo={navigateTo} orders={orders} />;
      case "home":
        return (
          <Home
            navigateTo={navigateTo}
            newArrivals={newArrivals}
            viewProduct={viewProduct}
            homeContent={homePageContent}
            storeSettings={storeSettings}
          />
        );
      case "shop":
        return (
          <Shop
            products={products}
            viewProduct={viewProduct}
            filters={shopFilters}
            setFilters={setShopFilters}
            navLinks={navLinks}
            productAttributes={productAttributes}
            storeSettings={storeSettings}
          />
        );
      case "cart":
        return (
          <Cart
            navigateTo={navigateTo}
            viewProduct={viewProduct}
            discountCodes={discountCodes}
            appliedDiscount={appliedDiscount}
            setAppliedDiscount={setAppliedDiscount}
            storeSettings={storeSettings}
          />
        );
      case "checkout":
        return (
          <Checkout
            navigateTo={navigateTo}
            orders={orders}
            setOrders={setOrders}
            discountCodes={discountCodes}
            setDiscountCodes={setDiscountCodes}
            appliedDiscount={appliedDiscount}
            setAppliedDiscount={setAppliedDiscount}
            storeSettings={storeSettings}
            setOrderToTrack={setOrderToTrack}
          />
        );
      case "orderSuccess":
        return (
          <OrderSuccessPage
            order={orderToTrack}
            navigateTo={navigateTo}
            currency={storeSettings.currency}
          />
        );
      case "login":
        return <Login navigateTo={navigateTo} />;
      case "register":
        return <Register navigateTo={navigateTo} />;
      case "forgotPassword":
        return <ForgotPassword navigateTo={navigateTo} />;
      case "about":
        return <AboutPage content={aboutPageContent} />;
      case "careers":
        return <CareersPage content={careersPageContent} />;
      case "press":
        return <PressPage content={pressPageContent} />;
      case "contact":
        return <ContactPage />;
      case "faq":
        return <FAQPage content={faqPageContent} />;
      case "shipping":
        return <ShippingReturnsPage storeSettings={storeSettings} />;
      case "privacy":
        return <PrivacyPolicyPage content={privacyPolicyPageContent} />;
      case "terms":
        return <TermsOfServicePage content={termsOfServicePageContent} />;
      case "orderTracking":
        return (
          <OrderTrackingPage
            orders={orders}
            navigateTo={navigateTo}
            orderToTrack={orderToTrack}
            setOrderToTrack={setOrderToTrack}
            storeSettings={storeSettings}
          />
        );
      case "admin":
        return (
          <AdminPage
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
          />
        );
      default:
        return (
          <Home
            navigateTo={navigateTo}
            newArrivals={newArrivals}
            viewProduct={viewProduct}
            homeContent={homePageContent}
            storeSettings={storeSettings}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentPage !== "admin" && (
        <Navbar
          navigateTo={navigateTo}
          navLinks={navLinks}
          currentPage={currentPage}
        />
      )}
      <main className={`flex-grow ${currentPage !== "admin" ? "pt-16" : ""}`}>
        <div key={contentKey}>{renderContent()}</div>
      </main>
      {currentPage !== "admin" && (
        <Footer navigateTo={navigateTo} storeSettings={storeSettings} />
      )}
    </div>
  );
};

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
  const [orders, setOrders] = useLocalStorage<Order[]>("ezooze_orders", []);
  const [products, setProducts] = useLocalStorage<Product[]>(
    "ezooze_products",
    [],
  );
  const { addNotification } = useNotificationCenter();

  useEffect(() => {
    const cleanupFlag = "ezooze_demo_cleanup_v2";
    if (localStorage.getItem(cleanupFlag) === "true") {
      setProducts((prev) => sanitizeProductsForDisplay(prev));
      return;
    }

    localStorage.removeItem("ezooze_products");
    localStorage.removeItem("ezooze_orders");
    localStorage.removeItem("ezooze_users");
    setProducts([]);
    setOrders([]);
    localStorage.setItem(cleanupFlag, "true");
  }, [setProducts, setOrders]);

  const handleRealtimeEvent = useCallback(
    (event: { type: string; payload: any }) => {
      if (event.type === "ORDER_CREATED") {
        // Merge new order if it doesn't exist
        setOrders((prev) => {
          if (prev.some((o) => o.id === event.payload.id)) return prev;
          return [event.payload, ...prev];
        });
        addNotification(
          "order",
          `New Order #${event.payload.id} from ${event.payload.customerName}`,
          { section: "orders" },
        );
      } else if (event.type === "ORDER_UPDATED") {
        setOrders((prev) =>
          prev.map((o) => (o.id === event.payload.id ? event.payload : o)),
        );
      }
    },
    [setOrders, addNotification],
  );

  return (
    <RealtimeProvider onEvent={handleRealtimeEvent}>
      <AppContent
        orders={orders}
        setOrders={setOrders}
        products={products}
        setProducts={setProducts}
      />
    </RealtimeProvider>
  );
};

export default App;
