"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ProductGrid from "../components/ProductGrid";
import { apiGet } from "../lib/api";

interface Product {
  id: number;
  name: string;
  price: string;
  rating: number;
  image: string;
  is_available: boolean;
  category: string;
}

export default function DiningPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/products/?category=dining")
      .then((data) => {
        const list = data.results ?? data;
        setProducts(list.filter((p: Product) => p.is_available));
      })
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-2">
          <p className="text-xs text-[#5a5a5a]">
            <Link href="/" className="hover:text-[#8b3a2a]">Home</Link>
            {" / Dining"}
          </p>
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a] mb-10">
          Dining
        </h1>
        {loading && <p className="text-[#5a5a5a] text-sm py-20 text-center">Loading products...</p>}
        {error && <p className="text-red-600 text-sm py-20 text-center">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-[#5a5a5a] text-sm py-20 text-center">No products available.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <ProductGrid products={products.map(p => ({
            ...p,
            price: `$${parseFloat(p.price).toLocaleString()}`,
          }))} />
        )}
      </main>
    </div>
  );
}
