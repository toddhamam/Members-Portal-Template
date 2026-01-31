import { AuthProvider } from "@/components/auth/AuthProvider";

// Force dynamic rendering - dashboard requires auth and env vars
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Funnel Dashboard | Inner Wealth Initiate",
  description: "Funnel metrics and analytics",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#faf9f7]">
        {children}
      </div>
    </AuthProvider>
  );
}
