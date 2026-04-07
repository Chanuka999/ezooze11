import React from "react";
import { Page, Order, StoreSettings } from "../types";
import { CheckCircleIcon } from "../components/icons";
import { formatPrice } from "../utils/currency";

interface OrderSuccessPageProps {
  order: Order | null;
  navigateTo: (page: Page) => void;
  currency: StoreSettings["currency"];
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  navigateTo,
  currency,
}) => {
  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center animate-fadeIn">
        <h1 className="text-3xl font-serif font-bold text-zinc-900">
          No recent order found
        </h1>
        <p className="mt-3 text-zinc-500">
          Place a new order to see your confirmation details.
        </p>
        <button
          onClick={() => navigateTo("shop")}
          className="mt-8 rounded-full bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 animate-fadeIn">
      <div className="mb-12 text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 text-3xl font-serif font-bold text-zinc-900">
          Order placed successfully
        </h1>
        <p className="mt-2 text-zinc-500">
          Your order{" "}
          <span className="font-mono font-semibold text-zinc-900">
            {order.id}
          </span>{" "}
          is confirmed.
        </p>
        <p className="mt-2 text-zinc-500">
          Estimated delivery:{" "}
          <span className="font-semibold text-zinc-900">
            {estimatedDelivery}
          </span>
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
        <div className="border-b border-zinc-200 p-6">
          <h2 className="text-xl font-semibold text-zinc-900">Order Summary</h2>
        </div>
        <div className="p-6">
          <ul role="list" className="space-y-4">
            {order.items.map((item) => (
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
          <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span>
              {formatPrice(order.total, currency, { forceDecimals: true })}
            </span>
          </div>
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
          Continue shopping
        </button>
      </div>
    </div>
  );
};
