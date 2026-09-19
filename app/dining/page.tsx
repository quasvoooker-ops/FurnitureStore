import Link from "next/link";
import Navbar from "../components/Navbar";
import ProductGrid from "../components/ProductGrid";

const products = [
  {
    id: 1,
    name: "Windsor Table",
    price: "$1,599",
    rating: 4,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Harlow Dining Chair",
    price: "$480",
    rating: 4,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Mast Bench Seat",
    price: "$890",
    rating: 3,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Opal Sideboard",
    price: "$2,100",
    rating: 5,
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Teak Round Table",
    price: "$1,850",
    rating: 4,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Arch Bar Stool",
    price: "$320",
    rating: 4,
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Cane Armchair",
    price: "$740",
    rating: 3,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Stone Lazy Susan",
    price: "$195",
    rating: 5,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop",
  },
  {
    id: 9,
    name: "Walnut Buffet",
    price: "$2,600",
    rating: 4,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=300&fit=crop",
  },
];

export default function DiningPage() {
  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-2">
          <p className="text-xs text-[#5a5a5a]">
            <Link href="/" className="hover:text-[#8b3a2a]">Home</Link>
            {" / Dining"}
          </p>
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a] mb-10">
          Dining
        </h1>

        <ProductGrid products={products} />
      </main>
    </div>
  );
}
