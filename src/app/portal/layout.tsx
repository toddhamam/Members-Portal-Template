import { AuthProvider } from "@/components/auth/AuthProvider";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalHeader } from "@/components/portal/PortalHeader";

// Force dynamic rendering for all portal pages (requires auth)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Member Portal | Inner Wealth Initiate",
  description: "Access your purchased products and courses",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#faf9f7]">
        <PortalSidebar />
        <div className="ml-64">
          <PortalHeader />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
