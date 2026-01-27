"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { renderMentions } from "./MentionInput";
import { AdminMenuItems } from "./AdminControls";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import type { PostWithAuthor, ReactionType } from "@/lib/supabase/types";

// Icons
function HeartIcon({ className = "w-5 h-5", filled = false }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ChatBubbleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function PinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );
}

function MoreIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Helper to detect YouTube URLs
function extractYouTubeId(text: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = text.match(regex);
  return match ? match[1] : null;
}

interface PostCardProps {
  post: PostWithAuthor;
  onReact?: (postId: string, type: ReactionType) => void;
  onDelete?: (postId: string) => void;
  onRefresh?: () => void;
  showFullContent?: boolean;
}

export const PostCard = memo(function PostCard({
  post,
  onReact,
  onDelete,
  onRefresh,
  showFullContent = false,
}: PostCardProps) {
  const { profile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [localReactionCount, setLocalReactionCount] = useState(post.reaction_count);
  const [localUserReaction, setLocalUserReaction] = useState<ReactionType | null>(post.user_reaction || null);

  const isAuthor = profile?.id === post.author_id;
  const isAdmin = profile?.is_admin || false;
  const canManage = isAuthor || isAdmin;

  const handleReact = async () => {
    if (!onReact) return;

    // Optimistic UI update
    if (localUserReaction) {
      setLocalUserReaction(null);
      setLocalReactionCount((prev) => Math.max(0, prev - 1));
    } else {
      setLocalUserReaction("like");
      setLocalReactionCount((prev) => prev + 1);
    }

    try {
      await onReact(post.id, "like");
    } catch {
      // Revert on error
      if (localUserReaction) {
        setLocalUserReaction("like");
        setLocalReactionCount((prev) => prev + 1);
      } else {
        setLocalUserReaction(null);
        setLocalReactionCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm("Are you sure you want to delete this post?")) {
      onDelete(post.id);
    }
    setShowMenu(false);
  };

  // Detect YouTube embeds
  const youtubeId = extractYouTubeId(post.body);

  // Truncate body for preview
  const displayBody = showFullContent
    ? post.body
    : post.body.length > 300
    ? post.body.slice(0, 300) + "..."
    : post.body;

  return (
    <article className="bg-white border border-[#e5e7eb] rounded-xl p-4 sm:p-6 transition-all hover:border-[#d4a574]/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <UserAvatar
            avatarUrl={post.author?.avatar_url}
            name={post.author?.full_name}
            userId={post.author_id}
            size="md"
          />

          {/* Author info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#222222]">
                {formatDisplayName(post.author?.full_name)}
              </span>
              {post.is_pinned && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#d4a574]/20 text-[#d4a574] px-2 py-0.5 rounded-full">
                  <PinIcon className="w-3 h-3" />
                  Pinned
                </span>
              )}
            </div>
            <span className="text-sm text-[#6b7280]">
              {formatRelativeTime(post.created_at)}
              {post.edited_at && " (edited)"}
            </span>
          </div>
        </div>

        {/* Menu */}
        {canManage && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-[#6b7280] hover:text-[#222222] rounded-lg hover:bg-[#f5f3ef] transition-colors"
            >
              <MoreIcon />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 min-w-[160px]">
                  {isAuthor && (
                    <Link
                      href={`/portal/community/post/${post.id}/edit`}
                      className="block px-4 py-2 text-sm text-[#222222] hover:bg-[#f5f3ef]"
                      onClick={() => setShowMenu(false)}
                    >
                      Edit post
                    </Link>
                  )}
                  {isAdmin && onRefresh && (
                    <>
                      <div className="border-t border-[#e5e7eb] my-1" />
                      <AdminMenuItems
                        post={post}
                        onUpdate={onRefresh}
                        onClose={() => setShowMenu(false)}
                      />
                    </>
                  )}
                  <div className="border-t border-[#e5e7eb] my-1" />
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="mb-4">
        <p className="text-[#222222] whitespace-pre-wrap">{renderMentions(displayBody)}</p>
        {!showFullContent && post.body.length > 300 && (
          <Link
            href={`/portal/community/post/${post.id}`}
            className="text-[#d4a574] hover:underline text-sm mt-1 inline-block"
          >
            Read more
          </Link>
        )}
      </div>

      {/* Images */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className={`mb-4 grid gap-2 ${post.image_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.image_urls.slice(0, 4).map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Image ${idx + 1}`}
              className="rounded-lg max-w-full h-auto max-h-96 object-cover w-full"
            />
          ))}
        </div>
      )}

      {/* YouTube embed */}
      {youtubeId && (
        <div className="mb-4 aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Hidden indicator (admin view) */}
      {post.is_hidden && isAdmin && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          This post is hidden{post.hidden_reason && `: ${post.hidden_reason}`}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 border-t border-[#e5e7eb]">
        {/* Like button */}
        <button
          onClick={handleReact}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            localUserReaction
              ? "text-red-500"
              : "text-[#6b7280] hover:text-red-500"
          }`}
        >
          <HeartIcon className="w-5 h-5" filled={!!localUserReaction} />
          <span>{localReactionCount > 0 ? localReactionCount : ""}</span>
        </button>

        {/* Comments link */}
        <Link
          href={`/portal/community/post/${post.id}`}
          className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#d4a574] transition-colors"
        >
          <ChatBubbleIcon className="w-5 h-5" />
          <span>{post.comment_count > 0 ? post.comment_count : ""}</span>
        </Link>
      </div>
    </article>
  );
});
