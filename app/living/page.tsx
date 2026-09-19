import Link from "next/link";
import Navbar from "../components/Navbar";
import ProductGrid from "../components/ProductGrid";

const products = [
  {
    id: 1,
    name: "Harlow Sofa",
    price: "$2,180",
    rating: 4,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Vellum Chair",
    price: "$1,599",
    rating: 4,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Velora Lounge",
    price: "$2,990",
    rating: 3,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Ember Coffee Table",
    price: "$890",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Drift Bookshelf",
    price: "$1,240",
    rating: 4,
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Croft Armchair",
    price: "$1,750",
    rating: 4,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Pebble Side Table",
    price: "$420",
    rating: 3,
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Haven Sectional",
    price: "$3,450",
    rating: 5,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=300&fit=crop",
  },
  {
    id: 9,
    name: "Slate TV Console",
    price: "$980",
    rating: 4,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&h=300&fit=crop",
  },
];

export default function LivingPage() {
  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-2">
          <p className="text-xs text-[#5a5a5a]">
            <Link href="/" className="hover:text-[#8b3a2a]">Home</Link>
            {" / Living"}
          </p>
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a] mb-10">
          Living Room
        </h1>

        <ProductGrid products={products} />
      </main>
    </div>
  );
}
