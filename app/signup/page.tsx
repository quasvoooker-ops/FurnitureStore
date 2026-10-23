"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { apiPost } from "../lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/auth/register/", {
        full_name: form.fullName,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("otp_email", form.email);
      localStorage.setItem("otp_purpose", "register");
      router.push("/otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  const passwordsMatch =
    form.confirmPassword === "" || form.password === form.confirmPassword;

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar showNav={false} />

      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-2">
              Create an account
            </h1>
            <p className="text-sm text-[#5a5a5a]">
              Join to start shopping and track your orders.
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#1a1a1a]" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Christian Camacho"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors"
              />
            </div>

            {/* Email */}
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

            {/* Password */}
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
                minLength={8}
                className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#1a1a1a]" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className={`w-full bg-white border rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none transition-colors ${
                  passwordsMatch
                    ? "border-[#d6cfc6] focus:border-[#8b3a2a]"
                    : "border-red-300 focus:border-red-400"
                }`}
              />
              {!passwordsMatch && (
                <p className="text-xs text-red-500 mt-0.5">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="w-full bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors mt-1 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-[#5a5a5a]">
              Already have an account?{" "}
              <Link href="/signin" className="text-[#8b3a2a] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
