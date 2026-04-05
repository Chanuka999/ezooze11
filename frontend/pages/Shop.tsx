
import React, { useMemo, useState, useEffect } from 'react';
import { Product, NavLink, ProductAttributes, StoreSettings } from '../types';
import { ProductCard } from '../components/ProductCard';
import { FilterIcon, ChevronDownIcon, CloseIcon } from '../components/icons';
import { formatPrice } from '../utils/currency';
import { QuickViewModal } from '../components/QuickViewModal';

type ShopFilters = {
  category?: string;
  subCategory?: string;
  maxPrice?: number;
  colors: string[];
  sizes: string[];
  materials: string[];
};

interface ShopProps {
  products: Product[];
  viewProduct: (product: Product) => void;
  filters: ShopFilters;
  setFilters: React.Dispatch<React.SetStateAction<ShopFilters>>;
  navLinks: NavLink[];
  productAttributes: ProductAttributes;
  storeSettings: StoreSettings;
}

// Helper to get facet counts from a product list
const getFacetCounts = (products: Product[]) => {
    const counts = {
        colors: {} as Record<string, number>,
        sizes: {} as Record<string, number>,
        materials: {} as Record<string, number>,
        maxPrice: 0
    };
    
    if (products.length === 0) return counts;

    products.forEach(p => {
        if (p.price > counts.maxPrice) counts.maxPrice = p.price;
        
        p.colors.forEach(c => {
            if (c) counts.colors[c] = (counts.colors[c] || 0) + 1;
        });
        p.sizes.forEach(s => {
            if (s) counts.sizes[s] = (counts.sizes[s] || 0) + 1;
        });
        if (p.material) {
            counts.materials[p.material] = (counts.materials[p.material] || 0) + 1;
        }
    });
    
    return counts;
};

