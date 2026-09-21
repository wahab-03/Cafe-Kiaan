"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, CheckCircle2, Loader2, MapPinned } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const statusLabels = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusMessages = {
  PENDING: "Your order has been received and is waiting for confirmation from our team.",
  CONFIRMED: "Your order has been confirmed by our team and will be prepared shortly.",
  PREPARING: "Our kitchen is currently preparing your order.",
  READY: "Your order is ready and waiting for pickup or delivery.",
  OUT_FOR_DELIVERY: "Your order is on the way to you.",
  COMPLETED: "Your order has been completed. Thank you for ordering from Café Kiaan!",
  CANCELLED: "Your order has been cancelled.",
};

const deliverySteps = [
  { key: "PENDING", title: "Order Received", description: "Your order has been received" },
  { key: "CONFIRMED", title: "Order Confirmed", description: "Your order has been confirmed" },
  { key: "PREPARING", title: "Order Prepared", description: "Our kitchen is preparing your order" },
  { key: "READY", title: "Ready", description: "Your order is ready" },
  { key: "OUT_FOR_DELIVERY", title: "Out for Delivery", description: "Your food is on the way" },
  { key: "COMPLETED", title: "Completed", description: "Enjoy your meal!" },
];

const pickupSteps = [
  { key: "PENDING", title: "Order Received", description: "Your order has been received" },
  { key: "CONFIRMED", title: "Order Confirmed", description: "Your order has been confirmed" },
  { key: "PREPARING", title: "Order Prepared", description: "Our kitchen is preparing your order" },
  { key: "READY", title: "Ready for Pickup", description: "Your order is ready for pickup" },
  { key: "COMPLETED", title: "Completed", description: "Enjoy your meal!" },
];

function StatusTimeline({ status, orderType }) {
  const steps = orderType === "pickup" ? pickupSteps : deliverySteps;
  const currentIndex = steps.findIndex((step) => step.key === status);
  const activeIndex = currentIndex < 0 ? 0 : currentIndex;

  return (
    <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-5 sm:px-6">
      {steps.map((step, index) => {
        const completed = index < activeIndex;
        const active = index === activeIndex;
        const reached = completed || active;

        return (
          <div key={step.key} className="relative flex gap-3.5">
            {index < steps.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 h-[calc(100%-1px)] border-l-2 border-dashed ${
                  index < activeIndex ? "border-kiaan-pink/45" : "border-gray-200"
                }`}
              />
            )}

            <div
              className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                reached
                  ? "border-kiaan-pink bg-kiaan-pink text-white"
                  : "border-gray-200 bg-gray-200 text-white"
              }`}
            >
              {completed || active ? <Check size={14} strokeWidth={3} /> : null}
            </div>

            <div className={`pb-5 ${index === steps.length - 1 ? "pb-0" : ""}`}>
              <p className={`text-sm font-bold leading-5 ${active ? "text-gray-900" : reached ? "text-gray-800" : "text-gray-500"}`}>
                {step.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-gray-400">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let timer;
    const orderId = params.get("id");

    async function loadOrder() {
      if (!orderId) {
        try {
          const saved = sessionStorage.getItem("kiaan-last-order");
          if (saved && active) setOrder(JSON.parse(saved));
        } catch { }
        if (active) setLoading(false);
        return;
      }

      try {
        const saved = localStorage.getItem("kiaan-customer");
        const customer = saved ? JSON.parse(saved) : null;
        if (!customer?.customerToken) {
          if (active) {
            setError("Your customer session could not be verified. Please open Order History to continue.");
            setLoading(false);
          }
          return;
        }
        const fresh = await api.order(orderId, customer.customerToken);
        if (!active) return;
        setOrder(fresh);
        setError("");
      } catch (err) {
        if (active) setError(err.message || "Could not load order status.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();
    timer = setInterval(loadOrder, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [params]);

  const status = order?.status || "PENDING";
  const statusText = statusLabels[status] || status;
  const statusMessage = statusMessages[status] || "We are currently processing your order.";
  const isCancelled = status === "CANCELLED";
  const isPickup = order?.order_type === "pickup";

  return (
    <>
      <Header />
      <main className="min-h-[650px] bg-kiaan-cream flex items-center justify-center px-5 py-16">
        <div className="bg-white max-w-xl w-full rounded-3xl p-8 sm:p-12 text-center border border-pink-100">
          <CheckCircle2 className="mx-auto text-kiaan-pink" size={64} />
          <p className="text-kiaan-pink text-xs tracking-[.25em] font-bold mt-5">ORDER CONFIRMED</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2">Thank You!</h1>
          <p className="text-gray-500 text-lg leading-6 mt-4">Your Café Kiaan order has been received. Our team will start preparing it shortly.</p>

          {loading && (
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Checking latest order status...
            </div>
          )}

          {error && <div className="bg-red-50 text-red-700 rounded-xl p-4 mt-6 text-sm">{error}</div>}

          {order && (
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-[0_8px_24px_rgba(43,37,34,0.06)] sm:p-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Order ID</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">{order.name || order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Total</p>
                  <p className="mt-1 text-sm font-bold text-kiaan-pink">৳{order.total}</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-kiaan-soft/70 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kiaan-pink">Current Status</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-lg font-bold text-gray-900">{statusText}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-kiaan-pink shadow-sm">
                    Live
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-500">{statusMessage}</p>
              </div>

              {isCancelled ? (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-4">
                  <p className="text-sm font-bold text-red-700">Order Cancelled</p>
                  <p className="mt-1 text-xs leading-5 text-red-600">This order will not move through the remaining delivery stages.</p>
                </div>
              ) : (
                <StatusTimeline status={status} orderType={isPickup ? "pickup" : "delivery"} />
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <MapPinned size={14} />
                {isPickup ? "Pickup order" : "Delivery order"} · Status updates automatically
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link href="/orders" className="border border-kiaan-pink text-kiaan-pink rounded-full px-6 py-3 text-xs font-bold">ORDER HISTORY</Link>
            <Link href="/menu" className="bg-kiaan-pink text-white rounded-full px-6 py-3 text-xs font-bold">ORDER MORE</Link>
            <Link href="/" className="border border-kiaan-pink text-kiaan-pink rounded-full px-6 py-3 text-xs font-bold">BACK HOME</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function Success() {
  return (
    <Suspense fallback={<><Header /><main className="min-h-[650px] bg-kiaan-cream" /><Footer /></>}>
      <SuccessContent />
    </Suspense>
  );
}