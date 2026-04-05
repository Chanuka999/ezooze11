
import React, { useState, useEffect, useMemo } from 'react';
import { Product, StoreSettings } from '../types';
import { useCart } from '../hooks/useCart';
import { ProductCard } from '../components/ProductCard';
import { PlusIcon, MinusIcon, ShoppingBagIcon, ChevronDownIcon, SpinnerIcon } from '../components/icons';
import { formatPrice } from '../utils/currency';

interface ProductDetailProps {
  product: Product;
  products: Product[];
  viewProduct: (product: Product) => void;
  storeSettings: StoreSettings;
}

const DetailAccordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between py-6 text-left">
                <span className="text-base font-medium text-gray-900 dark:text-white">{title}</span>
                <ChevronDownIcon className={`h-6 w-6 transform text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pb-6 prose dark:prose-invert text-gray-700 dark:text-gray-300 max-w-none">
                    {children}
                </div>
            </div>
        </div>
    );
};


export const ProductDetail: React.FC<ProductDetailProps> = ({ product, products, viewProduct, storeSettings }) => {
  const { dispatch } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [notification, setNotification] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product.imageUrls[0]);
  
  useEffect(() => {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
      setQuantity(1);
      setSelectedImage(product.imageUrls[0]);
  }, [product]);

  // Helper to get stock for current selection
  const getVariantStock = (color: string, size: string) => {
      if (product.variants && product.variants.length > 0) {
          const variant = product.variants.find(v => v.color === color && v.size === size);
          return variant ? variant.stock : 0; // If variant defined but not found, assume 0
      }
      return product.stock; // Fallback to global stock
  };

  const currentVariantStock = useMemo(() => getVariantStock(selectedColor, selectedSize), [product, selectedColor, selectedSize]);
  const isOutOfStock = currentVariantStock === 0;

  // Ensure quantity doesn't exceed stock
  useEffect(() => {
      if (quantity > currentVariantStock && currentVariantStock > 0) {
          setQuantity(currentVariantStock);
      }
  }, [currentVariantStock, quantity]);


  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    setIsAddingToCart(true);
    // Simulate network request
    setTimeout(() => {
        for (let i = 0; i < quantity; i++) {
            dispatch({ type: 'ADD_ITEM', payload: { product, size: selectedSize, color: selectedColor } });
        }
        setIsAddingToCart(false);
        setNotification(`${quantity} x ${product.name} added to cart!`);
        setTimeout(() => setNotification(''), 3000);
    }, 750);
  };

  const recommendedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
    
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="bg-brand-cream dark:bg-brand-charcoal animate-fadeIn">
        {notification && (
            <div className="fixed top-24 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-[60] transition-opacity duration-300">
                {notification}
            </div>
        )}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <nav aria-label="Breadcrumb">
                <ol role="list" className="flex items-center space-x-2">
                    <li><button className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Home</button></li>
                    <li><svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" aria-hidden="true" className="h-5 w-4 text-gray-300 dark:text-gray-600"><path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" /></svg></li>
                    <li><button className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 capitalize">{product.category}</button></li>
                </ol>
            </nav>

            <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-x-12">
            
                <div className="flex flex-col-reverse">
                    <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                        <div className="grid grid-cols-4 gap-6" aria-orientation="horizontal" role="tablist">
                            {product.imageUrls.map((image) => (
                                <button key={image} onClick={() => setSelectedImage(image)} className={`relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white dark:bg-gray-800 text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none ${selectedImage === image ? 'ring-2 ring-offset-2 ring-brand-gold' : 'ring-1 ring-transparent'}`}>
                                    <span className="absolute inset-0 overflow-hidden rounded-md">
                                        <img src={image} alt="" className="h-full w-full object-cover object-center" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="aspect-w-3 aspect-h-4 w-full relative">
                        <img src={selectedImage} alt={product.name} className="h-full w-full object-cover object-center rounded-lg shadow-lg" />
                         {hasDiscount && (
                            <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-md animate-fadeIn">
                                Sale
                            </div>
                        )}
                    </div>
                </div>


                <div className="mt-10 lg:mt-0">
                    <h1 className="text-3xl font-extrabold font-serif tracking-tight text-gray-900 dark:text-white sm:text-4xl">{product.name}</h1>
                    
                    <div className="mt-3">
                      <h2 className="sr-only">Product information</h2>
                      <div className="flex items-baseline space-x-4">
                        {hasDiscount ? (
                            <>
                                <p className="text-3xl tracking-tight text-red-600 dark:text-red-400">{formatPrice(product.discountPrice, storeSettings.currency)}</p>
                                <p className="text-2xl tracking-tight text-gray-500 dark:text-gray-400 line-through">{formatPrice(product.price, storeSettings.currency)}</p>
                            </>
                        ) : (
                            <p className="text-3xl tracking-tight text-gray-900 dark:text-white">{formatPrice(product.price, storeSettings.currency)}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-10">
                        <div>
                            <h3 className="text-sm text-gray-900 dark:text-gray-200 font-medium">Color</h3>
                            <div className="flex items-center space-x-3 mt-4">
                                {product.colors.map((color) => (
                                    <button key={color} onClick={() => setSelectedColor(color)} className={`relative -m-0.5 flex items-center justify-center rounded-full p-0.5 focus:outline-none transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-brand-gold' : ''}`}>
                                        <span style={{ backgroundColor: color.toLowerCase() }} className="h-8 w-8 border border-black border-opacity-10 rounded-full" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10">
                            <h3 className="text-sm text-gray-900 dark:text-gray-200 font-medium">Size</h3>
                            <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4 mt-4">
                                {product.sizes.map((size) => {
                                    const variantStock = getVariantStock(selectedColor, size);
                                    const isVariantOutOfStock = variantStock === 0;
                                    
                                    return (
                                        <button 
                                            key={size} 
                                            onClick={() => setSelectedSize(size)} 
                                            disabled={isVariantOutOfStock}
                                            className={`group relative border rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium uppercase focus:outline-none sm:flex-1 transition-colors
                                                ${isVariantOutOfStock 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 decoration-slate-500 line-through' 
                                                    : selectedSize === size 
                                                        ? 'bg-brand-charcoal text-white dark:bg-brand-cream dark:text-brand-charcoal' 
                                                        : 'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700'
                                                }
                                            `}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-10 flex items-center">
                            <h3 className="text-sm text-gray-900 dark:text-gray-200 font-medium mr-6">Quantity</h3>
                            <div className={`flex items-center border border-gray-300 dark:border-gray-600 rounded-md ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-50" aria-label="Decrease quantity" disabled={quantity <= 1}>
                                    <MinusIcon className="h-5 w-5"/>
                                </button>
                                <span className="px-5 text-base w-14 text-center" aria-live="polite">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white" aria-label="Increase quantity" disabled={quantity >= currentVariantStock}>
                                    <PlusIcon className="h-5 w-5"/>
                                </button>
                            </div>
                            {!isOutOfStock && currentVariantStock <= 5 && (
                                <span className="ml-4 text-sm text-red-600 font-medium">Only {currentVariantStock} left!</span>
                            )}
                        </div>
                    </div>

                    <button 
                        type="button" 
                        onClick={handleAddToCart} 
                        disabled={isAddingToCart || isOutOfStock}
                        className={`mt-10 w-full border border-transparent rounded-md py-4 px-8 flex items-center justify-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-transform transform
                            ${isOutOfStock 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' 
                                : 'bg-brand-charcoal text-white hover:bg-gray-800 dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200 hover:scale-105'
                            }
                        `}
                    >
                        {isAddingToCart ? (
                            <>
                                <SpinnerIcon className="h-6 w-6 mr-3 -ml-1 animate-spin" />
                                Adding...
                            </>
                        ) : isOutOfStock ? (
                            <>Out of Stock</>
                        ) : (
                            <>
                                <ShoppingBagIcon className="h-6 w-6 mr-3" />
                                Add to bag
                            </>
                        )}
                    </button>
                    
                    <div className="mt-12">
                        <DetailAccordion title="Description" defaultOpen={true}>
                            <p>{product.description}</p>
                        </DetailAccordion>
                        <DetailAccordion title="Material & Care">
                            <p><strong>Material:</strong> {product.material}</p>
                            <p><strong>Care:</strong> Machine wash cold, gentle cycle. Tumble dry low. Do not bleach. Iron on low heat if necessary.</p>
                        </DetailAccordion>
                        <DetailAccordion title="Shipping & Returns">
                             <p>
                                {storeSettings.isFreeShippingThresholdActive 
                                    ? `Complimentary standard shipping on orders over ${formatPrice(storeSettings.freeShippingThreshold, storeSettings.currency)}. `
                                    : `Standard shipping is ${formatPrice(storeSettings.standardShippingCost, storeSettings.currency)}. `
                                }
                                Easy 30-day returns. See our Shipping & Returns page for more details.
                            </p>
                        </DetailAccordion>
                    </div>
                </div>
            </div>
        </div>
      
        {recommendedProducts.length > 0 && (
            <div className="bg-brand-light-gray dark:bg-gray-800 mt-24 py-16">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-serif font-bold tracking-tight text-brand-charcoal dark:text-brand-cream">You Might Also Like</h2>
                    <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {recommendedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} onClick={() => viewProduct(p)} storeSettings={storeSettings} />
                    ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};