"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SignInModal from "./SignInModal";

interface Product {
  id: number;
  name: string;
  price: string;
  rating: number;
  image: string;
}

interface ProductGridProps {
  products: Product[];
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-[#8b3a2a]" : "text-[#c9b9a8]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

import { useToast } from "./Toast";

export default function ProductGrid({ products }: ProductGridProps) {
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [added, setAdded] = useState<number | null>(null);

  function handleAddToCart(e: React.MouseEvent, product: Product) {
    e.preventDefault();
    if (!isLoggedIn) {
      setModalOpen(true);
      return;
    }
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    setAdded(product.id);
    showToast(`${product.name} added to cart`);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((item) => (
          <div key={item.id} className="bg-[#f5f0ea]">
            {/* Clickable image */}
            <Link href={`/products/${item.id}`}>
              <div className="bg-[#e8e0d5] aspect-[4/3] overflow-hidden mb-4 cursor-pointer">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            <div className="flex items-end justify-between">
              <div>
                {/* Clickable name */}
                <Link href={`/products/${item.id}`}>
                  <p className="text-sm font-medium text-[#1a1a1a] mb-0.5 hover:text-[#8b3a2a] transition-colors">
                    {item.name}
                  </p>
                </Link>
                <p className="text-sm text-[#5a5a5a] mb-1.5">{item.price}</p>
                <StarRating rating={item.rating} />
              </div>
              <button
                onClick={(e) => handleAddToCart(e, item)}
                className={`text-xs border px-4 py-2 transition-colors ${
                  added === item.id
                    ? "border-[#8b3a2a] bg-[#8b3a2a] text-white"
                    : "border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                {added === item.id ? "added ✓" : "add to cart"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <SignInModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
