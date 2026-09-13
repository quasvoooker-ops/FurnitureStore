"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "../lib/api";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/auth/login/", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("otp_email", form.email);
      localStorage.setItem("otp_purpose", "login");
      onClose();
      router.push("/otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-md mx-4 bg-[#f5f0ea] rounded-sm px-10 py-12 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-5 text-[#5a5a5a] hover:text-[#1a1a1a] text-xl leading-none transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-2">
            Sign in
          </h2>
          <p className="text-sm text-[#5a5a5a]">
            Sign in to add items to your cart and check out.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#1a1a1a]" htmlFor="modal-email">
              Email
            </label>
            <input
              id="modal-email"
              name="email"
              type="email"
              placeholder="Quasvoooker@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#1a1a1a]" htmlFor="modal-password">
              Password
            </label>
            <input
              id="modal-password"
              name="password"
              type="password"
              placeholder="••••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors mt-1 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>

          <p className="text-center text-sm text-[#5a5a5a]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" onClick={onClose} className="text-[#8b3a2a] hover:underline">
              Create account
            </Link>
          </p>

          <p className="text-center text-sm">
            <Link href="/forgot-password" onClick={onClose} className="text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
