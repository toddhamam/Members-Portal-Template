"use client";

import { PostFeed } from "@/components/discussion/PostFeed";
import { CommunitySidebar, MobileSidebarPreview } from "@/components/discussion/CommunitySidebar";

export default function CommunityPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#222222]">Community Chat</h1>
        <p className="text-[#6b7280] mt-1">
          Connect with fellow members, share insights, and ask questions.
        </p>
      </div>

      {/* Mobile: Horizontal scroll preview of pinned/trending */}
      <div className="lg:hidden">
        <MobileSidebarPreview />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Feed - 2/3 width on desktop */}
        <main className="flex-1 lg:max-w-2xl">
          <PostFeed />
        </main>

        {/* Sidebar - 1/3 width on desktop, hidden on mobile (shown as preview above) */}
        <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
          <div className="sticky top-6">
            <CommunitySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
