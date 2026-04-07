import React, { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { Page, DiscountCode, StoreSettings, Order } from "../types";
import { useAuth } from "../hooks/useAuth";
import {
  CheckCircleIcon,
  TruckIcon,
  CurrencyDollarIcon,
} from "../components/icons";
import { CreditCardForm } from "../components/CreditCardForm";
import { formatPrice } from "../utils/currency";
import { useRealtime } from "../context/RealtimeContext";
import { api } from "../api";

interface CheckoutProps {
  navigateTo: (page: Page) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  discountCodes: DiscountCode[];
  setDiscountCodes: React.Dispatch<React.SetStateAction<DiscountCode[]>>;
  appliedDiscount: DiscountCode | null;
  setAppliedDiscount: (discount: DiscountCode | null) => void;
  storeSettings: StoreSettings;
  setOrderToTrack: (order: Order | null) => void;
}

const FormInput: React.FC<{
  id: string;
  name?: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}> = ({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
  readOnly = false,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
      {label}
    </label>
    <div className="mt-1">
      <input
        type={type}
        id={id}
        name={name || id}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`block w-full rounded-xl border border-zinc-200 bg-[#fbf9f6] px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 ${readOnly ? "cursor-not-allowed opacity-70" : ""}`}
        required
      />
    </div>
  </div>
);

export const Checkout: React.FC<CheckoutProps> = ({
  navigateTo,
  orders,
  setOrders,
  discountCodes,
  setDiscountCodes,
  appliedDiscount,
  setAppliedDiscount,
  storeSettings,
  setOrderToTrack,
}) => {
  const { state, dispatch } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { emit } = useRealtime();

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "credit_card" | "cod"
  >("cod");

  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || "",
    phone: "",
    address: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    "postal-code": user?.address?.zip || "",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvc: "",
  });
  const [isPaymentValid, setIsPaymentValid] = useState(false);

  const {
    freeShippingThreshold,
    standardShippingCost,
    isFreeShippingThresholdActive,
    taxRate = 0,
    currency,
  } = storeSettings;

  useEffect(() => {
    if (isAuthenticated && user) {
      setShippingInfo((prev) => ({
        ...prev,
        name: user.name,
        address: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        "postal-code": user.address?.zip || "",
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("login");
    }
  }, [isAuthenticated, navigateTo]);

  useEffect(() => {
    if (storeSettings.paymentMethods.payOnDelivery) {
      setSelectedPaymentMethod("cod");
    } else if (storeSettings.paymentMethods.creditCard) {
      setSelectedPaymentMethod("credit_card");
    }
  }, [storeSettings.paymentMethods]);

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
    }
  }

  discountAmount = Math.min(discountAmount, subtotal);

  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * (taxRate / 100);
  const total = subtotalAfterDiscount + finalShipping + tax;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (selectedPaymentMethod === "credit_card" && !isPaymentValid) {
      alert("Please ensure your payment details are correct.");
      return;
    }

    if (!user) {
      alert("You must be logged in to place an order.");
      return;
    }

    if (!shippingInfo.phone) {
      alert("Please provide a phone number for shipping updates.");
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedPaymentMethod === "credit_card") {
        try {
          const { clientSecret } = await api.createPaymentIntent(
            total,
            currency,
          );
          if (!clientSecret) throw new Error("Failed to initialize payment.");
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (err: any) {
          console.error("Payment Error:", err);
          alert(`Payment failed: ${err.message || "Unknown error"}`);
          setIsProcessing(false);
          return;
        }
      }

      const newOrderNumber = `EZ${Math.floor(Math.random() * 90000) + 10000}F`;
      const now = new Date().toISOString();

      const newOrder: Order = {
        id: newOrderNumber,
        customerId: user.id,
        customerName: shippingInfo.name || user.name,
        customerEmail: user.email,
        customerPhone: shippingInfo.phone,
        date: now,
        status: "Confirmed",
        statusHistory: [
          {
            status: "Confirmed",
            timestamp: now,
            note: "Order placed successfully.",
          },
        ],
        items: state.items,
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip: shippingInfo["postal-code"],
          country: "Sri Lanka",
        },
        subtotal,
        shipping: finalShipping,
        discount: discountAmount,
        tax,
        total,
      };

      const createdOrder = await api.createOrder(newOrder);
      setOrders((prev) => [createdOrder, ...prev]);
      emit({ type: "ORDER_CREATED", payload: createdOrder });

      setPlacedOrder(createdOrder);
      setOrderToTrack(createdOrder);

      if (appliedDiscount) {
        const updatedCodes = discountCodes.map((code) => {
          if (code.id === appliedDiscount.id) {
            return { ...code, uses: (code.uses || 0) + 1 };
          }
          return code;
        });
        setDiscountCodes(updatedCodes);
      }

      setIsOrderPlaced(true);
      dispatch({ type: "CLEAR_CART" });
      setAppliedDiscount(null);
    } catch (error: any) {
      const message =
        error?.message || "Failed to place order. Please try again.";
      console.error("Failed to place order:", error);
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isOrderPlaced && placedOrder) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="max-w-4xl mx-auto px-4 py-14 animate-fadeIn">
        <div className="mb-12 text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-4 text-3xl font-serif font-bold text-zinc-900">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-zinc-500">
            Your order{" "}
            <span className="font-mono font-semibold text-zinc-900">
              {placedOrder.id}
            </span>{" "}
            has been placed.
          </p>
          <p className="mt-2 text-zinc-500">
            Confirmation sent to <strong>{placedOrder.customerEmail}</strong>{" "}
            and SMS to <strong>{placedOrder.customerPhone}</strong>.
          </p>
          <p className="mt-1 text-zinc-500">
            Estimated delivery:{" "}
            <span className="font-semibold text-zinc-900">
              {estimatedDelivery}
            </span>
            .
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
          <div className="border-b border-zinc-200 p-6">
            <h2 className="text-xl font-semibold text-zinc-900">
              Order Summary
            </h2>
          </div>
          <div className="p-6">
            <ul role="list" className="space-y-4">
              {placedOrder.items.map((item) => (
                <li
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex gap-4 rounded-2xl border border-zinc-200 bg-[#fbf9f6] p-3"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium text-zinc-900">{item.name}</h3>
                      <p className="whitespace-nowrap font-medium text-zinc-900">
                        {formatPrice(
                          (item.discountPrice ?? item.price) * item.quantity,
                          currency,
                        )}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      {item.selectedSize}, {item.selectedColor}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Qty {item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-zinc-200 bg-[#fbf9f6] p-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Subtotal</dt>
                <dd className="text-zinc-900">
                  {formatPrice(placedOrder.subtotal, currency)}
                </dd>
              </div>
              {placedOrder.discount && placedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Discount</dt>
                  <dd>- {formatPrice(placedOrder.discount, currency)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-zinc-500">Shipping</dt>
                <dd className="text-zinc-900">
                  {formatPrice(placedOrder.shipping, currency)}
                </dd>
              </div>
              {placedOrder.tax && placedOrder.tax > 0 && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Tax</dt>
                  <dd className="text-zinc-900">
                    {formatPrice(placedOrder.tax, currency, {
                      forceDecimals: true,
                    })}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
                <dt>Total</dt>
                <dd>
                  {formatPrice(placedOrder.total, currency, {
                    forceDecimals: true,
                  })}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-zinc-200 p-6">
            <h3 className="font-semibold text-zinc-900">Shipping to</h3>
            <address className="mt-2 not-italic text-zinc-500">
              {placedOrder.shippingAddress.street}
              <br />
              {placedOrder.shippingAddress.city},{" "}
              {placedOrder.shippingAddress.state}{" "}
              {placedOrder.shippingAddress.zip}
              <br />
              {placedOrder.shippingAddress.country}
              <br />
              <span className="mt-1 block text-zinc-700">
                {placedOrder.customerPhone}
              </span>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigateTo("orderTracking")}
            className="w-full rounded-full bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
          >
            Track your order
          </button>
          <button
            onClick={() => navigateTo("home")}
            className="w-full rounded-full border border-zinc-300 px-8 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-white sm:w-auto"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f3ee]">
      <div className="max-w-[1500px] mx-auto px-4 py-10 sm:px-6 lg:px-8 animate-fadeIn lg:py-14">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold text-zinc-900">Checkout</h1>
          <p className="mt-2 text-zinc-500">
            Complete your order with secure payment
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
              <div className="border-b border-zinc-200 p-6">
                <h2 className="text-xl font-semibold text-zinc-900">
                  Shipping Information
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Where should we send your order?
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormInput
                    id="name"
                    label="Full Name"
                    autoComplete="name"
                    value={shippingInfo.name}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    autoComplete="tel"
                    placeholder="+94 77 123 4567"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    id="address"
                    label="Address"
                    autoComplete="street-address"
                    placeholder="123 Main St"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                  />
                </div>
                <div>
                  <FormInput
                    id="city"
                    label="City"
                    autoComplete="address-level2"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                  />
                </div>
                <div>
                  <FormInput
                    id="state"
                    label="State / Province"
                    autoComplete="address-level1"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                  />
                </div>
                <div>
                  <FormInput
                    id="postal-code"
                    name="postal-code"
                    label="ZIP / Postal Code"
                    autoComplete="postal-code"
                    value={shippingInfo["postal-code"]}
                    onChange={handleShippingChange}
                  />
                </div>
                <div>
                  <FormInput
                    id="country"
                    label="Country"
                    autoComplete="country-name"
                    value="Sri Lanka"
                    readOnly
                  />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
              <div className="border-b border-zinc-200 p-6">
                <h2 className="text-xl font-semibold text-zinc-900">
                  Payment Method
                </h2>
              </div>
              <div className="space-y-4 p-6">
                {storeSettings.paymentMethods.creditCard && (
                  <div
                    onClick={() => setSelectedPaymentMethod("credit_card")}
                    className={`flex cursor-pointer items-center rounded-2xl border-2 p-4 transition-all ${selectedPaymentMethod === "credit_card" ? "border-brand-gold bg-amber-50/70" : "border-zinc-200 hover:border-zinc-300"}`}
                  >
                    <div
                      className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedPaymentMethod === "credit_card" ? "border-brand-gold" : "border-zinc-300"}`}
                    >
                      {selectedPaymentMethod === "credit_card" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-brand-gold" />
                      )}
                    </div>
                    <CurrencyDollarIcon className="mr-3 h-5 w-5 text-zinc-500" />
                    <div>
                      <h3 className="font-medium text-zinc-900">
                        Credit / Debit Card
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Pay securely with your card
                      </p>
                    </div>
                  </div>
                )}

                {storeSettings.paymentMethods.payOnDelivery && (
                  <div
                    onClick={() => setSelectedPaymentMethod("cod")}
                    className={`flex cursor-pointer items-center rounded-2xl border-2 p-4 transition-all ${selectedPaymentMethod === "cod" ? "border-brand-gold bg-amber-50/70" : "border-zinc-200 hover:border-zinc-300"}`}
                  >
                    <div
                      className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedPaymentMethod === "cod" ? "border-brand-gold" : "border-zinc-300"}`}
                    >
                      {selectedPaymentMethod === "cod" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-brand-gold" />
                      )}
                    </div>
                    <TruckIcon className="mr-3 h-5 w-5 text-zinc-500" />
                    <div>
                      <h3 className="font-medium text-zinc-900">
                        Cash on Delivery
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Pay when your order arrives
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {selectedPaymentMethod === "credit_card" ? (
              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
                <div className="border-b border-zinc-200 p-6">
                  <h2 className="text-xl font-semibold text-zinc-900">
                    Card Details
                  </h2>
                </div>
                <div className="p-6">
                  <CreditCardForm
                    onPaymentDataChange={setPaymentInfo}
                    onValidityChange={setIsPaymentValid}
                  />
                </div>
              </section>
            ) : (
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-700">
                You can pay in cash when the courier delivers your order to your
                doorstep.
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <section
              aria-labelledby="summary-heading"
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_16px_50px_rgba(0,0,0,0.06)] lg:sticky lg:top-24"
            >
              <h2
                id="summary-heading"
                className="text-lg font-semibold text-zinc-900"
              >
                Order summary
              </h2>
              <ul role="list" className="my-6 space-y-4">
                {state.items.map((item) => (
                  <li
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex gap-4 rounded-2xl border border-zinc-200 bg-[#fbf9f6] p-3"
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                      <img
                        src={item.imageUrls[0]}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-medium text-zinc-900">
                          {item.name}
                        </h3>
                        <p className="whitespace-nowrap font-medium text-zinc-900">
                          {formatPrice(
                            (item.discountPrice ?? item.price) * item.quantity,
                            currency,
                          )}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        {item.selectedSize}, {item.selectedColor}
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="space-y-3 border-t border-zinc-200 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Subtotal</dt>
                  <dd className="font-medium text-zinc-900">
                    {formatPrice(subtotal, currency)}
                  </dd>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <dt>Discount ({appliedDiscount?.code})</dt>
                    <dd className="font-medium">
                      - {formatPrice(discountAmount, currency)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Shipping</dt>
                  <dd className="font-medium text-zinc-900">
                    {finalShipping > 0
                      ? formatPrice(finalShipping, currency)
                      : "Free"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Taxes ({taxRate || 0}%)</dt>
                  <dd className="font-medium text-zinc-900">
                    {formatPrice(tax, currency, { forceDecimals: true })}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-base font-semibold text-zinc-900">
                  <dt>Total</dt>
                  <dd>
                    {formatPrice(total, currency, { forceDecimals: true })}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    (selectedPaymentMethod === "credit_card" &&
                      !isPaymentValid) ||
                    isProcessing
                  }
                  className="flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {isProcessing
                    ? "Processing..."
                    : selectedPaymentMethod === "credit_card"
                      ? `Pay ${formatPrice(total, currency)}`
                      : "Place Order"}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
