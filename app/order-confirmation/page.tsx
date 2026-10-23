"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

interface LocalOrder {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  created_at: string;
  items: { id: number; name: string; price: string; quantity: number; image: string }[];
}

const STEPS = [
  {
    key: "placed",
    label: "Order Placed",
    icon: "📦",
    desc: "We've received your order and are preparing it.",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: "✅",
    desc: "Your order has been confirmed and payment verified.",
  },
  {
    key: "processing",
    label: "Processing",
    icon: "🔧",
    desc: "Your furniture is being carefully packaged.",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: "🚚",
    desc: "Your order is on its way to you!",
  },
  {
    key: "arrived",
    label: "Arrived",
    icon: "🏠",
    desc: "Your order has been delivered. Enjoy your new furniture!",
  },
];

// Auto-advance timing in milliseconds (demo)
const STEP_DELAYS = [0, 4000, 9000, 15000, 22000];

export default function OrderConfirmationPage() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<LocalOrder | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin"); return; }
    const saved = localStorage.getItem("last_order");
    if (!saved) { router.push("/"); return; }
    setOrder(JSON.parse(saved));
    localStorage.removeItem("last_order");
  }, [isLoggedIn, router]);

  // Auto-advance status for demo
  useEffect(() => {
    if (!order) return;
    const timers = STEP_DELAYS.map((delay, i) =>
      setTimeout(() => setCurrentStep(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [order]);

  function handlePrint() {
    setShowReceipt(true);
    setTimeout(() => window.print(), 300);
  }

  if (!order) return null;

  const currentStepData = STEPS[currentStep];

  return (
    <>
      {/* Print-only receipt */}
      <div className="hidden print:block p-8 font-sans text-sm" ref={receiptRef}>
        <div className="text-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">Fernwood &amp; Co.</h1>
          <p className="text-gray-500 text-xs mt-1">Order Receipt</p>
        </div>
        <div className="mb-4">
          <p><strong>Order ID:</strong> #{order.id}</p>
          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
          <p><strong>Status:</strong> {currentStepData.label}</p>
        </div>
        <div className="mb-4 border-t pt-3">
          <p className="font-semibold mb-2">Ship To:</p>
          <p>{order.full_name}</p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
          <p>{order.address}, {order.city} {order.postal_code}</p>
          {order.notes && <p className="text-gray-500 italic mt-1">Note: {order.notes}</p>}
        </div>
        <div className="mb-4 border-t pt-3">
          <p className="font-semibold mb-2">Items:</p>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between mb-1">
              <span>{item.name} × {item.quantity}</span>
              <span>${(parseFloat(item.price.replace(/[$,]/g, "")) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{order.shippingFee === 0 ? "Free" : `₱${order.shippingFee}`}</span></div>
          <div className="flex justify-between font-bold text-base mt-2 border-t pt-2">
            <span>Total</span><span>${order.total.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-center mt-8 text-gray-400 text-xs border-t pt-4">
          Thank you for shopping at Fernwood &amp; Co.!<br />
          Solid wood pieces built by small workshops.
        </div>
      </div>

      {/* Main page (hidden on print) */}
      <div className="min-h-screen bg-[#f5f0ea] print:hidden">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-12">

          {/* Success banner */}
          <div className="bg-green-50 border border-green-200 rounded-sm px-6 py-5 mb-8 flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-xl">
              🎉
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Order placed successfully!</p>
              <p className="text-sm text-green-700 mt-0.5">
                Thank you, <strong>{order.full_name}</strong>. Your order has been received.
                A confirmation will be sent to <strong>{order.email}</strong>.
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a]">
                Order #{order.id}
              </h1>
              <p className="text-sm text-[#5a5a5a] mt-1">
                {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 border border-[#d6cfc6] text-[#1a1a1a] text-sm px-5 py-2.5 rounded-sm hover:bg-[#e8e0d5] transition-colors"
            >
              🖨️ Print Receipt
            </button>
          </div>

          {/* Live order tracker */}
          <div className="bg-white border border-[#d6cfc6] rounded-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a]">
                Order Tracking
              </h2>
              {currentStep < STEPS.length - 1 && (
                <span className="flex items-center gap-1.5 text-xs text-[#8b3a2a]">
                  <span className="w-2 h-2 bg-[#8b3a2a] rounded-full animate-pulse" />
                  Live update
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative mb-8">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#e8e0d5]" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-[#8b3a2a] transition-all duration-1000"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {STEPS.map((step, i) => (
                  <div key={step.key} className="flex flex-col items-center" style={{ width: "20%" }}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 z-10 ${
                      i < currentStep ? "bg-[#8b3a2a] text-white shadow-md" :
                      i === currentStep ? "bg-[#8b3a2a] text-white shadow-lg scale-110 ring-4 ring-[#8b3a2a]/20" :
                      "bg-white border-2 border-[#e8e0d5] text-[#a89f96]"
                    }`}>
                      {i < currentStep ? "✓" : step.icon}
                    </div>
                    <p className={`text-[10px] mt-2 text-center leading-tight ${
                      i <= currentStep ? "text-[#8b3a2a] font-semibold" : "text-[#a89f96]"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Current status description */}
            <div className={`rounded-sm px-5 py-4 transition-all duration-500 ${
              currentStep === STEPS.length - 1
                ? "bg-green-50 border border-green-200"
                : "bg-[#faf7f3] border border-[#f0ebe4]"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentStepData.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{currentStepData.label}</p>
                  <p className="text-sm text-[#5a5a5a] mt-0.5">{currentStepData.desc}</p>
                </div>
              </div>
            </div>

            {/* Timeline log */}
            <div className="mt-5 flex flex-col gap-2">
              {STEPS.slice(0, currentStep + 1).map((step, i) => (
                <div key={step.key} className="flex items-center gap-3 text-xs text-[#5a5a5a]">
                  <span className="w-4 h-4 bg-[#8b3a2a] rounded-full flex items-center justify-center text-white text-[8px] flex-shrink-0">✓</span>
                  <span className="font-medium text-[#1a1a1a]">{step.label}</span>
                  <span>—</span>
                  <span>{step.desc}</span>
                </div>
              )).reverse()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Items */}
            <div className="md:col-span-2">
              <div className="bg-white border border-[#d6cfc6] rounded-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#f0ebe4]">
                  <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a]">Items Ordered</h2>
                </div>
                <div className="divide-y divide-[#f0ebe4]">
                  {order.items.map((item, i) => (
                    <div key={i} className="px-5 py-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#e8e0d5] rounded-sm overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1a1a1a]">{item.name}</p>
                        <p className="text-xs text-[#5a5a5a] mt-0.5">{item.price} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-[#1a1a1a]">
                        ${(parseFloat(item.price.replace(/[$,]/g, "")) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 bg-[#faf7f3] border-t border-[#f0ebe4]">
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between text-[#5a5a5a]">
                      <span>Subtotal</span><span>${order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#5a5a5a]">
                      <span>Shipping</span>
                      <span className={order.shippingFee === 0 ? "text-green-600" : ""}>
                        {order.shippingFee === 0 ? "Free" : `₱${order.shippingFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-[#1a1a1a] pt-2 border-t border-[#e8e0d5]">
                      <span>Total</span><span>${order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping + actions */}
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-[#d6cfc6] rounded-sm p-5">
                <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a] mb-4">Shipping To</h2>
                <div className="flex flex-col gap-1.5 text-sm text-[#5a5a5a]">
                  <p className="font-medium text-[#1a1a1a]">{order.full_name}</p>
                  <p>{order.email}</p>
                  <p>{order.phone}</p>
                  <p className="mt-1">{order.address}</p>
                  <p>{order.city}, {order.postal_code}</p>
                  {order.notes && <p className="mt-2 text-xs italic text-[#a89f96]">Note: {order.notes}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handlePrint}
                  className="block text-center bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors"
                >
                  🖨️ Print / Save Receipt
                </button>
                <Link href="/dashboard/customer"
                  className="block text-center border border-[#d6cfc6] text-[#1a1a1a] text-sm py-3 rounded-sm hover:bg-[#e8e0d5] transition-colors">
                  My Orders
                </Link>
                <Link href="/living"
                  className="block text-center border border-[#d6cfc6] text-[#1a1a1a] text-sm py-3 rounded-sm hover:bg-[#e8e0d5] transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
