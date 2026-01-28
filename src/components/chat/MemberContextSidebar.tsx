"use client";

import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface MemberContext {
  profile: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    joinedAt: string;
  };
  stats: {
    lifetimeValue: number;
    productsOwned: number;
    lessonsCompleted: number;
    averageProgress: number;
    postsCount: number;
    commentsCount: number;
  };
  products: Array<{
    name: string;
    slug: string;
    purchasedAt: string;
    source: string;
    amount: number;
  }>;
  lastActiveAt: string | null;
}

interface MemberContextSidebarProps {
  memberId: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function InfoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function MemberContextSidebar({ memberId, isOpen, onClose }: MemberContextSidebarProps) {
  const [context, setContext] = useState<MemberContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !memberId) {
      return;
    }

    async function fetchContext() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/messages/member-context/${memberId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch member context");
        }
        const data = await response.json();
        setContext(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchContext();
  }, [memberId, isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => onClose()} // This will toggle it open
        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Show member info"
      >
        <InfoIcon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="w-[200px] border-l border-gray-100 bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Info</span>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Hide sidebar"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-violet-500" />
          </div>
        )}

        {error && (
          <div className="p-3">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && context && (
          <div className="p-3 space-y-4">
            {/* Profile Summary */}
            <div className="text-center">
              <UserAvatar
                avatarUrl={context.profile.avatarUrl}
                name={context.profile.fullName}
                userId={context.profile.id}
                size="md"
                className="mx-auto"
              />
              <p className="mt-2 text-sm font-medium text-gray-900 truncate">
                {context.profile.fullName || "No name"}
              </p>
              <p className="text-xs text-gray-500 truncate">{context.profile.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Joined {formatRelativeTime(context.profile.joinedAt)}
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(context.stats.lifetimeValue)}
                </p>
                <p className="text-[10px] text-gray-500">LTV</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  {context.stats.productsOwned}
                </p>
                <p className="text-[10px] text-gray-500">Products</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  {context.stats.averageProgress}%
                </p>
                <p className="text-[10px] text-gray-500">Progress</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  {context.stats.lessonsCompleted}
                </p>
                <p className="text-[10px] text-gray-500">Lessons</p>
              </div>
            </div>

            {/* Community Activity */}
            <div className="bg-white rounded-lg p-2 border border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Community</p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{context.stats.postsCount} posts</span>
                <span className="text-gray-600">{context.stats.commentsCount} comments</span>
              </div>
            </div>

            {/* Products */}
            {context.products.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Purchases</p>
                <div className="space-y-2">
                  {context.products.slice(0, 3).map((product, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-2 border border-gray-100"
                    >
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400">
                          {formatDate(product.purchasedAt)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          product.source === "portal"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-violet-50 text-violet-600"
                        }`}>
                          {product.source === "portal" ? "Portal" : "Funnel"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {context.products.length > 3 && (
                    <p className="text-[10px] text-gray-400 text-center">
                      +{context.products.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Last Active */}
            {context.lastActiveAt && (
              <div className="text-center pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-400">
                  Last active {formatRelativeTime(context.lastActiveAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Collapsed toggle button for showing member context
export function MemberContextToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
      title="Show member info"
    >
      <ChevronLeftIcon className="w-4 h-4" />
    </button>
  );
}
