
import React from 'react';
import { Product, StoreSettings } from '../types';
import { formatPrice } from '../utils/currency';
import { EyeIcon } from './icons';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  storeSettings: StoreSettings;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, storeSettings, onQuickView }) => {
  // Determine total stock. If variants exist, sum them up. Otherwise use global stock.
  const totalStock = product.variants && product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;

  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const showSaleTag = hasDiscount && !isOutOfStock;

  const handleCardClick = () => {
    if (!isOutOfStock) {
      onClick();
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div
      className={`group relative transition-all duration-500 ease-out bg-white dark:bg-brand-surface rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700 ${
        isOutOfStock
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-2xl hover:-translate-y-1'
      }`}
      onClick={handleCardClick}
    >
      <div className="relative w-full bg-gray-100 dark:bg-gray-800 aspect-[3/4] rounded-t-md overflow-hidden">
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          className={`w-full h-full object-center object-cover transition-transform duration-700 ease-out ${
            !isOutOfStock ? 'group-hover:scale-110' : ''
          } ${isOutOfStock ? 'grayscale' : ''}`}
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>

        {showSaleTag && (
            <div className="absolute top-3 left-3 bg-white text-brand-charcoal text-[10px] font-bold uppercase tracking-wider px-2 py-1 shadow-sm animate-fadeIn">
                Sale
            </div>
        )}
        {isOutOfStock && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-brand-charcoal px-4 py-2 font-serif font-bold text-lg shadow-lg animate-fadeIn">
                Out of Stock
            </div>
        )}
        {isLowStock && (
            <div className="absolute top-3 right-3 bg-brand-gold text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 shadow-sm animate-fadeIn">
                Low Stock
            </div>
        )}
        
        {/* Quick View Button - Slide up and fade in on hover */}
        {!isOutOfStock && onQuickView && (
            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out flex justify-center">
                <button
                    onClick={handleQuickViewClick}
                    className="w-full bg-white/90 backdrop-blur-md text-brand-charcoal hover:bg-brand-charcoal hover:text-white py-3 px-4 text-xs font-bold uppercase tracking-widest shadow-lg transition-colors duration-300 flex items-center justify-center gap-2"
                    aria-label="Quick View"
                >
                    <EyeIcon className="w-4 h-4" /> Quick View
                </button>
            </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-serif text-brand-charcoal dark:text-brand-cream font-medium leading-tight group-hover:text-brand-gold transition-colors duration-300">
            {product.name}
          </h3>
        </div>
        <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {hasDiscount ? (
              <div className="flex items-center space-x-2">
                <span className="text-red-600 dark:text-red-400">{formatPrice(product.discountPrice, storeSettings.currency)}</span>
                <span className="text-gray-400 line-through text-xs">{formatPrice(product.price, storeSettings.currency)}</span>
              </div>
          ) : (
             <span className="text-gray-700 dark:text-gray-200">{formatPrice(product.price, storeSettings.currency)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
