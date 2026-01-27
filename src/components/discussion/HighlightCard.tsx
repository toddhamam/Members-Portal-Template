"use client";

import { memo } from "react";
import Link from "next/link";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import type { PostWithAuthor } from "@/lib/supabase/types";

// Icons
function HeartIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

function ChatBubbleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
      <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
    </svg>
  );
}

function PinIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );
}

// Helper to format relative time (compact)
function formatTimeCompact(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface HighlightCardProps {
  post: PostWithAuthor;
  showPinBadge?: boolean;
}

/**
 * Compact post card for sidebar display
 */
export const HighlightCard = memo(function HighlightCard({
  post,
  showPinBadge = false,
}: HighlightCardProps) {
  // Truncate body to ~80 chars for compact display
  const truncatedBody =
    post.body.length > 80 ? post.body.slice(0, 80).trim() + "..." : post.body;

  const engagement = (post.reaction_count || 0) + (post.comment_count || 0);

  return (
    <Link
      href={`/portal/community/post/${post.id}`}
      className="block p-3 rounded-lg bg-[#faf9f7] hover:bg-[#f5f3ef] border border-transparent hover:border-[#e5e7eb] transition-all group"
    >
      {/* Header: Avatar + Name + Time */}
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar
          avatarUrl={post.author?.avatar_url}
          name={post.author?.full_name}
          userId={post.author_id}
          size="xs"
        />
        <span className="text-xs font-medium text-[#222222] truncate flex-1">
          {formatDisplayName(post.author?.full_name)}
        </span>
        {showPinBadge && post.is_pinned && (
          <span className="flex items-center gap-0.5 text-[10px] text-[#d4a574]">
            <PinIcon />
          </span>
        )}
        <span className="text-[10px] text-[#9ca3af]">
          {formatTimeCompact(post.created_at)}
        </span>
      </div>

      {/* Body preview */}
      <p className="text-xs text-[#4b5563] line-clamp-2 leading-relaxed mb-2">
        {truncatedBody}
      </p>

      {/* Footer: Engagement stats */}
      <div className="flex items-center gap-3 text-[10px] text-[#9ca3af]">
        {post.reaction_count > 0 && (
          <span className="flex items-center gap-1">
            <HeartIcon className="w-3 h-3 text-red-400" />
            {post.reaction_count}
          </span>
        )}
        {post.comment_count > 0 && (
          <span className="flex items-center gap-1">
            <ChatBubbleIcon className="w-3 h-3" />
            {post.comment_count}
          </span>
        )}
        {engagement === 0 && (
          <span className="text-[#c4c9cf]">No activity yet</span>
        )}
      </div>
    </Link>
  );
});

/**
 * Skeleton loader for HighlightCard
 */
export function HighlightCardSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-[#faf9f7] animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gray-200" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="flex-1" />
        <div className="h-2 w-8 bg-gray-200 rounded" />
      </div>
      <div className="space-y-1.5 mb-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 w-8 bg-gray-200 rounded" />
        <div className="h-2 w-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
