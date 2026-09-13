"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import SignInModal from "./components/SignInModal";

const bestSellers = [
  {
    id: 1,
    name: "Harlow Sofa",
    price: "$2,180",
    rating: 4,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Windsor Table",
    price: "$1,599",
    rating: 4,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Copperfield",
    price: "$2,590",
    rating: 4,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop",
  },
];

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

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  function openModal(e: React.MouseEvent) {
    e.preventDefault();
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar onProtectedClick={openModal} />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-16 text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl font-normal text-[#1a1a1a] leading-tight mb-6">
          Furniture, made to last.
        </h1>
        <p className="text-[#5a5a5a] text-base leading-relaxed mb-10 max-w-sm mx-auto">
          Solid wood pieces built by small workshops,
          <br />
          delivered straight to your door.
        </p>
        <button
          onClick={openModal}
          className="inline-block bg-[#8b3a2a] text-white text-sm px-10 py-3 rounded-sm hover:bg-[#7a3225] transition-colors tracking-wide"
        >
          SHOP NOW
        </button>
      </section>

      {/* Best Sellers */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-normal text-[#1a1a1a] mb-8">
          Best sellers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bestSellers.map((item) => (
            <div key={item.id} className="bg-[#f5f0ea]">
              {/* Product image */}
              <div className="bg-[#e8e0d5] aspect-[4/3] overflow-hidden mb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Product info */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a] mb-0.5">{item.name}</p>
                  <p className="text-sm text-[#5a5a5a] mb-1.5">{item.price}</p>
                  <StarRating rating={item.rating} />
                </div>
                <button
                  onClick={openModal}
                  className="text-xs border border-[#1a1a1a] text-[#1a1a1a] px-4 py-2 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                >
                  add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sign In Modal */}
      <SignInModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
