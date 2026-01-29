"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const ADMIN_SECTIONS = [
  {
    name: "Analytics",
    href: "/portal/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: "Automations",
    href: "/portal/admin/automations",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {ADMIN_SECTIONS.map((section) => {
              const isActive = section.href === "/portal/admin"
                ? pathname === "/portal/admin"
                : pathname.startsWith(section.href);

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-violet-500 text-violet-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {section.icon}
                  {section.name}
                </Link>
              );
            })}
          </div>
          <Link
            href="/portal"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Portal
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  // Determine if we're still waiting for profile to load
  // Profile loads in the background after isLoading becomes false
  const isProfileLoading = isLoading || (user && !profile);

  useEffect(() => {
    // Wait for auth and profile to finish loading
    if (isProfileLoading) return;

    // Redirect non-admins to the portal dashboard
    if (!profile?.is_admin) {
      router.replace("/portal");
    }
  }, [profile, isProfileLoading, router]);

  // Show loading state while checking auth or loading profile
  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#d4a574]/20 border-t-[#d4a574]" />
      </div>
    );
  }

  // Don't render children if not admin (will redirect)
  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AdminNav />
      {children}
    </div>
  );
}
