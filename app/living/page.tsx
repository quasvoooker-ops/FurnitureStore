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

export default function LivingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    apiGet("/products/?category=living")
      .then((data) => {
        const list = (data.results ?? data).filter((p: Product) => p.is_available);
        setProducts(list);
        setFiltered(list);
      })
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sort === "price-desc") list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    setFiltered(list);
  }, [search, sort, products]);

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-2">
          <p className="text-xs text-[#5a5a5a]">
            <Link href="/" className="hover:text-[#8b3a2a]">Home</Link>{" / Living"}
          </p>
        </div>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a]">Living Room</h1>
          <div className="flex gap-3">
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#8b3a2a] w-48" />
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#8b3a2a]">
              <option value="default">Sort by</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
        {loading && <p className="text-[#5a5a5a] text-sm py-20 text-center">Loading products...</p>}
        {error && <p className="text-red-600 text-sm py-20 text-center">{error}</p>}
        {!loading && !error && filtered.length === 0 && <p className="text-[#5a5a5a] text-sm py-20 text-center">No products found.</p>}
        {!loading && !error && filtered.length > 0 && (
          <ProductGrid products={filtered.map(p => ({ ...p, price: `$${parseFloat(p.price).toLocaleString()}` }))} />
        )}
      </main>
    </div>
  );
}
