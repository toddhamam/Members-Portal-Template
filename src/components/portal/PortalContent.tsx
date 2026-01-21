"use client";

import { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";
import { PortalHeader } from "./PortalHeader";

export function PortalContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`transition-all duration-300 pt-16 md:pt-0 ${
        isCollapsed ? "md:ml-16" : "md:ml-64"
      }`}
    >
      {/* Header only shown on desktop */}
      <div className="hidden md:block">
        <PortalHeader />
      </div>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
