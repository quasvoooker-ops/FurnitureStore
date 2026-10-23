"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import SignInModal from "./components/SignInModal";
import ProductGrid from "./components/ProductGrid";
import { useAuth } from "./context/AuthContext";
import { apiGet } from "./lib/api";

interface Product {
  id: number;
  name: string;
  price: string;
  rating: number;
  image: string;
  is_available: boolean;
  category: string;
}

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/products/?ordering=-rating")
      .then((data) => {
        const list = data.results ?? data;
        // Show top 3 available products as best sellers
        setBestSellers(
          list.filter((p: Product) => p.is_available).slice(0, 3)
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        {loading && (
          <p className="text-[#5a5a5a] text-sm text-center py-10">Loading...</p>
        )}
        {!loading && bestSellers.length > 0 && (
          <ProductGrid products={bestSellers.map(p => ({
            ...p,
            price: `$${parseFloat(p.price).toLocaleString()}`,
          }))} />
        )}
        {!loading && bestSellers.length === 0 && (
          <p className="text-[#5a5a5a] text-sm text-center py-10">No products available yet.</p>
        )}
      </section>

      <SignInModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
