"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

export default function CustomerDashboard() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.push("/signin");
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) return null;

  const firstName = user.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-14">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-1">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-[#5a5a5a]">{user.email}</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            href="/living"
            className="flex items-center gap-4 bg-white border border-[#d6cfc6] rounded-sm px-6 py-5 hover:border-[#8b3a2a] hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-[#f5f0ea] rounded-full flex items-center justify-center text-[#8b3a2a] group-hover:bg-[#8b3a2a] group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">Browse Products</p>
              <p className="text-xs text-[#5a5a5a]">Shop living, bedroom & dining</p>
            </div>
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-4 bg-white border border-[#d6cfc6] rounded-sm px-6 py-5 hover:border-[#8b3a2a] hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-[#f5f0ea] rounded-full flex items-center justify-center text-[#8b3a2a] group-hover:bg-[#8b3a2a] group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">View Cart</p>
              <p className="text-xs text-[#5a5a5a]">Review items you&apos;ve added</p>
            </div>
          </Link>
        </div>

        {/* My Orders */}
        <div className="bg-white border border-[#d6cfc6] rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ebe4] flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a]">
              My Orders
            </h2>
          </div>
          <div className="px-6 py-14 text-center">
            <div className="w-14 h-14 bg-[#f5f0ea] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#a89f96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#1a1a1a] mb-1">No orders yet</p>
            <p className="text-xs text-[#5a5a5a] mb-6">
              When you place an order, it will appear here.
            </p>
            <Link
              href="/living"
              className="inline-block bg-[#8b3a2a] text-white text-sm px-8 py-2.5 rounded-sm hover:bg-[#7a3225] transition-colors"
            >
              Start shopping
            </Link>
          </div>
        </div>

        {/* Account info */}
        <div className="mt-6 bg-white border border-[#d6cfc6] rounded-sm">
          <div className="px-6 py-4 border-b border-[#f0ebe4]">
            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a]">
              Account
            </h2>
          </div>
          <div className="px-6 py-5 flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#5a5a5a]">Full name</span>
              <span className="text-[#1a1a1a] font-medium">{user.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#5a5a5a]">Email</span>
              <span className="text-[#1a1a1a]">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#5a5a5a]">Account type</span>
              <span className="text-[#1a1a1a] capitalize">{user.role}</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
