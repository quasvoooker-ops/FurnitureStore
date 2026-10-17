"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { apiPost } from "../lib/api";
import CartIconButton from "./CartIconButton";

interface NavbarProps {
  showNav?: boolean;
  onProtectedClick?: (e: React.MouseEvent) => void;
}

export default function Navbar({ showNav = true, onProtectedClick }: NavbarProps) {
  const { user, isLoggedIn, logout } = useAuth();
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
              <CartIconButton />
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
