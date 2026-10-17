"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { apiPost } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function OTPPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("register");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("otp_email") || "";
    const savedPurpose = localStorage.getItem("otp_purpose") || "register";
    setEmail(savedEmail);
    setPurpose(savedPurpose);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("auth/verify-otp/", { email, code, purpose });

      // Log the user in via context
      login({
        token: data.token,
        role: data.role,
        full_name: data.full_name,
        email: data.email,
      });

      localStorage.removeItem("otp_email");
      localStorage.removeItem("otp_purpose");

      // Redirect based on role
      if (data.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      await apiPost("auth/resend-otp/", { email, purpose });
      setSuccess("A new OTP has been sent to your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar showNav={false} />

      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-2">
              Verify your email
            </h1>
            <p className="text-sm text-[#5a5a5a]">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-[#1a1a1a]">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#1a1a1a]" htmlFor="code">
                Verification code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors tracking-[0.3em]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors mt-1 disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : purpose === "register"
                ? "Verify and create account"
                : "Verify and log in"}
            </button>

            <p className="text-center text-sm text-[#5a5a5a]">
              Didn&apos;t get it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-[#8b3a2a] hover:underline disabled:opacity-60"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
