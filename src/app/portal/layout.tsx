import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider } from "@/components/portal/SidebarContext";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalContent } from "@/components/portal/PortalContent";

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
      <SidebarProvider>
        <div className="min-h-screen bg-[#faf9f7]">
          <PortalSidebar />
          <PortalContent>{children}</PortalContent>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
