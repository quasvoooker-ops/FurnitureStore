import Link from "next/link";
import Navbar from "../components/Navbar";
import ProductGrid from "../components/ProductGrid";

const products = [
  {
    id: 1,
    name: "Chateau Oak Bed",
    price: "$2,500",
    rating: 4,
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Copperfield Chair",
    price: "$1,599",
    rating: 3,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Opalia Nightstand",
    price: "$2,990",
    rating: 4,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Mori Dresser",
    price: "$1,890",
    rating: 5,
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Lune Wardrobe",
    price: "$3,200",
    rating: 4,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Birch Bench",
    price: "$640",
    rating: 4,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Noma Bedside Lamp",
    price: "$290",
    rating: 3,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Fern Mirror",
    price: "$780",
    rating: 5,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  },
  {
    id: 9,
    name: "Cedar Chest",
    price: "$1,100",
    rating: 4,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
  },
];

export default function BedroomPage() {
  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-2">
          <p className="text-xs text-[#5a5a5a]">
            <Link href="/" className="hover:text-[#8b3a2a]">Home</Link>
            {" / Bedroom"}
          </p>
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a] mb-10">
          Bedroom
        </h1>

        <ProductGrid products={products} />
      </main>
    </div>
  );
}
