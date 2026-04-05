
import React, { useState, useEffect, useMemo } from 'react';
import { Product, StoreSettings } from '../types';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/currency';
import { CloseIcon, PlusIcon, MinusIcon, ShoppingBagIcon, SpinnerIcon } from './icons';

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    storeSettings: StoreSettings;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ isOpen, onClose, product, storeSettings }) => {
    const { dispatch } = useCart();
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedImage, setSelectedImage] = useState(product.imageUrls[0]);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedSize(product.sizes[0]);
            setSelectedColor(product.colors[0]);
            setQuantity(1);
            setSelectedImage(product.imageUrls[0]);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, product]);

    const getVariantStock = (color: string, size: string) => {
        if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v.color === color && v.size === size);
            return variant ? variant.stock : 0;
        }
        return product.stock;
    };

    const currentVariantStock = useMemo(() => getVariantStock(selectedColor, selectedSize), [product, selectedColor, selectedSize]);
    const isOutOfStock = currentVariantStock === 0;

    useEffect(() => {
        if (quantity > currentVariantStock && currentVariantStock > 0) {
            setQuantity(currentVariantStock);
        }
    }, [currentVariantStock, quantity]);

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        
        setIsAddingToCart(true);
        setTimeout(() => {
            for (let i = 0; i < quantity; i++) {
                dispatch({ type: 'ADD_ITEM', payload: { product, size: selectedSize, color: selectedColor } });
            }
            setIsAddingToCart(false);
            setNotification('Added to Bag!');
            setTimeout(() => {
                setNotification('');
                onClose();
            }, 1000);
        }, 500);
    };

    if (!isOpen) return null;

    const hasDiscount = product.discountPrice && product.discountPrice < product.price;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="fixed inset-0 transition-opacity animate-fadeIn" 
                    aria-hidden="true" 
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div 
                    className="inline-block align-bottom bg-white dark:bg-brand-charcoal rounded-sm text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full animate-scaleIn border border-gray-200 dark:border-gray-700"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            type="button"
                            className="bg-white/80 dark:bg-brand-surface/80 backdrop-blur-sm rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                        {/* Image Section */}
                        <div className="relative h-96 md:h-full bg-gray-100 dark:bg-gray-800">
                            <img 
                                src={selectedImage} 
                                alt={product.name} 
                                className="w-full h-full object-cover object-center" 
                            />
                            {product.imageUrls.length > 1 && (
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
                                    {product.imageUrls.map((img, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedImage === img ? 'bg-brand-gold scale-125' : 'bg-white/50 hover:bg-white'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-brand-charcoal">
                            <h2 className="text-3xl font-serif font-medium text-gray-900 dark:text-white leading-tight">{product.name}</h2>
                            
                            <div className="mt-4 flex items-baseline space-x-4">
                                {hasDiscount ? (
                                    <>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatPrice(product.discountPrice, storeSettings.currency)}</p>
                                        <p className="text-lg text-gray-400 line-through font-light">{formatPrice(product.price, storeSettings.currency)}</p>
                                    </>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price, storeSettings.currency)}</p>
                                )}
                            </div>

                            <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">{product.description}</p>

                            <div className="mt-8 space-y-8">
                                {/* Colors */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-200 mb-3">Color: <span className="text-gray-500 font-normal capitalize ml-1">{selectedColor}</span></h3>
                                    <div className="flex items-center space-x-3">
                                        {product.colors.map((color) => (
                                            <button 
                                                key={color} 
                                                onClick={() => setSelectedColor(color)} 
                                                className={`h-8 w-8 rounded-full border border-gray-200 focus:outline-none transition-transform ${selectedColor === color ? 'ring-2 ring-offset-2 ring-brand-gold scale-110' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: color.toLowerCase() }}
                                                aria-label={color}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Sizes */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-gray-200 mb-3">Size: <span className="text-gray-500 font-normal ml-1">{selectedSize}</span></h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {product.sizes.map((size) => {
                                            const variantStock = getVariantStock(selectedColor, size);
                                            const isVariantOutOfStock = variantStock === 0;
                                            
                                            return (
                                                <button 
                                                    key={size} 
                                                    onClick={() => setSelectedSize(size)} 
                                                    disabled={isVariantOutOfStock}
                                                    className={`py-3 border text-xs font-bold uppercase transition-all duration-200 
                                                        ${isVariantOutOfStock
                                                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                                                            : selectedSize === size 
                                                                ? 'bg-brand-charcoal text-white border-brand-charcoal dark:bg-brand-cream dark:text-brand-charcoal dark:border-brand-cream' 
                                                                : 'bg-transparent text-gray-900 border-gray-300 hover:border-brand-gold dark:text-white dark:border-gray-600'
                                                        }
                                                    `}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quantity & Add to Cart */}
                                <div className="flex items-center space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className={`flex items-center border border-gray-300 dark:border-gray-600 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <button 
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                            className="p-4 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors" 
                                            disabled={quantity <= 1}
                                        >
                                            <MinusIcon className="h-3 w-3"/>
                                        </button>
                                        <span className="px-2 font-medium min-w-[2rem] text-center">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(q => q + 1)} 
                                            className="p-4 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                                            disabled={quantity >= currentVariantStock}
                                        >
                                            <PlusIcon className="h-3 w-3"/>
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart || isOutOfStock}
                                        className={`flex-1 border border-transparent py-4 px-8 flex items-center justify-center text-sm font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-95
                                            ${isOutOfStock 
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500' 
                                                : 'bg-brand-gold text-white hover:bg-yellow-600 shadow-md hover:shadow-lg'
                                            } ${isAddingToCart ? 'opacity-80 cursor-not-allowed' : ''}`}
                                    >
                                        {isAddingToCart ? (
                                            <>
                                                <SpinnerIcon className="h-5 w-5 mr-2 animate-spin" />
                                                Adding...
                                            </>
                                        ) : isOutOfStock ? (
                                            <span>Out of Stock</span>
                                        ) : notification ? (
                                            <span>{notification}</span>
                                        ) : (
                                            <>
                                                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                                                Add to Bag
                                            </>
                                        )}
                                    </button>
                                </div>
                                {!isOutOfStock && currentVariantStock <= 5 && (
                                    <p className="text-xs text-brand-gold font-medium text-center animate-pulse">Only {currentVariantStock} left in stock</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
