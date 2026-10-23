"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { apiGet } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import SignInModal from "../../components/SignInModal";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  rating: number;
  stock: number;
  is_available: boolean;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-[#8b3a2a]" : "text-[#c9b9a8]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet(`/products/${id}/`)
      .then((data) => setProduct(data))
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    if (!isLoggedIn) {
      setModalOpen(true);
      return;
    }
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: `$${parseFloat(product.price).toLocaleString()}`,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const categoryLabel: Record<string, string> = {
    living: "Living",
    bedroom: "Bedroom",
    dining: "Dining",
  };

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-8 py-12">

        {loading && (
          <p className="text-center text-[#5a5a5a] py-20">Loading...</p>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-[#5a5a5a] mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-sm text-[#8b3a2a] hover:underline"
            >
              ← Go back
            </button>
          </div>
        )}

        {product && !loading && (
          <>
            {/* Breadcrumb */}
            <div className="mb-8">
              <p className="text-xs text-[#5a5a5a]">
                <Link href="/" className="hover:text-[#8b3a2a]">Home</Link>
                {" / "}
                <Link
                  href={`/${product.category}`}
                  className="hover:text-[#8b3a2a] capitalize"
                >
                  {categoryLabel[product.category] || product.category}
                </Link>
                {" / "}
                <span className="text-[#1a1a1a]">{product.name}</span>
              </p>
            </div>

            {/* Product layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

              {/* Image */}
              <div className="bg-[#e8e0d5] aspect-square overflow-hidden rounded-sm">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#a89f96] text-sm">
                    No image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center">
                {/* Category badge */}
                <p className="text-xs text-[#8b3a2a] uppercase tracking-widest mb-3">
                  {categoryLabel[product.category] || product.category}
                </p>

                {/* Name */}
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-[#5a5a5a]">{product.rating} / 5</span>
                </div>

                {/* Price */}
                <p className="text-2xl text-[#1a1a1a] font-medium mb-6">
                  ${parseFloat(product.price).toLocaleString()}
                </p>

                {/* Description */}
                {product.description && (
                  <div className="mb-8">
                    <h2 className="text-sm font-medium text-[#1a1a1a] mb-2">Description</h2>
                    <p className="text-sm text-[#5a5a5a] leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Stock status */}
                <div className="flex items-center gap-2 mb-6">
                  <span className={`w-2 h-2 rounded-full ${product.is_available && product.stock > 0 ? "bg-green-500" : "bg-red-400"}`} />
                  <span className="text-xs text-[#5a5a5a]">
                    {product.is_available && product.stock > 0
                      ? `In stock (${product.stock} available)`
                      : "Currently unavailable"}
                  </span>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.is_available || product.stock === 0}
                  className={`w-full py-3.5 text-sm rounded-sm transition-colors ${
                    added
                      ? "bg-green-600 text-white"
                      : product.is_available && product.stock > 0
                      ? "bg-[#8b3a2a] text-white hover:bg-[#7a3225]"
                      : "bg-[#c9b9a8] text-white cursor-not-allowed"
                  }`}
                >
                  {added
                    ? "Added to cart ✓"
                    : product.is_available && product.stock > 0
                    ? "Add to cart"
                    : "Unavailable"}
                </button>

                {/* Back link */}
                <button
                  onClick={() => router.back()}
                  className="mt-4 text-sm text-[#5a5a5a] hover:text-[#8b3a2a] transition-colors text-center"
                >
                  ← Back to {categoryLabel[product.category] || "products"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <SignInModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
