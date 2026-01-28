"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // Redirect non-admins to the portal dashboard
    if (!profile?.is_admin) {
      router.replace("/portal");
    }
  }, [profile, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
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

  return <>{children}</>;
}
