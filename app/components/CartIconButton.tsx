"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartIconButton() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .955-.343 1.087-.835l1.45-5.437A1.125 1.125 0 0021.375 9H7.107m.393 5.25L6.106 5.272" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#8b3a2a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
