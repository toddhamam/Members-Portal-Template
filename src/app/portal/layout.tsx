import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider } from "@/components/portal/SidebarContext";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalContent } from "@/components/portal/PortalContent";
import { MobileNav } from "@/components/portal/MobileNav";
import { ChatProvider, ChatContainer } from "@/components/chat";

// Force dynamic rendering - portal requires auth and env vars
export const dynamic = 'force-dynamic';

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
      <ChatProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-[#faf9f7] overflow-x-hidden max-w-[100vw]">
            {/* Mobile navigation - visible on mobile/tablet only */}
            <MobileNav />
            {/* Desktop sidebar - hidden on mobile/tablet */}
            <div className="hidden md:block">
              <PortalSidebar />
            </div>
            <PortalContent>{children}</PortalContent>

            {/* Chat UI - floating in bottom right */}
            <ChatContainer />
          </div>
        </SidebarProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
