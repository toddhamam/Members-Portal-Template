"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionId } from "@/hooks/useSessionId";
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

function ClaimAccountContent() {
  const router = useRouter();
  const sessionId = useSessionId();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sessionError, setSessionError] = useState(false);

  // Fetch email from session
  useEffect(() => {
    async function fetchSessionData() {
      if (!sessionId) {
        setIsLoading(false);
        setSessionError(true);
        return;
      }

      try {
        const response = await fetch(`/api/auth/session-email?session_id=${sessionId}`);
        const data = await response.json();

        if (data.email) {
          setEmail(data.email);
          setName(data.name || "");
        } else {
          setSessionError(true);
        }
      } catch (err) {
        console.error("Failed to fetch session data:", err);
        setSessionError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessionData();
  }, [sessionId]);

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

    setIsSubmitting(true);

    try {
      // Claim the account (set password)
      const claimResponse = await fetch("/api/auth/claim-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, sessionId }),
      });

      const claimData = await claimResponse.json();

      if (!claimResponse.ok) {
        setError(claimData.error || "Failed to set up account");
        setIsSubmitting(false);
        return;
      }

      // Sign in with the new credentials
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        setIsSubmitting(false);
        return;
      }

      // Redirect to portal
      router.push("/portal");
    } catch (err) {
      console.error("Account setup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // When no session, show the manual registration form
  if (sessionError) {
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
            Set Up Your Account
          </h1>
          <p className="text-[#6b7280] text-center mb-6">
            Enter the email you used for your purchase
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email-manual" className="block text-sm font-medium text-[#4b5563] mb-1">
                Purchase Email
              </label>
              <input
                type="email"
                id="email-manual"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password-manual" className="block text-sm font-medium text-[#4b5563] mb-1">
                Create Password
              </label>
              <input
                type="password"
                id="password-manual"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword-manual" className="block text-sm font-medium text-[#4b5563] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword-manual"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#222222] hover:bg-black text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {isSubmitting ? "Setting up account..." : "Access My Products"}
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

      {/* Claim Account Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-8">
        <h1 className="text-2xl font-semibold text-[#222222] text-center mb-2 font-serif">
          Set Up Your Account
        </h1>
        <p className="text-[#6b7280] text-center mb-6">
          Create a password to access your products
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
              readOnly
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-[#6b7280] mt-1">
              This is the email from your purchase
            </p>
          </div>

          {name && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#4b5563] mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                readOnly
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#4b5563] mb-1">
              Create Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent outline-none transition"
              placeholder="At least 8 characters"
            />
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
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#222222] hover:bg-black text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
          >
            {isSubmitting ? "Setting up account..." : "Access My Products"}
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

export default function ClaimAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <ClaimAccountContent />
    </Suspense>
  );
}
