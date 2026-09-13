"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { apiPost } from "../lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Save email for OTP step
      localStorage.setItem("otp_email", form.email);
      localStorage.setItem("otp_purpose", "login");
      router.push("/otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar showNav={false} />

      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-2">
              Sign in
            </h1>
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
              <label className="text-sm text-[#1a1a1a]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
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
              <label className="text-sm text-[#1a1a1a]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
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
              <Link href="/signup" className="text-[#8b3a2a] hover:underline">
                Create account
              </Link>
            </p>

            <p className="text-center text-sm">
              <Link href="/forgot-password" className="text-[#1a1a1a] hover:text-[#8b3a2a] transition-colors">
                Forgot password?
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
