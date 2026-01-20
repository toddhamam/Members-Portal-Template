"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const sessionId = searchParams.get("session_id");

  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailLocked, setIsEmailLocked] = useState(false);

  const supabase = createClient();

  // If we have a session_id, fetch the email from Stripe
  useEffect(() => {
    async function fetchEmailFromSession() {
      if (sessionId) {
        try {
          const response = await fetch(`/api/auth/session-email?session_id=${sessionId}`);
          const data = await response.json();
          if (data.email) {
            setEmail(data.email);
            setIsEmailLocked(true);
          }
        } catch (err) {
          console.error("Failed to fetch session email:", err);
        }
      } else if (emailParam) {
        setIsEmailLocked(true);
      }
    }
    fetchEmailFromSession();
  }, [sessionId, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    // Check if user already exists (email-only account from webhook)
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password: "temporary-check-password-that-wont-work",
    });

    // Try to sign up or update password
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: "",
        },
      },
    });

    if (signUpError) {
      // If user exists, try updating password via admin API
      if (signUpError.message.includes("already registered")) {
        // User exists, they need to use reset password flow
        setError("An account with this email already exists. Please use the login page or reset your password.");
        setIsLoading(false);
        return;
      }
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    // Auto sign in after signup
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    router.push("/portal");
  };

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

      {/* Signup Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-[#222222] font-serif">
            Create Your Account
          </h1>
          <p className="text-[#6b7280] mt-2">
            Set a password to access your purchased products anytime
          </p>
        </div>

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
              disabled={isEmailLocked}
              className={`w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition ${
                isEmailLocked ? "bg-[#f5f3ef] text-[#4b5563]" : ""
              }`}
              placeholder="you@example.com"
            />
            {isEmailLocked && (
              <p className="text-xs text-[#6b7280] mt-1">
                This is the email you used during checkout
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#4b5563] mb-1">
              Password
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
            <p className="text-xs text-[#6b7280] mt-1">Minimum 8 characters</p>
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
              minLength={8}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#222222] hover:bg-black text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
          >
            {isLoading ? "Creating Account..." : "Create Account & Access Products"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[#6b7280] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#ee5d0b] hover:text-[#d54d00] font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
