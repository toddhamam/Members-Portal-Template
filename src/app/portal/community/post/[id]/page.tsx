"use client";

import { use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePost, useReaction } from "@/lib/hooks/useDiscussion";
import { CommentSection } from "@/components/discussion/CommentSection";
import { renderMentions } from "@/components/discussion/MentionInput";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import type { ReactionType } from "@/lib/supabase/types";

function ArrowLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id: postId } = use(params);
  const router = useRouter();
  const { profile } = useAuth();
  const { post, comments, isLoading, error, addComment, deletePost, refresh } = usePost(postId);
  const { react, unreact } = useReaction();

  const isAdmin = profile?.is_admin || false;
  const isAuthor = post?.author_id === profile?.id;

  const handleReact = useCallback(
    async (type: ReactionType) => {
      if (!post) return;

      if (post.user_reaction) {
        await unreact(post.id);
      } else {
        await react(type, post.id);
      }
      refresh();
    },
    [post, react, unreact, refresh]
  );

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost();
      router.push("/portal/community");
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const response = await fetch(`/api/discussion/comments/${commentId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete comment");
    }
    refresh();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="w-20 h-3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded" />
              <div className="w-3/4 h-4 bg-gray-200 rounded" />
              <div className="w-1/2 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/portal/community"
          className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#222222] mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Community
        </Link>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 mb-4">
            {error?.message || "Post not found"}
          </p>
          <Link
            href="/portal/community"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-block"
          >
            Return to Community
          </Link>
        </div>
      </div>
    );
  }

  // Extract YouTube embeds from body
  const youtubeUrls = post.body.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/portal/community"
        className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#222222] mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Community
      </Link>

      {/* Post */}
      <article className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#e5e7eb]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Author Avatar */}
              <UserAvatar
                avatarUrl={post.author?.avatar_url}
                name={post.author?.full_name}
                userId={post.author_id}
                size="lg"
              />

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-[#222222]">
                    {formatDisplayName(post.author?.full_name)}
                  </span>
                  {post.is_pinned && (
                    <span className="px-2 py-0.5 bg-[#d4a574] text-white text-xs font-medium rounded">
                      Pinned
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                  <span>{formatTimeAgo(post.created_at)}</span>
                  {post.edited_at && <span>(edited)</span>}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            {(isAuthor || isAdmin) && (
              <button
                onClick={handleDelete}
                className="text-[#6b7280] hover:text-red-600 transition-colors p-2"
                title="Delete post"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="prose prose-sm max-w-none text-[#4b5563] whitespace-pre-wrap">
            {renderMentions(post.body)}
          </div>

          {/* Images */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div
              className={`mt-4 grid gap-2 ${
                post.image_urls.length === 1
                  ? "grid-cols-1"
                  : post.image_urls.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
              }`}
            >
              {post.image_urls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt=""
                  className="rounded-lg max-h-96 object-cover w-full"
                />
              ))}
            </div>
          )}

          {/* YouTube embeds */}
          {youtubeUrls && youtubeUrls.length > 0 && (
            <div className="mt-4 space-y-4">
              {youtubeUrls.slice(0, 2).map((url, idx) => {
                const videoId = extractYouTubeId(url);
                if (!videoId) return null;
                return (
                  <div
                    key={idx}
                    className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-gray-100"
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className="px-6 pb-6 flex items-center gap-4 border-b border-[#e5e7eb]">
          <button
            onClick={() => handleReact("like")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              post.user_reaction
                ? "bg-[#d4a574] text-white"
                : "bg-[#f5f3ef] text-[#6b7280] hover:bg-[#e8e4dc]"
            }`}
          >
            <span>👍</span>
            <span>
              {post.reaction_count > 0 ? post.reaction_count : "Like"}
            </span>
          </button>

          <div className="text-sm text-[#6b7280]">
            {post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#222222] mb-4">Comments</h2>
          <CommentSection
            comments={comments}
            onAddComment={addComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </article>
    </div>
  );
}
