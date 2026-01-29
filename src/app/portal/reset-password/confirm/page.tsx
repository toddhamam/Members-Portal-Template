"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent } from "@supabase/supabase-js";

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

function ResetPasswordConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Ref to prevent double execution in React 18 Strict Mode
  const codeExchangeAttempted = useRef(false);

  useEffect(() => {
    const exchangeCodeAndCheckSession = async () => {
      const supabase = createClient();
      const code = searchParams.get("code");

      // If we have a code in the URL, exchange it for a session
      if (code) {
        // Prevent double execution (React 18 Strict Mode runs effects twice)
        if (codeExchangeAttempted.current) {
          console.log("[Reset Password] Code exchange already attempted, skipping...");
          return;
        }
        codeExchangeAttempted.current = true;

        console.log("[Reset Password] Exchanging code for session...");
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("[Reset Password] Code exchange error:", exchangeError);
          setError("Invalid or expired reset link. Please request a new password reset.");
          setIsCheckingSession(false);
          return;
        }

        console.log("[Reset Password] Code exchanged successfully");
        setIsValidSession(true);
        setIsCheckingSession(false);
        return;
      }

      // No code in URL, check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Invalid or expired reset link. Please request a new password reset.");
        setIsCheckingSession(false);
        return;
      }

      if (session) {
        setIsValidSession(true);
      } else {
        setError("Invalid or expired reset link. Please request a new password reset.");
      }

      setIsCheckingSession(false);
    };

    // Listen for auth state changes (PASSWORD_RECOVERY event)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setIsCheckingSession(false);
      }
    });

    exchangeCodeAndCheckSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <BrandLogo className="w-12 h-12" />
            <div>
              <span className="text-sm font-medium tracking-widest text-[#222222] block">INNER WEALTH</span>
              <span className="text-sm font-medium tracking-widest text-[#222222]">INITIATE</span>
              <span className="text-[8px] align-top text-[#222222]">™</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8 text-center">
          <p className="text-[#6b7280]">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#222222] mb-2 font-serif">
            Password Updated
          </h1>
          <p className="text-[#6b7280] mb-6">
            Your password has been successfully reset.
          </p>
          <button
            onClick={() => router.push("/portal")}
            className="w-full bg-[#222222] hover:bg-black text-white font-medium py-4 rounded-lg transition-colors tracking-wide"
          >
            Go to Portal
          </button>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="w-full max-w-md">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#222222] mb-2 font-serif">
            Link Expired
          </h1>
          <p className="text-[#6b7280] mb-6">
            {error || "This password reset link is invalid or has expired."}
          </p>
          <Link
            href="/portal/reset-password"
            className="inline-block w-full bg-[#222222] hover:bg-black text-white font-medium py-4 rounded-lg transition-colors tracking-wide text-center"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
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

      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8">
        <h1 className="text-2xl font-semibold text-[#222222] text-center mb-2 font-serif">
          Set New Password
        </h1>
        <p className="text-[#6b7280] text-center mb-6">
          Enter your new password below
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#4b5563] mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-[#6b7280]">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#4b5563] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#222222] hover:bg-black text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <ResetPasswordConfirmContent />
    </Suspense>
  );
}
