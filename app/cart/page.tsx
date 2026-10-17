"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ""));
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-10">
          Your cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#5a5a5a] mb-6">Your cart is empty.</p>
            <Link
              href="/"
              className="text-sm bg-[#8b3a2a] text-white px-6 py-3 rounded-sm hover:bg-[#7a3225] transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-5 border-b border-[#d6cfc6] pb-6">
                  <div className="w-24 h-24 bg-[#e8e0d5] overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-[#1a1a1a]">{item.name}</p>
                      <p className="text-sm text-[#1a1a1a]">{item.price}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-[#d6cfc6]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-[#1a1a1a] hover:bg-[#e8e0d5] transition-colors"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 text-sm text-[#1a1a1a]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-[#1a1a1a] hover:bg-[#e8e0d5] transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-[#5a5a5a] hover:text-[#8b3a2a] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-end gap-4">
              <div className="flex justify-between w-full border-t border-[#d6cfc6] pt-6">
                <span className="text-sm text-[#5a5a5a]">Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                <span className="text-sm font-medium text-[#1a1a1a]">₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
              <button className="w-full bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors">
                Proceed to checkout
              </button>
              <button
                onClick={clearCart}
                className="text-xs text-[#5a5a5a] hover:text-[#8b3a2a] transition-colors"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
