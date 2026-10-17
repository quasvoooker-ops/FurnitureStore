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

function CartIcon({ count }: { count: number }) {
  return (
    <Link href="/cart" className="relative text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .955-.343 1.087-.835l1.45-5.437A1.125 1.125 0 0021.375 9H7.107m.393 5.25L6.106 5.272" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#8b3a2a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar({ showNav = true, onProtectedClick }: NavbarProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  async function handleLogout() {
    try {
      if (user?.token) await apiPost("auth/logout/", {});
    } catch {
      // ignore
    } finally {
      logout();
      router.push("/");
    }
  }

  return (
    <header className="w-full bg-[#f5f0ea] border-b border-[#d6cfc6]">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] tracking-wide"
        >
          Fernwood &amp; Co.
        </Link>

        {showNav && (
          <nav className="hidden md:flex items-center gap-10">
            {(["Living", "Bedroom", "Dining"] as const).map((label) =>
              isLoggedIn ? (
                <Link
                  key={label}
                  href={`/${label.toLowerCase()}`}
                  className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors"
                >
                  {label}
                </Link>
              ) : (
                <button
                  key={label}
                  onClick={onProtectedClick}
                  className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors bg-transparent border-none cursor-pointer"
                >
                  {label}
                </button>
              )
            )}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <CartIcon count={totalItems} />
              <span className="text-sm text-[#5a5a5a] hidden md:block">
                Hi, {user?.full_name?.split(" ")[0]}
              </span>
              {user?.role === "admin" && (
                <Link href="/dashboard" className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors bg-transparent border-none cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-[#8b3a2a] text-white px-5 py-2 rounded-sm hover:bg-[#7a3225] transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
