"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { NotificationBell } from "@/components/discussion/NotificationBell";

function UserAvatar({ name, className = "w-8 h-8" }: { name?: string; className?: string }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={`${className} rounded-full bg-[#d4a574] flex items-center justify-center text-white font-medium text-sm`}
    >
      {initials}
    </div>
  );
}

export function PortalHeader() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error('Sign out failed:', error);
      router.push("/login");
    }
  };

  const displayName = profile?.full_name || profile?.first_name || user?.email || "User";

  return (
    <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6">
      {/* Page Title - can be customized per page */}
      <div>
        <h1 className="text-lg font-semibold text-[#222222] font-serif">Member Portal</h1>
      </div>

      {/* Right side: Notifications + User Menu */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
        >
          <UserAvatar name={displayName} />
          <span className="text-sm font-medium text-[#222222] hidden sm:block">
            {displayName}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-3 border-b border-[#e5e7eb]">
              <p className="text-sm font-medium text-[#222222]">{displayName}</p>
              <p className="text-xs text-[#6b7280] truncate">{user?.email}</p>
            </div>

            <Link
              href="/portal/account"
              className="block px-4 py-2 text-sm text-[#4b5563] hover:bg-[#faf9f7] hover:text-[#222222]"
              onClick={() => setIsMenuOpen(false)}
            >
              Account Settings
            </Link>

            <div className="border-t border-[#e5e7eb] mt-1 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-[#ee5d0b] hover:bg-orange-50 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
