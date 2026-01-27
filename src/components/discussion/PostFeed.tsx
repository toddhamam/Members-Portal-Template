"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePosts, useReaction } from "@/lib/hooks/useDiscussion";
import { PostCard } from "./PostCard";
import { MentionInput } from "./MentionInput";
import { ImageUploadButton } from "./ImageUpload";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { ReactionType } from "@/lib/supabase/types";

// Icons
function SendIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function LoaderIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function PostFeed() {
  const { profile } = useAuth();
  const { posts, isLoading, error, hasMore, loadMore, createPost, deletePost, refresh } = usePosts();
  const { react, unreact } = useReaction();

  const [newPostBody, setNewPostBody] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newPostBody.trim() && newPostImages.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createPost(newPostBody.trim(), newPostImages);
      setNewPostBody("");
      setNewPostImages([]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    if (newPostImages.length < 4) {
      setNewPostImages((prev) => [...prev, url]);
    }
  };

  const removeImage = (index: number) => {
    setNewPostImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReact = useCallback(
    async (postId: string, type: ReactionType) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (post.user_reaction) {
        await unreact(postId);
      } else {
        await react(type, postId);
      }
      // Refresh to get updated counts
      refresh();
    },
    [posts, react, unreact, refresh]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      try {
        await deletePost(postId);
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    },
    [deletePost]
  );

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {/* Composer skeleton */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 h-20 bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Post skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#e5e7eb] rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="w-20 h-3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded" />
              <div className="w-3/4 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 mb-4">Failed to load posts</p>
        <button
          onClick={() => refresh()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Post Composer */}
      <form onSubmit={handleSubmitPost} className="bg-white border border-[#e5e7eb] rounded-xl p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <UserAvatar
            avatarUrl={profile?.avatar_url}
            name={profile?.full_name}
            userId={profile?.id}
            size="md"
          />

          {/* Input */}
          <div className="flex-1">
            <MentionInput
              value={newPostBody}
              onChange={setNewPostBody}
              placeholder="Share something with the community... Use @ to mention someone"
              className="min-h-[80px]"
              rows={3}
              maxLength={5000}
            />

            {/* Image Previews */}
            {newPostImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {newPostImages.map((url, index) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-[#e5e7eb]"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {submitError && (
              <p className="text-sm text-red-600 mt-2">{submitError}</p>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <ImageUploadButton
                  onUpload={handleImageUpload}
                  disabled={newPostImages.length >= 4 || isSubmitting}
                />
                {newPostImages.length > 0 && (
                  <span className="text-xs text-[#9ca3af]">
                    {newPostImages.length}/4 images
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={(!newPostBody.trim() && newPostImages.length === 0) || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#222222] hover:bg-black text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoaderIcon className="w-4 h-4" />
                    Posting...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-4 h-4" />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-8 text-center">
          <p className="text-[#6b7280] mb-2">No posts yet</p>
          <p className="text-sm text-[#9ca3af]">Be the first to share something with the community!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReact={handleReact}
              onDelete={handleDelete}
              onRefresh={refresh}
            />
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-2 text-[#d4a574] hover:text-[#b8956c] font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Load more posts"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
