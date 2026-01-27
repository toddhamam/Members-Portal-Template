"use client";

import { useState } from "react";
import type { PostWithAuthor } from "@/lib/supabase/types";

function PinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );
}

function EyeOffIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

function EyeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

interface AdminControlsProps {
  post: PostWithAuthor;
  onUpdate: () => void;
  className?: string;
}

export function AdminControls({ post, onUpdate, className = "" }: AdminControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [hideReason, setHideReason] = useState("");

  const handleTogglePin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/discussion/posts/${post.id}/pin`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle pin");
      }

      onUpdate();
    } catch (err) {
      console.error("Failed to toggle pin:", err);
      alert(err instanceof Error ? err.message : "Failed to toggle pin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHide = async () => {
    // If currently hidden, just unhide
    if (post.is_hidden) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/discussion/posts/${post.id}/hide`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "" }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to unhide post");
        }

        onUpdate();
      } catch (err) {
        console.error("Failed to unhide post:", err);
        alert(err instanceof Error ? err.message : "Failed to unhide post");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Show modal to get reason
      setShowHideModal(true);
    }
  };

  const handleConfirmHide = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/discussion/posts/${post.id}/hide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: hideReason.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to hide post");
      }

      setShowHideModal(false);
      setHideReason("");
      onUpdate();
    } catch (err) {
      console.error("Failed to hide post:", err);
      alert(err instanceof Error ? err.message : "Failed to hide post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Pin/Unpin Button */}
        <button
          onClick={handleTogglePin}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            post.is_pinned
              ? "bg-[#d4a574] text-white hover:bg-[#b8956c]"
              : "bg-[#f5f3ef] text-[#6b7280] hover:bg-[#e8e4dc] hover:text-[#222222]"
          } disabled:opacity-50`}
          title={post.is_pinned ? "Unpin post" : "Pin post"}
        >
          <PinIcon />
          <span>{post.is_pinned ? "Unpin" : "Pin"}</span>
        </button>

        {/* Hide/Show Button */}
        <button
          onClick={handleToggleHide}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            post.is_hidden
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-[#f5f3ef] text-[#6b7280] hover:bg-[#e8e4dc] hover:text-[#222222]"
          } disabled:opacity-50`}
          title={post.is_hidden ? "Show post" : "Hide post"}
        >
          {post.is_hidden ? <EyeIcon /> : <EyeOffIcon />}
          <span>{post.is_hidden ? "Show" : "Hide"}</span>
        </button>
      </div>

      {/* Hide Reason Modal */}
      {showHideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowHideModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#222222] mb-4">
              Hide Post
            </h3>

            <p className="text-sm text-[#6b7280] mb-4">
              This will hide the post from other users. Only admins and the author will be able to see it.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Reason (optional)
              </label>
              <input
                type="text"
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder="e.g., Inappropriate content"
                className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a574]"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowHideModal(false);
                  setHideReason("");
                }}
                className="px-4 py-2 text-[#6b7280] hover:text-[#222222] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHide}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Hiding..." : "Hide Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Inline admin menu for use in PostCard
interface AdminMenuItemsProps {
  post: PostWithAuthor;
  onUpdate: () => void;
  onClose: () => void;
}

export function AdminMenuItems({ post, onUpdate, onClose }: AdminMenuItemsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/discussion/posts/${post.id}/pin`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle pin");
      }

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Failed to toggle pin:", err);
      alert(err instanceof Error ? err.message : "Failed to toggle pin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHide = async () => {
    const reason = post.is_hidden
      ? ""
      : prompt("Enter reason for hiding (optional):");

    if (reason === null && !post.is_hidden) {
      return; // User cancelled
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/discussion/posts/${post.id}/hide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle hide");
      }

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Failed to toggle hide:", err);
      alert(err instanceof Error ? err.message : "Failed to toggle hide");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleTogglePin}
        disabled={isLoading}
        className="w-full text-left px-4 py-2 text-sm text-[#222222] hover:bg-[#f5f3ef] disabled:opacity-50 flex items-center gap-2"
      >
        <PinIcon className="w-4 h-4" />
        {post.is_pinned ? "Unpin post" : "Pin post"}
      </button>
      <button
        onClick={handleToggleHide}
        disabled={isLoading}
        className="w-full text-left px-4 py-2 text-sm text-[#222222] hover:bg-[#f5f3ef] disabled:opacity-50 flex items-center gap-2"
      >
        {post.is_hidden ? (
          <>
            <EyeIcon className="w-4 h-4" />
            Show post
          </>
        ) : (
          <>
            <EyeOffIcon className="w-4 h-4" />
            Hide post
          </>
        )}
      </button>
    </>
  );
}
