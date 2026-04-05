
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page, Product, HeroSlide, MidBannerContent, HomePageContent, CategoryShowcaseItem, StoreSettings } from '../types';
import { useInView } from '../hooks/useInView';
import { ProductCard } from '../components/ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';

interface HomeProps {
  navigateTo: (page: Page, filters?: { category?: string; subCategory?: string }) => void;
  newArrivals: Product[];
  viewProduct: (product: Product) => void;
  homeContent: HomePageContent;
  storeSettings: StoreSettings;
}

const HeroSlider: React.FC<{ navigateTo: HomeProps['navigateTo'], slides: HeroSlide[] }> = ({ navigateTo, slides }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideDuration = 6000; // 6 seconds per slide for a relaxed pace

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, slideDuration);

    return () => clearTimeout(timer);
  }, [activeSlide, isPaused, slides.length]);

  if (!slides || slides.length === 0) {
    return (
        <div className="relative w-full h-[85vh] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <p className="text-gray-500 font-serif italic">Elegance is loading...</p>
        </div>
    );
  }

  return (
    <div 
        className="relative w-full h-[85vh] overflow-hidden bg-brand-charcoal" 
        onMouseEnter={() => setIsPaused(true)} 
        onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-2000 ease-in-out ${index === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${index === activeSlide ? 'scale-110' : 'scale-100'}`}
          />
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
        </div>
      ))}
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 text-white max-w-5xl mx-auto">
        <div key={activeSlide} className="flex flex-col items-center">
          {/* Fixed: Removed reference to undefined 'slide' variable */}
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-brand-gold animate-fadeInUp">{slides[activeSlide].subtitle}</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight mt-6 mb-8 animate-fadeInUp delay-200 drop-shadow-lg">
            {slides[activeSlide].title}
          </h1>
          <div className="animate-fadeInUp delay-500">
            <button
              onClick={() => navigateTo('shop', slides[activeSlide].filters)}
              className="group relative px-10 py-4 bg-transparent overflow-hidden border border-white/30 hover:border-white/80 transition-colors duration-300"
            >
              <div className="absolute inset-0 w-0 bg-white transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
              <span className="relative text-sm font-bold uppercase tracking-widest text-white group-hover:text-white transition-colors duration-300">
                {slides[activeSlide].buttonText}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Minimalist Progress Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex space-x-4">
        {slides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setActiveSlide(index)} 
            className="group w-12 h-2 py-2 flex items-center justify-center"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`w-full h-[2px] transition-all duration-500 relative overflow-hidden bg-white/30 group-hover:h-[3px] group-hover:bg-white/50`}>
                {index === activeSlide && !isPaused && (
                    <div className="absolute top-0 left-0 h-full bg-brand-gold animate-progressBar" style={{animationDuration: `${slideDuration}ms`}}></div>
                )}
                {index === activeSlide && isPaused && (
                    <div className="absolute top-0 left-0 h-full w-full bg-brand-gold"></div>
                )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const CategoryCard: React.FC<{ title: string, imageUrl: string, onClick: () => void }> = ({ title, imageUrl, onClick }) => (
    <div className="group relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={onClick}>
        <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <h3 className="text-4xl font-serif font-light tracking-wide transition-transform duration-500 transform group-hover:-translate-y-4">{title}</h3>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 delay-100">
                <span className="inline-block px-6 py-2 border-b border-white text-xs font-bold uppercase tracking-widest hover:text-brand-gold hover:border-brand-gold transition-colors">
                    Discover
                </span>
            </div>
        </div>
    </div>
);

const CategoryShowcase: React.FC<{ navigateTo: HomeProps['navigateTo'], categories: CategoryShowcaseItem[] }> = ({ navigateTo, categories }) => {
    const [ref, isInView] = useInView({ threshold: 0.1 });
    return (
        <section ref={ref} className={`py-20 sm:py-32 scroll-animate ${isInView ? 'is-visible' : ''}`}>
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <span className="text-brand-gold font-sans text-xs font-bold uppercase tracking-[0.2em]">Collections</span>
                    <h2 className="mt-4 text-4xl font-serif font-medium text-brand-charcoal dark:text-brand-cream sm:text-5xl">Curated Categories</h2>
                </div>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((cat) => (
                       <CategoryCard key={cat.title} title={cat.title} imageUrl={cat.imageUrl} onClick={() => navigateTo('shop', cat.filters)} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const NewArrivalsPanel: React.FC<{ products: Product[], viewProduct: (product: Product) => void, storeSettings: StoreSettings }> = ({ products, viewProduct, storeSettings }) => {
    const [ref, isInView] = useInView({ threshold: 0.1 });
    const scrollContainer = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = useCallback(() => {
        if (scrollContainer.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const currentContainer = scrollContainer.current;
        if (currentContainer) {
            checkScrollability();
            currentContainer.addEventListener('scroll', checkScrollability);
            
            const resizeObserver = new ResizeObserver(checkScrollability);
            resizeObserver.observe(currentContainer);

            return () => {
                currentContainer.removeEventListener('scroll', checkScrollability);
                resizeObserver.unobserve(currentContainer);
            };
        }
    }, [checkScrollability, products]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = scrollContainer.current.clientWidth * 0.6;
            scrollContainer.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    return (
        <section ref={ref} className={`py-20 sm:py-32 bg-brand-light-gray/50 dark:bg-gray-800/30 scroll-animate ${isInView ? 'is-visible' : ''}`}>
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                    <div>
                        <span className="text-brand-gold font-sans text-xs font-bold uppercase tracking-[0.2em]">Fresh In</span>
                        <h2 className="mt-3 text-4xl font-serif font-medium text-brand-charcoal dark:text-brand-cream">New Arrivals</h2>
                    </div>
                    <div className="flex items-center space-x-4 mt-6 md:mt-0">
                         <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            aria-label="Scroll left"
                            className="p-4 rounded-full border border-gray-300 dark:border-gray-600 text-brand-charcoal dark:text-brand-cream hover:border-brand-gold hover:text-brand-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            aria-label="Scroll right"
                            className="p-4 rounded-full border border-gray-300 dark:border-gray-600 text-brand-charcoal dark:text-brand-cream hover:border-brand-gold hover:text-brand-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="relative -mx-4 px-4">
                     <div ref={scrollContainer} className="flex space-x-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8">
                        {products.length > 0 ? products.map((product) => (
                           <div key={product.id} className="snap-start flex-shrink-0 w-72 md:w-80">
                               <ProductCard product={product} onClick={() => viewProduct(product)} storeSettings={storeSettings} />
                           </div>
                        )) : (
                            <div className="w-full text-center py-16 text-gray-500 font-serif italic">
                                No featured products at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
};

const MidPageBanner: React.FC<{ navigateTo: HomeProps['navigateTo'], content: MidBannerContent }> = ({ navigateTo, content }) => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    return (
        <section ref={ref} className={`relative h-[600px] flex items-center justify-center overflow-hidden scroll-animate ${isInView ? 'is-visible' : ''}`}>
            <div className="absolute inset-0">
                <img 
                    src={content.imageUrl} 
                    alt={content.title} 
                    className="w-full h-full object-cover object-center transition-transform duration-[10s] ease-linear scale-105 hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40"></div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
                <h2 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-6">{content.title}</h2>
                <p className="text-lg md:text-xl font-light opacity-90 max-w-2xl mx-auto leading-relaxed">
                    {content.subtitle}
                </p>
                <div className="mt-12">
                     <button
                        onClick={() => navigateTo('shop')}
                        className="px-12 py-4 bg-white text-brand-charcoal text-sm font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-colors duration-300 shadow-lg"
                    >
                        {content.buttonText}
                    </button>
                </div>
            </div>
        </section>
    );
};

export const Home: React.FC<HomeProps> = ({ navigateTo, newArrivals, viewProduct, homeContent, storeSettings }) => {
  const { heroSlides, midBanner, categoryShowcase } = homeContent;
  return (
    <div className="animate-fadeIn">
        <HeroSlider navigateTo={navigateTo} slides={heroSlides} />
        <NewArrivalsPanel products={newArrivals} viewProduct={viewProduct} storeSettings={storeSettings} />
        <MidPageBanner navigateTo={navigateTo} content={midBanner} />
        <CategoryShowcase navigateTo={navigateTo} categories={categoryShowcase} />
    </div>
  );
};
