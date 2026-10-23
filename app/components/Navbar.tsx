"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { apiPost } from "../lib/api";

interface NavbarProps {
  showNav?: boolean;
  onProtectedClick?: (e: React.MouseEvent) => void;
}

export default function Navbar({ showNav = true, onProtectedClick }: NavbarProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  async function handleLogout() {
    try {
      if (user?.token) await apiPost("/auth/logout/", {}, user.token);
    } catch { /* ignore */ }
    finally {
      logout();
      router.push("/");
    }
  }

  return (
    <header className="w-full bg-[#f5f0ea] border-b border-[#d6cfc6]">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] tracking-wide">
          Fernwood &amp; Co.
        </Link>

        {/* Nav links */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-10">
            {(["Living", "Bedroom", "Dining"] as const).map((label) =>
              isLoggedIn ? (
                <Link key={label} href={`/${label.toLowerCase()}`}
                  className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                  {label}
                </Link>
              ) : (
                <button key={label} onClick={onProtectedClick}
                  className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors bg-transparent border-none cursor-pointer">
                  {label}
                </button>
              )
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-[#5a5a5a] hidden md:block">
                Hi, {user?.full_name?.split(" ")[0]}
              </span>

              {/* Messages */}
              <Link href="/messages" className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                Messages
              </Link>

              {/* Cart with badge */}
              <Link href="/cart" className="relative text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8b3a2a] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Dashboard / My Account */}
              {user?.role === "admin" || user?.role === "staff" ? (
                <Link href="/dashboard" className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                  Dashboard
                </Link>
              ) : (
                <Link href="/dashboard/customer" className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                  My Account
                </Link>
              )}

              <button onClick={handleLogout}
                className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors bg-transparent border-none cursor-pointer">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                Log in
              </Link>
              <Link href="/signup"
                className="text-sm bg-[#8b3a2a] text-white px-5 py-2 rounded-sm hover:bg-[#7a3225] transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
