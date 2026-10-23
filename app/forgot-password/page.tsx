"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { apiPost } from "../lib/api";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  // Step 1 — Send OTP
  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/auth/forgot-password/", { email });
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — Verify OTP (just move to reset step, don't consume the OTP yet)
  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    // Don't call verify-otp here — that would mark the OTP as used.
    // Instead pass the code directly to reset-password which verifies + resets in one step.
    setStep("reset");
  }

  // Step 3 — Reset password
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await apiPost("/auth/reset-password/", {
        email,
        code,
        new_password: newPassword,
      });
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResend() {
    setError("");
    setResendMsg("");
    setResending(true);
    try {
      await apiPost("/auth/resend-otp/", { email, purpose: "reset" });
      setResendMsg("A new code has been sent to your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar showNav={false} />

      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">

          {/* ── Step 1: Enter email ── */}
          {step === "email" && (
            <>
              <div className="text-center mb-8">
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-2">
                  Forgot password?
                </h1>
                <p className="text-sm text-[#5a5a5a]">
                  Enter your email and we&apos;ll send you a reset code.
                </p>
              </div>
              {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}
              <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#1a1a1a]" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Quasvoooker@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send reset code"}
                </button>
                <p className="text-center text-sm text-[#5a5a5a]">
                  Remember it?{" "}
                  <Link href="/signin" className="text-[#8b3a2a] hover:underline">Sign in</Link>
                </p>
              </form>
            </>
          )}

          {/* ── Step 2: Enter OTP ── */}
          {step === "otp" && (
            <>
              <div className="text-center mb-8">
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-2">
                  Check your email
                </h1>
                <p className="text-sm text-[#5a5a5a]">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-[#1a1a1a]">{email}</span>
                </p>
              </div>
              {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}
              {resendMsg && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">{resendMsg}</div>}
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#1a1a1a]" htmlFor="code">Verification code</label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors tracking-[0.3em]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify code"}
                </button>
                <p className="text-center text-sm text-[#5a5a5a]">
                  Didn&apos;t get it?{" "}
                  <button type="button" onClick={handleResend} disabled={resending} className="text-[#8b3a2a] hover:underline disabled:opacity-60">
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ── Step 3: New password ── */}
          {step === "reset" && (
            <>
              <div className="text-center mb-8">
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-2">
                  New password
                </h1>
                <p className="text-sm text-[#5a5a5a]">
                  Choose a strong password for your account.
                </p>
              </div>
              {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}
              <form onSubmit={handleReset} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#1a1a1a]" htmlFor="newpw">New password</label>
                  <input
                    id="newpw"
                    type="password"
                    placeholder="••••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#1a1a1a]" htmlFor="confirmpw">Confirm password</label>
                  <input
                    id="confirmpw"
                    type="password"
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-white border border-[#d6cfc6] rounded-sm px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#a89f96] focus:outline-none focus:border-[#8b3a2a] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8b3a2a] text-white text-sm py-3 rounded-sm hover:bg-[#7a3225] transition-colors disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          )}

          {/* ── Step 4: Done ── */}
          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-normal text-[#1a1a1a] mb-2">
                Password updated
              </h1>
              <p className="text-sm text-[#5a5a5a] mb-8">
                Your password has been changed successfully.
              </p>
              <button
                onClick={() => router.push("/signin")}
                className="bg-[#8b3a2a] text-white text-sm px-10 py-3 rounded-sm hover:bg-[#7a3225] transition-colors"
              >
                Sign in
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
