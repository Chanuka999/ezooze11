import React, { useState, useEffect, useMemo } from "react";
import { Product, StoreSettings } from "../types";
import { useCart } from "../hooks/useCart";
import { ProductCard } from "../components/ProductCard";
import {
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  SpinnerIcon,
} from "../components/icons";
import { formatPrice } from "../utils/currency";

interface ProductDetailProps {
  product: Product;
  products: Product[];
  viewProduct: (product: Product) => void;
  storeSettings: StoreSettings;
}

const DetailAccordion: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left"
      >
        <span className="text-base font-semibold text-zinc-900 dark:text-brand-cream">
          {title}
        </span>
        <ChevronDownIcon
          className={`h-6 w-6 transform text-zinc-700 transition-transform duration-300 dark:text-gray-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div className="pb-6 prose max-w-none text-zinc-800 prose-p:text-zinc-800 prose-strong:text-zinc-900 dark:text-gray-300 dark:prose-p:text-gray-300 dark:prose-strong:text-brand-cream">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  products,
  viewProduct,
  storeSettings,
}) => {
  const { dispatch } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [notification, setNotification] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product.imageUrls[0]);
  const [displayedImage, setDisplayedImage] = useState(product.imageUrls[0]);
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [showNewImage, setShowNewImage] = useState(true);
  const [isMainImageLoading, setIsMainImageLoading] = useState(false);

  useEffect(() => {
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    setSelectedImage(product.imageUrls[0]);
    setDisplayedImage(product.imageUrls[0]);
    setPreviousImage(null);
    setIsCrossfading(false);
    setShowNewImage(true);
    setIsMainImageLoading(false);
  }, [product]);

  useEffect(() => {
    if (selectedImage === displayedImage) return;

    let isCancelled = false;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let frameId: number | undefined;

    setIsMainImageLoading(true);

    const preloadedImage = new Image();
    preloadedImage.src = selectedImage;

    preloadedImage.onload = () => {
      if (isCancelled) return;
      setPreviousImage(displayedImage);
      setDisplayedImage(selectedImage);
      setIsCrossfading(true);
      setShowNewImage(false);

      frameId = requestAnimationFrame(() => {
        if (!isCancelled) {
          setShowNewImage(true);
        }
      });

      fadeTimer = setTimeout(() => {
        if (isCancelled) return;
        setIsCrossfading(false);
        setPreviousImage(null);
      }, 320);

      setIsMainImageLoading(false);
    };

    preloadedImage.onerror = () => {
      if (isCancelled) return;
      setIsMainImageLoading(false);
    };

    return () => {
      isCancelled = true;
      if (fadeTimer) clearTimeout(fadeTimer);
      if (typeof frameId === "number") cancelAnimationFrame(frameId);
    };
  }, [selectedImage, displayedImage]);

  // Helper to get stock for current selection
  const getVariantStock = (color: string, size: string) => {
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(
        (v) => v.color === color && v.size === size,
      );
      return variant ? variant.stock : 0; // If variant defined but not found, assume 0
    }
    return product.stock; // Fallback to global stock
  };

  const currentVariantStock = useMemo(
    () => getVariantStock(selectedColor, selectedSize),
    [product, selectedColor, selectedSize],
  );
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
        dispatch({
          type: "ADD_ITEM",
          payload: { product, size: selectedSize, color: selectedColor },
        });
      }
      setIsAddingToCart(false);
      setNotification(`${quantity} x ${product.name} added to cart!`);
      setTimeout(() => setNotification(""), 3000);
    }, 750);
  };

  const recommendedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const stockLabel = isOutOfStock
    ? "Out of stock"
    : currentVariantStock <= 5
      ? `Only ${currentVariantStock} left`
      : `${currentVariantStock} available`;

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-zinc-900 animate-fadeIn dark:bg-brand-charcoal dark:text-brand-cream">
      {notification && (
        <div className="fixed top-24 right-5 bg-emerald-600 text-white py-3 px-4 rounded-xl shadow-lg z-[60] animate-fadeInUp">
          {notification}
        </div>
      )}

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <nav aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-2 text-sm">
            <li>
              <button className="font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-200 dark:text-gray-400 dark:hover:text-brand-cream">
                Home
              </button>
            </li>
            <li className="text-zinc-300">/</li>
            <li>
              <button className="capitalize font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-200 dark:text-gray-400 dark:hover:text-brand-cream">
                {product.category}
              </button>
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.88fr)_420px] lg:gap-12 xl:gap-16 items-start">
          <div className="animate-fadeInUp delay-100 lg:sticky lg:top-24">
            <div className="hidden lg:flex lg:items-start lg:gap-5">
              <div className="flex flex-col gap-4 pt-2">
                {product.imageUrls.map((image) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border bg-white transition-all duration-300 dark:bg-brand-surface ${selectedImage === image ? "border-zinc-900 shadow-md ring-2 ring-zinc-900/10 dark:border-brand-gold dark:ring-brand-gold/30" : "border-zinc-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-700"}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-[200px] md:h-[500px] lg:h-[600px] object-cover object-center rounded-xl"
                    />
                  </button>
                ))}
              </div>

              <div className="flex-1 max-w-[640px]">
                <div className="relative aspect-[3/4] overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200 rounded-2xl dark:bg-brand-surface dark:ring-gray-700">
                  {previousImage && (
                    <img
                      src={previousImage}
                      alt={product.name}
                      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-out ${isCrossfading ? "opacity-0" : "opacity-100"}`}
                    />
                  )}
                  <img
                    src={displayedImage}
                    alt={product.name}
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] duration-300 ease-out ${showNewImage ? "opacity-100" : "opacity-0"} ${isMainImageLoading ? "scale-[1.01]" : "scale-100"}`}
                  />
                  {isMainImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/35 backdrop-blur-[1px] dark:bg-brand-charcoal/40">
                      <SpinnerIcon className="h-7 w-7 animate-spin text-zinc-700 dark:text-brand-cream" />
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-900 shadow-sm dark:bg-brand-charcoal dark:text-brand-cream">
                      Sale
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:hidden space-y-4">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.imageUrls.map((image) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-white transition-all duration-300 dark:bg-brand-surface ${selectedImage === image ? "border-zinc-900 ring-2 ring-zinc-900/10 dark:border-brand-gold dark:ring-brand-gold/30" : "border-zinc-200 dark:border-gray-700"}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>

              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200 dark:bg-brand-surface dark:ring-gray-700">
                {previousImage && (
                  <img
                    src={previousImage}
                    alt={product.name}
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-out ${isCrossfading ? "opacity-0" : "opacity-100"}`}
                  />
                )}
                <img
                  src={displayedImage}
                  alt={product.name}
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] duration-300 ease-out ${showNewImage ? "opacity-100" : "opacity-0"} ${isMainImageLoading ? "scale-[1.01]" : "scale-100"}`}
                />
                {isMainImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/35 backdrop-blur-[1px] dark:bg-brand-charcoal/40">
                    <SpinnerIcon className="h-7 w-7 animate-spin text-zinc-700 dark:text-brand-cream" />
                  </div>
                )}
                {hasDiscount && (
                  <div className="absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-900 shadow-sm dark:bg-brand-charcoal dark:text-brand-cream">
                    Sale
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 self-start rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] animate-fadeInUp delay-200 dark:border-gray-700 dark:bg-brand-surface">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-zinc-900 dark:text-brand-cream">
                  {product.name}
                </h1>
                <div className="mt-3 animate-fadeInUp delay-300">
                  <h2 className="sr-only">Product information</h2>
                  <div className="flex items-baseline space-x-4">
                    {hasDiscount ? (
                      <>
                        <p className="text-3xl tracking-tight text-zinc-900 dark:text-brand-cream">
                          {formatPrice(
                            product.discountPrice,
                            storeSettings.currency,
                          )}
                        </p>
                        <p className="text-xl tracking-tight text-zinc-400 line-through">
                          {formatPrice(product.price, storeSettings.currency)}
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl tracking-tight text-zinc-900 dark:text-brand-cream">
                        {formatPrice(product.price, storeSettings.currency)}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isOutOfStock ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"}`}
                    >
                      {stockLabel}
                    </span>
                    <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600 dark:bg-brand-charcoal dark:text-gray-300">
                      {product.material}
                    </span>
                  </div>
                </div>
              </div>
              <button className="mt-1 p-2 rounded-full border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:text-brand-cream">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 3h7v7" />
                  <path d="M10 14L21 3" />
                  <path d="M21 14v7h-7" />
                  <path d="M3 10v11h11" />
                </svg>
              </button>
            </div>

            <div className="mt-8 space-y-8 animate-fadeInUp delay-450">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Color
                </h3>
                <div className="flex items-center space-x-3 mt-4">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${color}`}
                      className={`relative -m-0.5 flex items-center justify-center rounded-full p-0.5 focus:outline-none transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 ${selectedColor === color ? "ring-2 ring-offset-2 ring-zinc-900 shadow-md" : "ring-1 ring-transparent"}`}
                    >
                      <span
                        style={{ backgroundColor: color.toLowerCase() }}
                        className="h-8 w-8 rounded-full border border-black border-opacity-10 shadow-sm"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Size
                </h3>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 mt-4">
                  {product.sizes.map((size) => {
                    const variantStock = getVariantStock(selectedColor, size);
                    const isVariantOutOfStock = variantStock === 0;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={isVariantOutOfStock}
                        className={`group relative border rounded-xl py-3 px-4 flex items-center justify-center text-sm font-medium uppercase focus:outline-none transition-all duration-200 ${
                          isVariantOutOfStock
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed decoration-slate-500 line-through dark:bg-brand-charcoal dark:text-gray-500 dark:border-gray-700"
                            : selectedSize === size
                              ? "bg-zinc-900 text-white shadow-lg shadow-black/10 dark:bg-brand-cream dark:text-brand-charcoal"
                              : "bg-white text-zinc-900 hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md dark:bg-brand-surface dark:text-brand-cream dark:border-gray-600 dark:hover:bg-gray-800"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Quantity
                </h3>
                <div
                  className={`flex items-center rounded-xl border border-zinc-300 bg-white shadow-sm transition-all duration-200 dark:border-gray-600 dark:bg-brand-charcoal ${isOutOfStock ? "opacity-50 pointer-events-none" : "hover:shadow-md"}`}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-zinc-500 transition-colors duration-200 hover:text-zinc-900 disabled:opacity-50 dark:text-gray-300 dark:hover:text-brand-cream"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span
                    className="px-5 text-base w-14 text-center font-medium text-zinc-900 dark:text-brand-cream"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-zinc-500 transition-colors duration-200 hover:text-zinc-900 disabled:opacity-50 dark:text-gray-300 dark:hover:text-brand-cream"
                    aria-label="Increase quantity"
                    disabled={quantity >= currentVariantStock}
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                {!isOutOfStock && currentVariantStock <= 5 && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    Only {currentVariantStock} left!
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart || isOutOfStock}
              className={`mt-10 w-full border border-transparent rounded-full py-4 px-8 flex items-center justify-center text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-all duration-300 transform ${
                isOutOfStock
                  ? "bg-zinc-200 text-zinc-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-zinc-900 text-white hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl hover:scale-[1.01] dark:bg-brand-cream dark:text-brand-charcoal dark:hover:bg-gray-200"
              }`}
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

            <div className="mt-10">
              <DetailAccordion title="Description" defaultOpen={true}>
                <p>{product.description}</p>
              </DetailAccordion>
              <DetailAccordion title="Material & Care">
                <p>
                  <strong>Material:</strong> {product.material}
                </p>
                <p>
                  <strong>Care:</strong> Machine wash cold, gentle cycle. Tumble
                  dry low. Do not bleach. Iron on low heat if necessary.
                </p>
              </DetailAccordion>
              <DetailAccordion title="Shipping & Returns">
                <p>
                  {storeSettings.isFreeShippingThresholdActive
                    ? `Complimentary standard shipping on orders over ${formatPrice(storeSettings.freeShippingThreshold, storeSettings.currency)}. `
                    : `Standard shipping is ${formatPrice(storeSettings.standardShippingCost, storeSettings.currency)}. `}
                  Easy 30-day returns. See our Shipping & Returns page for more
                  details.
                </p>
              </DetailAccordion>
            </div>
          </div>
        </div>
      </div>

      {recommendedProducts.length > 0 && (
        <div className="mt-20 border-t border-zinc-200 bg-[#fbf9f6] py-16 dark:border-gray-700 dark:bg-brand-charcoal">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-serif font-semibold tracking-tight text-zinc-900 dark:text-brand-cream">
              You Might Also Like
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {recommendedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => viewProduct(p)}
                  storeSettings={storeSettings}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
