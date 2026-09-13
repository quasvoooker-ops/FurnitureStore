"use client";

import Link from "next/link";

interface NavbarProps {
  showNav?: boolean;
  isLoggedIn?: boolean;
  onProtectedClick?: (e: React.MouseEvent) => void;
}

export default function Navbar({
  showNav = true,
  isLoggedIn = false,
  onProtectedClick,
}: NavbarProps) {
  return (
    <header className="w-full bg-[#f5f0ea] border-b border-[#d6cfc6]">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] tracking-wide"
        >
          Fernwood &amp; Co.
        </Link>

        {/* Nav links */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-10">
            {(["Living", "Bedroom", "Dining"] as const).map((label) => (
              <button
                key={label}
                onClick={onProtectedClick}
                className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors bg-transparent border-none cursor-pointer"
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/"
              className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors"
            >
              Log out
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-sm text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors"
              >
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
