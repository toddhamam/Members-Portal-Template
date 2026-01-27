"use client";

import { useState } from "react";
import { useSidebarData } from "@/lib/hooks/useSidebarData";
import { HighlightCard, HighlightCardSkeleton } from "./HighlightCard";
import { HotTopics, HotTopicsSkeleton } from "./HotTopics";

// Icons
function PinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );
}

type TabType = "pinned" | "trending" | "topics";

interface CommunitySidebarProps {
  onTopicClick?: (tag: string) => void;
}

/**
 * Community sidebar with tabbed interface for pinned posts, trending posts, and hot topics
 */
export function CommunitySidebar({ onTopicClick }: CommunitySidebarProps) {
  const { pinned, trending, hotTopics, isLoading, error } = useSidebarData();
  const [activeTab, setActiveTab] = useState<TabType>("pinned");

  if (error) {
    return (
      <div className="text-sm text-red-500 p-4">
        Failed to load sidebar
      </div>
    );
  }

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "pinned", label: "Pinned", count: pinned.length },
    { id: "trending", label: "Trending", count: trending.length },
    { id: "topics", label: "Topics", count: hotTopics.length },
  ];

  return (
    <aside className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#e5e7eb]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? "text-[#222222] bg-white"
                : "text-[#6b7280] hover:text-[#222222] hover:bg-[#faf9f7]"
            }`}
          >
            {tab.label}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4a574]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 min-h-[280px]">
        {/* Pinned Tab */}
        {activeTab === "pinned" && (
          <>
            {isLoading ? (
              <div className="space-y-2">
                <HighlightCardSkeleton />
                <HighlightCardSkeleton />
              </div>
            ) : pinned.length === 0 ? (
              <div className="text-center py-8">
                <PinIcon className="w-8 h-8 text-[#e5e7eb] mx-auto mb-2" />
                <p className="text-sm text-[#9ca3af]">No pinned posts</p>
                <p className="text-xs text-[#c4c9cf] mt-1">
                  Admins can pin important announcements
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pinned.map((post) => (
                  <HighlightCard key={post.id} post={post} showPinBadge />
                ))}
              </div>
            )}
          </>
        )}

        {/* Trending Tab */}
        {activeTab === "trending" && (
          <>
            {isLoading ? (
              <div className="space-y-2">
                <HighlightCardSkeleton />
                <HighlightCardSkeleton />
                <HighlightCardSkeleton />
              </div>
            ) : trending.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-8 h-8 text-[#e5e7eb] mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <p className="text-sm text-[#9ca3af]">No trending posts yet</p>
                <p className="text-xs text-[#c4c9cf] mt-1">
                  Posts with high engagement will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {trending.map((post) => (
                  <HighlightCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Topics Tab */}
        {activeTab === "topics" && (
          <>
            {isLoading ? (
              <HotTopicsSkeleton />
            ) : (
              <HotTopics topics={hotTopics} onTopicClick={onTopicClick} />
            )}
          </>
        )}
      </div>
    </aside>
  );
}

/**
 * Mobile-optimized version of sidebar content
 * Shows pinned posts in a horizontal scroll
 */
export function MobileSidebarPreview() {
  const { pinned, trending, isLoading } = useSidebarData();

  // Combine pinned and top trending for mobile preview
  const previewPosts = [...pinned, ...trending.slice(0, 2)].slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-64 p-3 rounded-lg bg-[#faf9f7] animate-pulse"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-full bg-gray-200 rounded mb-1" />
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (previewPosts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-[#6b7280] mb-2 flex items-center gap-1.5">
        <PinIcon className="w-3 h-3 text-[#d4a574]" />
        Highlights
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {previewPosts.map((post) => (
          <div key={post.id} className="flex-shrink-0 w-64">
            <HighlightCard post={post} showPinBadge={post.is_pinned} />
          </div>
        ))}
      </div>
    </div>
  );
}
