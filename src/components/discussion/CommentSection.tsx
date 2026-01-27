"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useReaction } from "@/lib/hooks/useDiscussion";
import { MentionInput, renderMentions } from "./MentionInput";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import type { CommentWithAuthor, ReactionType } from "@/lib/supabase/types";

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

function LoaderIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

interface CommentItemProps {
  comment: CommentWithAuthor;
  onReply: (parentId: string, parentAuthor: string) => void;
  onDelete: (commentId: string) => void;
  isAdmin: boolean;
  currentUserId?: string;
  depth?: number;
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  isAdmin,
  currentUserId,
  depth = 0,
}: CommentItemProps) {
  const { react, unreact } = useReaction();
  const [localReaction, setLocalReaction] = useState<ReactionType | null>(
    comment.user_reaction || null
  );
  const [localReactionCount, setLocalReactionCount] = useState(comment.reaction_count);
  const [showMenu, setShowMenu] = useState(false);

  const canDelete = comment.author_id === currentUserId || isAdmin;

  const handleReact = async () => {
    const wasReacted = localReaction !== null;

    // Optimistic update
    if (wasReacted) {
      setLocalReaction(null);
      setLocalReactionCount((prev) => Math.max(0, prev - 1));
      try {
        await unreact(undefined, comment.id);
      } catch {
        // Revert on error
        setLocalReaction(comment.user_reaction || null);
        setLocalReactionCount(comment.reaction_count);
      }
    } else {
      setLocalReaction("like");
      setLocalReactionCount((prev) => prev + 1);
      try {
        await react("like", undefined, comment.id);
      } catch {
        // Revert on error
        setLocalReaction(null);
        setLocalReactionCount(comment.reaction_count);
      }
    }
  };

  const maxDepth = 2;
  const showNested = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? "ml-8 mt-3" : ""}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <UserAvatar
          avatarUrl={comment.author?.avatar_url}
          name={comment.author?.full_name}
          userId={comment.author_id}
          size="sm"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#faf9f7] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-[#222222]">
                {formatDisplayName(comment.author?.full_name)}
              </span>
              <span className="text-xs text-[#9ca3af]">
                {formatTimeAgo(comment.created_at)}
              </span>
              {comment.edited_at && (
                <span className="text-xs text-[#9ca3af]">(edited)</span>
              )}
            </div>
            <p className="text-sm text-[#4b5563] mt-1 whitespace-pre-wrap break-words">
              {renderMentions(comment.body)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1 px-1">
            <button
              onClick={handleReact}
              className={`text-xs font-medium transition-colors ${
                localReaction
                  ? "text-[#d4a574]"
                  : "text-[#6b7280] hover:text-[#d4a574]"
              }`}
            >
              Like{localReactionCount > 0 && ` (${localReactionCount})`}
            </button>

            <button
              onClick={() =>
                onReply(comment.id, formatDisplayName(comment.author?.full_name))
              }
              className="text-xs font-medium text-[#6b7280] hover:text-[#d4a574] transition-colors"
            >
              Reply
            </button>

            {canDelete && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-xs text-[#6b7280] hover:text-[#222222] transition-colors"
                >
                  •••
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {showNested && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentSectionProps {
  comments: CommentWithAuthor[];
  onAddComment: (body: string, parentId?: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  isLoading?: boolean;
}

export function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  isLoading = false,
}: CommentSectionProps) {
  const { profile } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    author: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = profile?.is_admin || false;
  const currentUserId = profile?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim(), replyingTo?.id);
      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = useCallback((parentId: string, parentAuthor: string) => {
    setReplyingTo({ id: parentId, author: parentAuthor });
  }, []);

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!confirm("Are you sure you want to delete this comment?")) return;
      try {
        await onDeleteComment(commentId);
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    },
    [onDeleteComment]
  );

  return (
    <div className="space-y-4">
      {/* Comment Composer */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        {/* Avatar */}
        <UserAvatar
          avatarUrl={profile?.avatar_url}
          name={profile?.full_name}
          userId={profile?.id}
          size="sm"
        />

        {/* Input */}
        <div className="flex-1">
          {replyingTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-[#6b7280]">
              <span>Replying to {replyingTo.author}</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-[#d4a574] hover:text-[#b8956c]"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <MentionInput
              value={newComment}
              onChange={setNewComment}
              placeholder={
                replyingTo
                  ? "Write a reply..."
                  : "Write a comment... Use @ to mention someone"
              }
              className="flex-1"
              rows={1}
              maxLength={5000}
            />

            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-[#222222] hover:bg-black text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              {isSubmitting ? (
                <LoaderIcon className="w-4 h-4" />
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="py-8 text-center">
          <LoaderIcon className="w-6 h-6 mx-auto text-[#d4a574]" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-[#6b7280] py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
