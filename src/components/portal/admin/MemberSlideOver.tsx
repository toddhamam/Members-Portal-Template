"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { MemberDetailResponse, ActivityStatus } from "@/lib/admin/types";
import { ProductProgressList } from "./ProductProgressList";
import { useChatOptional } from "@/components/chat";

interface MemberSlideOverProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function MessageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const activityStatusConfig: Record<ActivityStatus, { color: string; bgColor: string; label: string }> = {
  active: { color: "text-green-600", bgColor: "bg-green-500", label: "Active" },
  at_risk: { color: "text-yellow-600", bgColor: "bg-yellow-500", label: "At Risk" },
  dormant: { color: "text-slate-500", bgColor: "bg-slate-400", label: "Dormant" },
  never: { color: "text-slate-400", bgColor: "bg-slate-300", label: "Never Active" },
};

function formatLastActive(lastActiveAt: string | null, daysSinceActive: number | null): string {
  if (!lastActiveAt || daysSinceActive === null) return "Never";
  if (daysSinceActive === 0) return "Today";
  if (daysSinceActive === 1) return "Yesterday";
  if (daysSinceActive < 7) return `${daysSinceActive}d ago`;
  if (daysSinceActive < 30) return `${Math.floor(daysSinceActive / 7)}w ago`;
  if (daysSinceActive < 365) return `${Math.floor(daysSinceActive / 30)}mo ago`;
  return formatDate(lastActiveAt);
}

export function MemberSlideOver({ memberId, isOpen, onClose }: MemberSlideOverProps) {
  const [member, setMember] = useState<MemberDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chat = useChatOptional();

  const handleSendMessage = async () => {
    if (!memberId || !chat) return;

    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        console.error("[MemberSlideOver] Failed to create conversation");
        return;
      }

      const data = await response.json();
      onClose(); // Close the slide-over
      chat.openConversation(data.conversation.id);
    } catch (error) {
      console.error("[MemberSlideOver] Error creating conversation:", error);
    }
  };

  useEffect(() => {
    if (!memberId || !isOpen) {
      setMember(null);
      return;
    }

    async function fetchMember() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portal/admin/members/${memberId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch member details");
        }
        const data = await response.json();
        setMember(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMember();
  }, [memberId, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-violet-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800">Member Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-100 border-t-violet-500" />
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <p className="text-rose-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && member && (
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                {member.profile.avatarUrl ? (
                  <Image
                    src={member.profile.avatarUrl}
                    alt={member.profile.fullName || "Member"}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center text-white text-xl font-semibold">
                    {(member.profile.fullName || member.profile.email)[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-800 truncate">
                      {member.profile.fullName || "No name"}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                      member.profile.membershipTier === 'paid'
                        ? 'bg-lime-100 text-lime-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.profile.membershipTier === 'paid' ? 'Paid' : 'Free'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{member.profile.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Joined {formatDate(member.profile.joinedAt)}
                  </p>
                  {/* Activity Status */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${activityStatusConfig[member.profile.activityStatus].bgColor}`} />
                    <span className={`text-xs ${activityStatusConfig[member.profile.activityStatus].color}`}>
                      {activityStatusConfig[member.profile.activityStatus].label}
                    </span>
                    <span className="text-xs text-slate-400">
                      · Last active {formatLastActive(member.profile.lastActiveAt, member.profile.daysSinceActive)}
                    </span>
                  </div>
                  {/* Send Message Button */}
                  <button
                    onClick={handleSendMessage}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <MessageIcon className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-lime-50 to-white rounded-xl p-3 border border-lime-100/60 text-center">
                  <p className="text-xs text-lime-600/80">Lifetime Value</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {formatCurrency(member.financials.lifetimeValue)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-white rounded-xl p-3 border border-violet-100/60 text-center">
                  <p className="text-xs text-violet-600/80">Products</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {member.products.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 border border-slate-200/60 text-center">
                  <p className="text-xs text-slate-500">Avg Progress</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {member.products.length > 0
                      ? `${(member.products.reduce((sum, p) => sum + p.progressPercent, 0) / member.products.length).toFixed(0)}%`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Revenue Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Funnel Purchases</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(member.financials.funnelSpend)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Portal Purchases</span>
                    <span className="font-medium text-amber-600">
                      {formatCurrency(member.financials.portalSpend)}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">Total</span>
                      <span className="font-semibold text-lime-600">
                        {formatCurrency(member.financials.lifetimeValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products with Progress */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Products & Progress
                </h4>
                {member.products.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No products purchased
                  </p>
                ) : (
                  <ProductProgressList products={member.products} />
                )}
              </div>

              {/* Purchase History */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Purchase History
                </h4>
                {member.purchaseHistory.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No purchases
                  </p>
                ) : (
                  <div className="space-y-2">
                    {member.purchaseHistory.map((purchase, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {purchase.productName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDate(purchase.purchasedAt)}
                            <span className="mx-1">·</span>
                            <span className={purchase.source === "portal" ? "text-amber-500" : "text-violet-500"}>
                              {purchase.source === "portal" ? "Portal" : "Funnel"}
                            </span>
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatCurrency(purchase.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Community Stats */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Community Activity
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-slate-700">
                      {member.communityStats.postsCount}
                    </p>
                    <p className="text-xs text-slate-500">Posts</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-slate-700">
                      {member.communityStats.commentsCount}
                    </p>
                    <p className="text-xs text-slate-500">Comments</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-slate-700">
                      {member.communityStats.reactionsGiven}
                    </p>
                    <p className="text-xs text-slate-500">Reactions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
