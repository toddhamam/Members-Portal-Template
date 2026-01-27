"use client";

import { memo } from "react";
import type { HotTopic } from "@/lib/hooks/useSidebarData";

// Fire icon for "hot" emphasis
function FireIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface HotTopicsProps {
  topics: HotTopic[];
  onTopicClick?: (tag: string) => void;
}

/**
 * Displays trending hashtags from the community
 */
export const HotTopics = memo(function HotTopics({
  topics,
  onTopicClick,
}: HotTopicsProps) {
  if (topics.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-[#9ca3af]">
          No trending topics yet
        </p>
        <p className="text-[10px] text-[#c4c9cf] mt-1">
          Use #hashtags in your posts!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => onTopicClick?.(tag)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#faf9f7] text-[#4b5563] hover:bg-[#d4a574]/10 hover:text-[#d4a574] border border-transparent hover:border-[#d4a574]/30 transition-all"
        >
          <span className="text-[#d4a574]">#</span>
          {tag}
          <span className="text-[10px] text-[#9ca3af] ml-0.5">
            {count}
          </span>
        </button>
      ))}
    </div>
  );
});

/**
 * Skeleton loader for HotTopics
 */
export function HotTopicsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-6 rounded-full bg-gray-200"
          style={{ width: `${50 + Math.random() * 30}px` }}
        />
      ))}
    </div>
  );
}

/**
 * Section header component for sidebar sections
 */
export function SidebarSectionHeader({
  icon,
  title,
  count,
}: {
  icon?: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-[#d4a574]">{icon}</span>}
      <h3 className="text-sm font-semibold text-[#222222]">{title}</h3>
      {typeof count === "number" && count > 0 && (
        <span className="text-[10px] text-[#9ca3af] bg-[#f5f3ef] px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export { FireIcon };
