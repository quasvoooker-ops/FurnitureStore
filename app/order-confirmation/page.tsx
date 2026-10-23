"use client";

import { useEffect, useState } from "react";
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

export default function OrderConfirmationPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<LocalOrder | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin"); return; }
    const saved = localStorage.getItem("last_order");
    if (!saved) { router.push("/"); return; }
    setOrder(JSON.parse(saved));
    localStorage.removeItem("last_order");
  }, [isLoggedIn, router]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Success banner */}
        <div className="bg-green-50 border border-green-200 rounded-sm px-6 py-5 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Order placed successfully!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Thank you, {order.full_name}. Your order has been received and is being processed.
              A confirmation will be sent to <span className="font-medium">{order.email}</span>.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a]">
              Order Confirmation
            </h1>
            <p className="text-sm text-[#5a5a5a] mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <span className="text-sm px-3 py-1.5 rounded-full font-medium bg-yellow-100 text-yellow-700 capitalize">
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        <div className="bg-white border border-[#d6cfc6] rounded-sm p-6 mb-6">
          <h2 className="text-sm font-medium text-[#1a1a1a] mb-5">Order Progress</h2>
          <div className="flex items-center">
            {["pending", "confirmed", "processing", "shipped", "delivered"].map((step, i) => {
              const labels: Record<string, string> = {
                pending: "Order Placed", confirmed: "Confirmed",
                processing: "Processing", shipped: "Shipped", delivered: "Delivered",
              };
              const active = i === 0;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${active ? "bg-[#8b3a2a] text-white" : "bg-[#e8e0d5] text-[#a89f96]"}`}>
                      {i + 1}
                    </div>
                    <p className={`text-[10px] mt-1.5 text-center w-16 ${active ? "text-[#8b3a2a] font-medium" : "text-[#a89f96]"}`}>
                      {labels[step]}
                    </p>
                  </div>
                  {i < 4 && <div className="flex-1 h-0.5 mb-5 mx-1 bg-[#e8e0d5]" />}
                </div>
              );
            })}
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
                {order.items.map(item => (
                  <div key={item.id} className="px-5 py-4 flex items-center gap-4">
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

          {/* Shipping */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#d6cfc6] rounded-sm p-5">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a] mb-4">Shipping To</h2>
              <div className="flex flex-col gap-2 text-sm text-[#5a5a5a]">
                <p className="font-medium text-[#1a1a1a]">{order.full_name}</p>
                <p>{order.email}</p>
                <p>{order.phone}</p>
                <p className="mt-1">{order.address}</p>
                <p>{order.city}, {order.postal_code}</p>
                {order.notes && <p className="mt-2 text-xs italic text-[#a89f96]">Note: {order.notes}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/customer"
                className="block text-center bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors">
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
  );
}
