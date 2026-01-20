"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

function BrandLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" stroke="#d4a574" strokeWidth="2" fill="none" />
      <path
        d="M50 20 C50 20, 35 40, 35 55 C35 65, 42 75, 50 80 C58 75, 65 65, 65 55 C65 40, 50 20, 50 20Z"
        fill="#d4a574"
      />
      <path
        d="M50 30 C50 30, 42 45, 42 55 C42 62, 46 68, 50 72 C54 68, 58 62, 58 55 C58 45, 50 30, 50 30Z"
        fill="#e85d04"
      />
      <path
        d="M50 40 C50 40, 46 50, 46 56 C46 60, 48 64, 50 66 C52 64, 54 60, 54 56 C54 50, 50 40, 50 40Z"
        fill="#faa307"
      />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandLogo className="w-12 h-12" />
            <div>
              <span className="text-sm font-medium tracking-widest text-[#222222] block">INNER WEALTH</span>
              <span className="text-sm font-medium tracking-widest text-[#222222]">INITIATE</span>
              <span className="text-[8px] align-top text-[#222222]">™</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#222222] mb-2 font-serif">
            Check Your Email
          </h1>
          <p className="text-[#6b7280] mb-6">
            We&apos;ve sent a password reset link to <strong className="text-[#222222]">{email}</strong>
          </p>
          <Link
            href="/login"
            className="text-[#ee5d0b] hover:text-[#d54d00] font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo className="w-12 h-12" />
          <div>
            <span className="text-sm font-medium tracking-widest text-[#222222] block">INNER WEALTH</span>
            <span className="text-sm font-medium tracking-widest text-[#222222]">INITIATE</span>
            <span className="text-[8px] align-top text-[#222222]">™</span>
          </div>
        </Link>
      </div>

      {/* Reset Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8">
        <h1 className="text-2xl font-semibold text-[#222222] text-center mb-2 font-serif">
          Reset Password
        </h1>
        <p className="text-[#6b7280] text-center mb-6">
          Enter your email and we&apos;ll send you a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#4b5563] mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#222222] hover:bg-black text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[#6b7280] mt-6">
        Remember your password?{" "}
        <Link href="/login" className="text-[#ee5d0b] hover:text-[#d54d00] font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
