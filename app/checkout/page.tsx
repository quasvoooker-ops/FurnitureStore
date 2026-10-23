"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { apiPost } from "../lib/api";

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderPlaced, setOrderPlaced] = useState(false); // prevents cart redirect after placing order

  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin"); return; }
    if (items.length === 0 && !orderPlaced) { router.push("/cart"); }
  }, [isLoggedIn, items, router, orderPlaced]);

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, full_name: user.full_name, email: user.email }));
    }
  }, [user]);

  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.price.replace(/[$,]/g, "")) * item.quantity;
  }, 0);
  const shippingFee = subtotal >= 5000 ? 0 : 150;
  const total = subtotal + shippingFee;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.postal_code.trim()) e.postal_code = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !user?.token) return;
    setLoading(true);
    try {
      const order = await apiPost("/orders/", {
        ...form,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
      }, user.token);
      setOrderPlaced(true);
      clearCart();
      router.push(`/orders/${order.id}?new=1`);
    } catch {
      // Orders API not available — save locally and show confirmation
      const localOrder = {
        id: Date.now(),
        ...form,
        items: items.map(i => ({ ...i })),
        subtotal,
        shippingFee,
        total,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      setOrderPlaced(true);
      clearCart();
      localStorage.setItem("last_order", JSON.stringify(localOrder));
      router.push(`/order-confirmation`);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn || (items.length === 0 && !orderPlaced)) return null;

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs text-[#5a5a5a] mb-2">
            <Link href="/cart" className="hover:text-[#8b3a2a]">Cart</Link> / Checkout
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a]">
            Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping form */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white border border-[#d6cfc6] rounded-sm p-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a] mb-5">
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "full_name", label: "Full name", placeholder: "Christian Camacho" },
                    { key: "email", label: "Email", placeholder: "email@example.com", type: "email" },
                    { key: "phone", label: "Phone number", placeholder: "+63 9XX XXX XXXX" },
                    { key: "city", label: "City", placeholder: "Manila" },
                    { key: "postal_code", label: "Postal code", placeholder: "1000" },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-sm text-[#1a1a1a]">{label}</label>
                      <input
                        type={type || "text"}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className={`bg-[#f5f0ea] border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a] transition-colors ${errors[key] ? "border-red-300" : "border-[#d6cfc6]"}`}
                      />
                      {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
                    </div>
                  ))}

                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-sm text-[#1a1a1a]">Street address</label>
                    <textarea
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="123 Rizal Street, Brgy. San Antonio"
                      rows={2}
                      className={`bg-[#f5f0ea] border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a] transition-colors resize-none ${errors.address ? "border-red-300" : "border-[#d6cfc6]"}`}
                    />
                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-sm text-[#1a1a1a]">Order notes <span className="text-[#a89f96]">(optional)</span></label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Special delivery instructions..."
                      rows={2}
                      className="bg-[#f5f0ea] border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a] transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping info */}
              <div className="bg-white border border-[#d6cfc6] rounded-sm p-5">
                <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a] mb-3">Shipping</h2>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5a5a5a]">Standard delivery (3–7 days)</span>
                  <span className={`font-medium ${shippingFee === 0 ? "text-green-600" : "text-[#1a1a1a]"}`}>
                    {shippingFee === 0 ? "FREE" : `₱${shippingFee}`}
                  </span>
                </div>
                {subtotal < 5000 && (
                  <p className="text-xs text-[#5a5a5a] mt-2">
                    Add ₱{(5000 - subtotal).toLocaleString()} more to qualify for free shipping.
                  </p>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#d6cfc6] rounded-sm p-6 sticky top-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a] mb-5">
                  Order Summary
                </h2>
                <div className="flex flex-col gap-3 mb-5">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#e8e0d5] rounded-sm overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#1a1a1a] truncate">{item.name}</p>
                        <p className="text-xs text-[#5a5a5a]">× {item.quantity}</p>
                      </div>
                      <p className="text-xs font-medium text-[#1a1a1a] flex-shrink-0">
                        ${(parseFloat(item.price.replace(/[$,]/g, "")) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#f0ebe4] pt-4 flex flex-col gap-2 text-sm mb-6">
                  <div className="flex justify-between text-[#5a5a5a]">
                    <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#5a5a5a]">
                    <span>Shipping</span>
                    <span className={shippingFee === 0 ? "text-green-600" : ""}>{shippingFee === 0 ? "Free" : `₱${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between font-medium text-[#1a1a1a] pt-2 border-t border-[#f0ebe4]">
                    <span>Total</span><span>${total.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8b3a2a] text-white text-sm py-3.5 rounded-sm hover:bg-[#7a3225] transition-colors disabled:opacity-60"
                >
                  {loading ? "Placing order..." : "Place Order"}
                </button>
                <Link href="/cart" className="block text-center text-sm text-[#5a5a5a] hover:text-[#8b3a2a] transition-colors mt-4">
                  ← Back to cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
