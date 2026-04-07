import React, { useState } from "react";
import { useCart } from "../hooks/useCart";
import {
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  XCircleIcon,
} from "../components/icons";
import { Page, Product, DiscountCode, StoreSettings } from "../types";
import { useAuth } from "../hooks/useAuth";
import { formatPrice } from "../utils/currency";

interface CartProps {
  navigateTo: (page: Page) => void;
  viewProduct: (product: Product) => void;
  discountCodes: DiscountCode[];
  appliedDiscount: DiscountCode | null;
  setAppliedDiscount: (discount: DiscountCode | null) => void;
  storeSettings: StoreSettings;
}

const CartItemRow: React.FC<{
  item: import("../types").CartItem;
  viewProduct: (product: Product) => void;
  storeSettings: StoreSettings;
}> = ({ item, viewProduct, storeSettings }) => {
  const { dispatch } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: {
        id: item.id,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: newQuantity,
      },
    });
  };

  return (
    <li className="flex gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
        <img
          src={item.imageUrls[0]}
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex justify-between text-base font-semibold text-zinc-900">
              <h3>
                <button
                  onClick={() => viewProduct(item)}
                  className="text-left hover:text-brand-gold transition-colors"
                >
                  {item.name}
                </button>
              </h3>
              <p className="ml-4 whitespace-nowrap">
                {formatPrice(
                  item.discountPrice ?? item.price,
                  storeSettings.currency,
                )}
              </p>
            </div>
            <p className="mt-1 text-sm text-zinc-500 capitalize">
              {item.selectedColor}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Size: {item.selectedSize}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "REMOVE_ITEM",
                payload: {
                  id: item.id,
                  selectedSize: item.selectedSize,
                  selectedColor: item.selectedColor,
                },
              })
            }
            className="text-sm font-semibold text-brand-gold hover:text-yellow-600 transition-colors"
          >
            Remove
          </button>
        </div>
        <div className="mt-4 flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center rounded-xl border border-zinc-200 bg-white shadow-sm">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span
              className="px-3 text-base font-medium text-zinc-900"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 text-zinc-500 hover:text-zinc-900"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export const Cart: React.FC<CartProps> = ({
  navigateTo,
  viewProduct,
  discountCodes,
  appliedDiscount,
  setAppliedDiscount,
  storeSettings,
}) => {
  const { state } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const {
    freeShippingThreshold,
    standardShippingCost,
    isFreeShippingThresholdActive,
    taxRate = 0,
    currency,
  } = storeSettings;

  const subtotal = state.items.reduce(
    (sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity,
    0,
  );
  const isEligibleForFreeShipping =
    isFreeShippingThresholdActive && subtotal >= freeShippingThreshold;
  const shipping =
    subtotal > 0 && !isEligibleForFreeShipping ? standardShippingCost : 0;

  let discountAmount = 0;
  let finalShipping = shipping;

  if (appliedDiscount) {
    if (appliedDiscount.type === "percentage") {
      discountAmount = subtotal * (appliedDiscount.value / 100);
    } else if (appliedDiscount.type === "fixed") {
      discountAmount = appliedDiscount.value;
    } else if (appliedDiscount.type === "free_shipping") {
      finalShipping = 0;
      discountAmount = shipping; // Display the saved amount
    }
  }

  discountAmount = Math.min(
    discountAmount,
    subtotal + (appliedDiscount?.type !== "free_shipping" ? 0 : shipping),
  );

  const subtotalAfterDiscount =
    subtotal - (appliedDiscount?.type !== "free_shipping" ? discountAmount : 0);
  const tax = subtotalAfterDiscount * (taxRate / 100);
  const total = subtotalAfterDiscount + finalShipping + tax;

  const amountForFreeShipping = freeShippingThreshold - subtotal;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMessage(null);
    const code = discountCodes.find(
      (c) => c.code.toLowerCase() === couponInput.toLowerCase(),
    );

    if (!code) {
      setCouponMessage({ text: "Invalid discount code.", type: "error" });
      return;
    }

    if (!code.isActive) {
      setCouponMessage({
        text: "This discount code is inactive.",
        type: "error",
      });
      return;
    }

    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      setCouponMessage({
        text: "This discount code has expired.",
        type: "error",
      });
      return;
    }

    if (code.usageLimit && (code.uses || 0) >= code.usageLimit) {
      setCouponMessage({
        text: "This discount code has reached its usage limit.",
        type: "error",
      });
      return;
    }

    if (code.minimumPurchase && subtotal < code.minimumPurchase) {
      setCouponMessage({
        text: `You must spend at least ${formatPrice(code.minimumPurchase, currency)} to use this code.`,
        type: "error",
      });
      return;
    }

    setAppliedDiscount(code);
    setCouponMessage({ text: "Discount code applied!", type: "success" });
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponInput("");
    setCouponMessage(null);
  };

  if (state.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <ShoppingBagIcon className="h-12 w-12 text-zinc-300" />
        </div>
        <h2 className="mt-6 text-3xl font-serif font-semibold text-zinc-900">
          Your cart is empty
        </h2>
        <p className="mt-2 max-w-md text-zinc-500">
          Looks like you haven't added anything to your cart yet. Browse the
          shop and pick a few pieces you like.
        </p>
        <button
          onClick={() => navigateTo("shop")}
          className="mt-8 rounded-full bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigateTo("checkout");
    } else {
      navigateTo("login");
    }
  };

  return (
    <div className="bg-[#f7f3ee]">
      <div className="max-w-[1500px] mx-auto px-4 py-10 sm:px-6 lg:px-8 animate-fadeIn lg:py-14">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2
              id="cart-heading"
              className="text-3xl font-serif font-bold tracking-tight text-zinc-900 sm:text-4xl"
            >
              Shopping Cart
            </h2>
            <ul role="list" className="mt-6 space-y-4">
              {state.items.map((item) => (
                <CartItemRow
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  item={item}
                  viewProduct={viewProduct}
                  storeSettings={storeSettings}
                />
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="summary-heading"
            className="mt-12 rounded-3xl border border-zinc-200 bg-white px-5 py-6 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:p-8 lg:col-span-5 lg:mt-0 lg:sticky lg:top-24"
          >
            <h2
              id="summary-heading"
              className="text-lg font-semibold text-zinc-900"
            >
              Order summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-zinc-500">Subtotal</dt>
                <dd className="text-sm font-semibold text-zinc-900">
                  {formatPrice(subtotal, currency)}
                </dd>
              </div>
              {appliedDiscount && (
                <div className="flex items-center justify-between text-emerald-600">
                  <dt className="flex items-center text-sm">
                    <span>Discount ({appliedDiscount.code})</span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="ml-2 text-rose-500 hover:text-rose-700"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </dt>
                  <dd className="text-sm font-medium">
                    - {formatPrice(discountAmount, currency)}
                  </dd>
                </div>
              )}
              <div className="border-t border-zinc-200 pt-4 flex items-center justify-between">
                <dt className="flex items-center text-sm text-zinc-500">
                  <span>Shipping estimate</span>
                </dt>
                <dd className="text-sm font-semibold text-zinc-900">
                  {finalShipping > 0
                    ? formatPrice(finalShipping, currency)
                    : "Free"}
                </dd>
              </div>
              <div className="border-t border-zinc-200 pt-4 flex items-center justify-between">
                <dt className="flex items-center text-sm text-zinc-500">
                  <span>Taxes ({taxRate || 0}%)</span>
                </dt>
                <dd className="text-sm font-semibold text-zinc-900">
                  {formatPrice(tax, currency, { forceDecimals: true })}
                </dd>
              </div>
              <div className="border-t border-zinc-200 pt-4 flex items-center justify-between text-base font-semibold text-zinc-900">
                <dt>Order total</dt>
                <dd>{formatPrice(total, currency, { forceDecimals: true })}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label
                  htmlFor="discount-code"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Discount code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="discount-code"
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(e.target.value.toUpperCase())
                    }
                    className="block w-full rounded-xl border border-zinc-200 bg-[#fbf9f6] p-3 text-sm shadow-sm outline-none transition focus:border-zinc-400 focus:bg-white"
                    placeholder="Enter code"
                    disabled={!!appliedDiscount}
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50"
                    disabled={!!appliedDiscount}
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-sm mt-2 ${couponMessage.type === "error" ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </form>
            </div>

            {isFreeShippingThresholdActive &&
              amountForFreeShipping > 0 &&
              finalShipping > 0 && (
                <div className="mt-6 rounded-2xl bg-[#fbf9f6] p-4 text-center text-sm text-zinc-500">
                  <p>
                    Add{" "}
                    <span className="font-semibold text-zinc-900">
                      {formatPrice(amountForFreeShipping, currency)}
                    </span>{" "}
                    more to get free shipping!
                  </p>
                  <div className="mt-3 h-2.5 w-full rounded-full bg-zinc-200">
                    <div
                      className="bg-brand-gold h-2.5 rounded-full"
                      style={{
                        width: `${(subtotal / freeShippingThreshold) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

            <div className="mt-6">
              <button
                onClick={handleCheckout}
                className="w-full rounded-full bg-zinc-900 py-3.5 px-4 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
              >
                <div className="flex items-center justify-center">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  <span>
                    {isAuthenticated
                      ? "Proceed to Checkout"
                      : "Login to Checkout"}
                  </span>
                </div>
              </button>
            </div>
            <div className="mt-6 text-center text-sm">
              <p>
                or{" "}
                <button
                  onClick={() => navigateTo("shop")}
                  className="font-medium text-brand-gold hover:text-yellow-600"
                >
                  Continue Shopping<span aria-hidden="true"> &rarr;</span>
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
