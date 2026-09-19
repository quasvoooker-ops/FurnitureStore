"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import SignInModal from "./components/SignInModal";
import ProductGrid from "./components/ProductGrid";
import { useAuth } from "./context/AuthContext";

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

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  function handleProtected(e: React.MouseEvent) {
    e.preventDefault();
    if (isLoggedIn) {
      const label = (e.currentTarget as HTMLElement).textContent?.toLowerCase();
      if (label) router.push(`/${label}`);
    } else {
      setModalOpen(true);
    }
  }

  function handleShopNow() {
    if (isLoggedIn) {
      router.push("/living");
    } else {
      setModalOpen(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar onProtectedClick={handleProtected} />

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
          onClick={handleShopNow}
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
        <ProductGrid products={bestSellers} />
      </section>

      <SignInModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
