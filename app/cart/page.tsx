"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < rating ? "text-[#8b3a2a]" : "text-[#c9b9a8]"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems } = useCart();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.push("/signin");
  }, [isLoggedIn, router]);

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[$,]/g, ""));
    return sum + price * item.quantity;
  }, 0);

  function handleRemove(id: number, name: string) {
    removeFromCart(id);
    showToast(`${name} removed from cart`, "info");
  }

  function handleCheckout() {
    router.push("/checkout");
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a] mb-8">
          Your Cart {totalItems > 0 && <span className="text-lg text-[#5a5a5a]">({totalItems} item{totalItems > 1 ? "s" : ""})</span>}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-white border border-[#d6cfc6] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-[#a89f96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-[#1a1a1a] font-medium mb-2">Your cart is empty</p>
            <p className="text-sm text-[#5a5a5a] mb-8">Browse our collection and add items to get started.</p>
            <Link href="/living" className="bg-[#8b3a2a] text-white text-sm px-8 py-3 rounded-sm hover:bg-[#7a3225] transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-[#d6cfc6] rounded-sm p-4 flex gap-4">
                  <Link href={`/products/${item.id}`}>
                    <div className="w-24 h-24 bg-[#e8e0d5] rounded-sm overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#e8e0d5]" />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.id}`}>
                      <p className="text-sm font-medium text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors truncate">{item.name}</p>
                    </Link>
                    <p className="text-sm text-[#5a5a5a] mt-0.5">{item.price}</p>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 border border-[#d6cfc6] text-[#1a1a1a] hover:bg-[#f5f0ea] transition-colors text-sm flex items-center justify-center rounded-sm">−</button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 border border-[#d6cfc6] text-[#1a1a1a] hover:bg-[#f5f0ea] transition-colors text-sm flex items-center justify-center rounded-sm">+</button>
                      <button onClick={() => handleRemove(item.id, item.name)} className="ml-2 text-xs text-red-500 hover:text-red-700 transition-colors">Remove</button>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#1a1a1a] flex-shrink-0">
                    ${(parseFloat(item.price.replace(/[$,]/g, "")) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}

              <button onClick={() => { clearCart(); showToast("Cart cleared", "info"); }} className="text-xs text-[#5a5a5a] hover:text-red-600 transition-colors self-start mt-2">
                Clear cart
              </button>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#d6cfc6] rounded-sm p-6 sticky top-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a] mb-5">Order Summary</h2>
                <div className="flex flex-col gap-3 text-sm mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-[#5a5a5a]">
                      <span className="truncate mr-4">{item.name} × {item.quantity}</span>
                      <span className="flex-shrink-0">${(parseFloat(item.price.replace(/[$,]/g, "")) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#f0ebe4] pt-4 mb-6">
                  <div className="flex justify-between text-sm font-medium text-[#1a1a1a]">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#5a5a5a] mt-1">Shipping calculated at checkout</p>
                </div>
                <button onClick={handleCheckout} className="w-full bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors">
                  Checkout
                </button>
                <Link href="/living" className="block text-center text-sm text-[#5a5a5a] hover:text-[#8b3a2a] transition-colors mt-4">
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
