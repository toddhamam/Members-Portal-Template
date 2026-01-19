"use client";

import { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";
import { PortalHeader } from "./PortalHeader";

export function PortalContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`transition-all duration-300 ${
        isCollapsed ? "ml-16" : "ml-64"
      }`}
    >
      <PortalHeader />
      <main className="p-6">{children}</main>
    </div>
  );
}