const FilterSidebar: React.FC<{
    filters: ShopProps['filters'],
    setFilters: ShopProps['setFilters'],
    clearFilters: () => void,
    navLinks: NavLink[],
    storeSettings: StoreSettings,
    facets: ReturnType<typeof getFacetCounts>
}> = ({ filters, setFilters, clearFilters, navLinks, storeSettings, facets }) => {

    const [openSections, setOpenSections] = useState({
        category: true,
        price: true,
        colors: true,
        sizes: true,
        materials: true,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Round max price up to nearest 1000 for slider
    const sliderMax = Math.ceil((facets.maxPrice || 10000) / 1000) * 1000;
    const currentPrice = filters.maxPrice ?? sliderMax;
    
    const categoryStructure = useMemo(() => {
        const structure: Record<string, { name: string, slug: string }[]> = {};
        navLinks.forEach(link => {
            if (link.filters?.category && link.children) {
                const categoryKey = link.filters.category as 'men' | 'women' | 'unisex' | 'sportswear';
                structure[categoryKey] = link.children
                    .map(child => ({
                        name: child.name,
                        slug: child.filters.subCategory || ''
                    }))
                    .filter(c => c.slug);
            }
        });
        return structure;
    }, [navLinks]);

    const handleFilterToggle = (key: 'colors' | 'sizes' | 'materials', value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter(v => v !== value)
                : [...prev[key], value]
        }));
    };

    const handleCategorySelect = (category?: string, subCategory?: string) => {
        setFilters(prev => ({...prev, category, subCategory, maxPrice: undefined }));
        // Reset pagination or scroll on category change is handled in parent usually, 
        // but resetting other filters might be desired? For now we keep them.
    };

    const FilterSection: React.FC<{title: string, sectionKey: keyof typeof openSections, children: React.ReactNode}> = ({title, sectionKey, children}) => (
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="-my-3 flow-root">
                <button type="button" onClick={() => toggleSection(sectionKey)} className="flex w-full items-center justify-between bg-white dark:bg-brand-charcoal py-3 text-sm text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-200">
                    <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                    <span className="ml-6 flex items-center">
                        <ChevronDownIcon className={`h-5 w-5 transform transition-transform duration-200 ${openSections[sectionKey] ? 'rotate-180' : ''}`} />
                    </span>
                </button>
            </h3>
            <div className={`pt-6 overflow-hidden transition-all duration-300 ease-in-out ${openSections[sectionKey] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
    
    return (
         <form className="p-4 lg:p-0">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
                <button type="button" onClick={clearFilters} className="text-sm font-medium text-brand-gold hover:text-yellow-600">Clear all</button>
            </div>
            
            <FilterSection title="Category" sectionKey="category">
                <ul className="space-y-2">
                    {Object.entries(categoryStructure).map(([cat, subCats]: [string, { name: string, slug: string }[]]) => (
                        <li key={cat}>
                           <button type="button" onClick={() => handleCategorySelect(cat)} className={`font-medium capitalize ${filters.category === cat && !filters.subCategory ? 'text-brand-gold' : 'hover:text-brand-gold'}`}>{cat}</button>
                           {filters.category === cat && (
                                <ul className="pl-4 mt-2 space-y-2">
                                    <li>
                                        <button 
                                            type="button"
                                            onClick={() => handleCategorySelect(cat)}
                                            className={`text-sm ${!filters.subCategory ? 'text-brand-gold font-medium' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                        >
                                            All {cat}
                                        </button>
                                    </li>
                                    {subCats.map(subCat => (
                                        <li key={subCat.slug}>
                                            <button 
                                                type="button" 
                                                onClick={() => handleCategorySelect(cat, subCat.slug)} 
                                                className={`text-sm ${filters.subCategory === subCat.slug ? 'text-brand-gold font-medium' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                            >
                                                {subCat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                           )}
                        </li>
                    ))}
                </ul>
            </FilterSection>

            <FilterSection title="Price" sectionKey="price">
                <div className="space-y-4">
                    <input
                        type="range"
                        min={0}
                        max={sliderMax}
                        value={currentPrice}
                        step={1000}
                        onChange={(e) => setFilters(prev => ({...prev, maxPrice: Number(e.target.value)}))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatPrice(0, storeSettings.currency)}</span>
                        <span>{formatPrice(currentPrice, storeSettings.currency)}</span>
                    </div>
                </div>
            </FilterSection>

            <FilterSection title="Colors" sectionKey="colors">
                <div className="flex flex-wrap gap-3">
                    {Object.entries(facets.colors).sort().map(([color, count]) => (
                        <button 
                            type="button" 
                            key={color} 
                            onClick={() => handleFilterToggle('colors', color)} 
                            className={`group relative w-8 h-8 rounded-full border border-gray-300 dark:border-gray-500 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold ${filters.colors.includes(color) ? 'ring-2 ring-offset-2 ring-brand-gold' : ''}`} 
                            style={{backgroundColor: color.toLowerCase()}} 
                            aria-label={`${color} (${count})`}
                            title={`${color} (${count})`}
                        >
                            <span className="sr-only">{color}</span>
                        </button>
                    ))}
                </div>
            </FilterSection>

             <FilterSection title="Sizes" sectionKey="sizes">
                <div className="flex flex-wrap gap-2">
                    {Object.entries(facets.sizes).sort().map(([size, count]) => (
                        <button 
                            type="button" 
                            key={size} 
                            onClick={() => handleFilterToggle('sizes', size)} 
                            className={`px-3 py-1 border rounded-md text-sm transition-colors flex items-center space-x-1 
                                ${filters.sizes.includes(size) 
                                    ? 'bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal border-transparent' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                        >
                            <span>{size}</span>
                            <span className={`text-xs ${filters.sizes.includes(size) ? 'text-gray-300 dark:text-gray-500' : 'text-gray-400'}`}>({count})</span>
                        </button>
                    ))}
                </div>
            </FilterSection>

             <FilterSection title="Materials" sectionKey="materials">
                <div className="flex flex-col gap-2">
                    {Object.entries(facets.materials).sort().map(([material, count]) => (
                        <button 
                            type="button" 
                            key={material} 
                            onClick={() => handleFilterToggle('materials', material)} 
                            className={`flex items-center justify-between px-3 py-2 border rounded-md text-sm transition-colors 
                                ${filters.materials.includes(material) 
                                    ? 'bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal border-transparent' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                        >
                            <span>{material}</span>
                            <span className={`text-xs ${filters.materials.includes(material) ? 'text-gray-300 dark:text-gray-500' : 'text-gray-400'}`}>{count}</span>
                        </button>
                    ))}
                </div>
            </FilterSection>
        </form>
    );
};

const FilterPill: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="flex items-center bg-brand-light-gray dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-medium text-brand-charcoal dark:text-brand-cream transition-all duration-200 animate-fadeIn">
    {label}
    <button onClick={onRemove} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none">
      <CloseIcon className="h-3 w-3" />
    </button>
  </span>
);

const PRODUCTS_PER_PAGE = 9;

export const Shop: React.FC<ShopProps> = ({ products, viewProduct, filters, setFilters, navLinks, storeSettings }) => {
  
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [visibleProductsCount, setVisibleProductsCount] = useState(PRODUCTS_PER_PAGE);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);


  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isFilterDrawerOpen]);

  // Reset visible products when filters or sorting changes
  useEffect(() => {
    setVisibleProductsCount(PRODUCTS_PER_PAGE);
  }, [filters, sortBy]);

  // 1. Determine the Base Set of products (Filtered only by Category/SubCategory)
  // This set represents the "Universe" of the current view, used to calculate available Facets.
  const baseProducts = useMemo(() => {
      return products.filter(p => {
        if (filters.category && p.category !== filters.category) return false;
        if (filters.subCategory) {
            // Handle both slugified and raw subcategory matches for robustness
            const pSub = p.subCategory.toLowerCase();
            const filterSub = filters.subCategory.toLowerCase();
            if (pSub !== filterSub && pSub.replace(/ /g,'-') !== filterSub) return false;
        }
        return true;
      });
  }, [products, filters.category, filters.subCategory]);

  // 2. Calculate Facets (Available options and counts) based on the Base Set
  const facets = useMemo(() => getFacetCounts(baseProducts), [baseProducts]);

  // 3. Determine Final Display Set (Apply refined filters: Price, Color, Size, Material)
  const filteredProducts = useMemo(() => {
    let filtered = baseProducts.filter(p => {
        if (filters.maxPrice && p.price > filters.maxPrice) return false;
        if (filters.colors.length > 0 && !p.colors.some(c => filters.colors.includes(c))) return false;
        if (filters.sizes.length > 0 && !p.sizes.some(s => filters.sizes.includes(s))) return false;
        if (filters.materials.length > 0 && !filters.materials.includes(p.material)) return false;
        return true;
    });

    const sorted = [...filtered];
    switch(sortBy) {
        case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
        case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
        case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
        default: break;
    }
    return sorted;

  }, [baseProducts, filters, sortBy]);
  
  const productsToShow = useMemo(() => {
    return filteredProducts.slice(0, visibleProductsCount);
  }, [filteredProducts, visibleProductsCount]);

  // Calculate active filters count for UI badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category || filters.subCategory) count++;
    if (filters.maxPrice && facets.maxPrice > 0 && filters.maxPrice < facets.maxPrice) count++;
    count += filters.colors.length;
    count += filters.sizes.length;
    count += filters.materials.length;
    return count;
  }, [filters, facets.maxPrice]);

  const removeFilter = (key: keyof Omit<ShopFilters, 'subCategory'>, value?: any) => {
    setFilters(prev => {
        const newFilters = { ...prev };
        if (key === 'category') {
            newFilters.category = undefined;
            newFilters.subCategory = undefined; // Also clear subcategory when main category is removed
        } else if (key === 'maxPrice') {
            newFilters.maxPrice = undefined;
        } else if (key === 'colors' || key === 'sizes' || key === 'materials') {
            newFilters[key] = (newFilters[key] as string[]).filter(v => v !== value);
        }
        return newFilters;
    });
  };

  const clearFilters = () => {
        setFilters({
            category: undefined,
            subCategory: undefined,
            maxPrice: undefined,
            colors: [],
            sizes: [],
            materials: [],
        });
    };
  
  const getPageTitle = () => {
    if (filters.subCategory && filters.category) {
        const categoryName = filters.category === 'sportswear' ? 'Sportswear' : `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}'s`;
        const subCategoryName = filters.subCategory.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return `${categoryName} / ${subCategoryName}`;
    }
    if (filters.category) {
        if (filters.category === 'sportswear') return "Sportswear Collection";
        if (filters.category === 'unisex') return "Unisex Collection";
        return `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}'s Collection`;
    }
    return "All Products";
  }
  
  const getCategoryFilterLabel = () => {
    if (filters.subCategory && filters.category) {
        const navLink = navLinks.find(l => l.filters?.category === filters.category);
        const subCat = navLink?.children?.find(c => c.filters.subCategory === filters.subCategory);
        return subCat?.name || filters.subCategory;
    }
    if (filters.category) {
        const navLink = navLinks.find(l => l.filters?.category === filters.category);
        return navLink?.name || filters.category;
    }
    return '';
  }

  const SortingDropdown = () => (
      <div className="flex items-center">
          <label htmlFor="sort-by" className="sr-only">Sort by</label>
          <select
              id="sort-by"
              name="sort-by"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:ring-brand-gold focus:border-brand-gold text-brand-charcoal dark:text-brand-cream"
          >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical: A-Z</option>
              <option value="name-desc">Alphabetical: Z-A</option>
          </select>
      </div>
  );

  const handleQuickView = (product: Product) => {
      setQuickViewProduct(product);
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        
        {/* Mobile filter drawer */}
        <div className={`fixed inset-0 bg-black bg-opacity-25 z-[60] transition-opacity lg:hidden ${isFilterDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsFilterDrawerOpen(false)} aria-hidden="true" />
        <div className={`fixed inset-y-0 left-0 w-full max-w-sm bg-brand-cream dark:bg-brand-charcoal z-[70] transform transition-transform ease-in-out duration-300 lg:hidden ${isFilterDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full flex flex-col">
                <div className="p-4 flex justify-end">
                    <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 -mr-2">
                        <CloseIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <FilterSidebar filters={filters} setFilters={setFilters} clearFilters={clearFilters} navLinks={navLinks} storeSettings={storeSettings} facets={facets} />
                </div>
            </div>
        </div>
        
        <div className="pt-12 text-center">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-brand-charcoal dark:text-brand-cream">{getPageTitle()}</h1>
        </div>

        <section className="pt-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
                {/* Desktop Filters */}
                <div className="hidden lg:block">
                   <FilterSidebar filters={filters} setFilters={setFilters} clearFilters={clearFilters} navLinks={navLinks} storeSettings={storeSettings} facets={facets} />
                </div>

                {/* Product grid */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{filteredProducts.length} Results</p>
                             <button onClick={() => setIsFilterDrawerOpen(true)} className="lg:hidden relative flex items-center text-sm font-medium p-2 px-4 border rounded-md dark:border-gray-600">
                                <FilterIcon className="h-5 w-5 mr-2" />
                                <span>Filter</span>
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center h-6 w-6 text-xs font-bold text-white bg-brand-gold rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                        <div className="hidden sm:block"><SortingDropdown /></div>
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="py-4 flex flex-wrap gap-2 items-center border-b border-gray-200 dark:border-gray-700">
                            {filters.category && <FilterPill label={`Category: ${getCategoryFilterLabel()}`} onRemove={() => removeFilter('category')} />}
                            {filters.maxPrice && facets.maxPrice > 0 && filters.maxPrice < facets.maxPrice && <FilterPill label={`Price: < ${formatPrice(filters.maxPrice, storeSettings.currency)}`} onRemove={() => removeFilter('maxPrice')} />}
                            {filters.colors.map(c => <FilterPill key={c} label={c} onRemove={() => removeFilter('colors', c)} />)}
                            {filters.sizes.map(s => <FilterPill key={s} label={`Size: ${s}`} onRemove={() => removeFilter('sizes', s)} />)}
                            {filters.materials.map(m => <FilterPill key={m} label={m} onRemove={() => removeFilter('materials', m)} />)}
                            <button onClick={clearFilters} className="text-sm font-medium text-brand-gold hover:text-yellow-600 hover:underline ml-2">Clear all</button>
                        </div>
                    )}
                    
                    <div className="sm:hidden pt-4"><SortingDropdown /></div>

                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 pt-6">
                        {productsToShow.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onClick={() => viewProduct(product)} 
                                storeSettings={storeSettings}
                                onQuickView={handleQuickView}
                            />
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-24">
                            <h3 className="text-xl font-medium">No products found</h3>
                            <p className="mt-2 text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                        </div>
                    )}
                    
                    {visibleProductsCount < filteredProducts.length && (
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => setVisibleProductsCount(prev => prev + PRODUCTS_PER_PAGE)}
                                className="inline-block bg-brand-charcoal border border-transparent rounded-md py-3 px-8 text-base font-medium text-white hover:bg-gray-800 dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 transition-transform transform hover:scale-105"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {quickViewProduct && (
            <QuickViewModal 
                isOpen={!!quickViewProduct} 
                onClose={() => setQuickViewProduct(null)} 
                product={quickViewProduct} 
                storeSettings={storeSettings}
            />
        )}
    </div>
  );
};
