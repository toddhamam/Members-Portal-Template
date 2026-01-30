"use client";

import Image from "next/image";
import type { MemberSummary, ActivityStatus } from "@/lib/admin/types";
import { useChatOptional } from "@/components/chat";

interface MembersTableProps {
  members: MemberSummary[];
  isLoading: boolean;
  onMemberClick: (memberId: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
}

function MessageIcon({ className = "w-4 h-4" }: { className?: string }) {
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
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatLastActive(dateString: string | null): string {
  if (!dateString) return "Never";
  return formatDate(dateString);
}

const activityStatusConfig: Record<ActivityStatus, { color: string; label: string }> = {
  active: { color: "bg-green-500", label: "Active" },
  at_risk: { color: "bg-yellow-500", label: "At Risk" },
  dormant: { color: "bg-slate-400", label: "Dormant" },
  never: { color: "bg-slate-300 border border-slate-400", label: "Never" },
};

function ActivityStatusDot({ status }: { status: ActivityStatus }) {
  const config = activityStatusConfig[status];
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${config.color}`}
      title={config.label}
    />
  );
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: "asc" | "desc" }) {
  if (sortBy !== field) {
    return (
      <svg className="w-4 h-4 text-slate-300 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }

  return sortOrder === "asc" ? (
    <svg className="w-4 h-4 text-violet-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-violet-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function MembersTable({
  members,
  isLoading,
  onMemberClick,
  sortBy,
  sortOrder,
  onSort,
}: MembersTableProps) {
  const chat = useChatOptional();

  const handleMessageClick = async (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation(); // Prevent row click from triggering
    if (!chat) return;

    try {
      // Create or get existing conversation
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        console.error("[MembersTable] Failed to create conversation");
        return;
      }

      const data = await response.json();
      chat.openConversation(data.conversation.id);
    } catch (error) {
      console.error("[MembersTable] Error creating conversation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-100 border-t-violet-500" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">No members found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50/80 to-violet-50/30">
            <th
              className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
              onClick={() => onSort("name")}
            >
              <span className="flex items-center">
                Member
                <SortIcon field="name" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </th>
            <th
              className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors hidden sm:table-cell"
              onClick={() => onSort("email")}
            >
              <span className="flex items-center">
                Email
                <SortIcon field="email" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </th>
            <th
              className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
              onClick={() => onSort("tier")}
            >
              <span className="flex items-center justify-center">
                Tier
                <SortIcon field="tier" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </th>
            <th
              className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
              onClick={() => onSort("products_count")}
            >
              <span className="flex items-center justify-end">
                Products
                <SortIcon field="products_count" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </th>
            <th
              className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors hidden md:table-cell"
              onClick={() => onSort("progress")}
            >
              <span className="flex items-center justify-end">
                Progress
                <SortIcon field="progress" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </th>
            <th
              className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
              onClick={() => onSort("ltv")}
            >
              <span className="flex items-center justify-end">
                LTV
                <SortIcon field="ltv" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </th>
            <th
              className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors hidden lg:table-cell"
              onClick={() => onSort("created_at")}
            >
              <span className="flex items-center justify-end">
                Joined
                <SortIcon field="created_at" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </th>
            <th
              className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors hidden md:table-cell"
              onClick={() => onSort("last_active_at")}
            >
              <span className="flex items-center justify-end">
                Last Active
                <SortIcon field="last_active_at" sortBy={sortBy} sortOrder={sortOrder} />
              </span>
            </th>
            <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60">
          {members.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-violet-50/30 transition-colors cursor-pointer"
              onClick={() => onMemberClick(member.id)}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt={member.fullName || "Member"}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
                      {(member.fullName || member.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {member.fullName || "No name"}
                    </p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {member.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-slate-600 hidden sm:table-cell">
                {member.email}
              </td>
              <td className="px-5 py-4 text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  member.membershipTier === 'paid'
                    ? 'bg-lime-100 text-lime-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {member.membershipTier === 'paid' ? 'Paid' : 'Free'}
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-slate-600 text-right tabular-nums">
                {member.productsOwned}
              </td>
              <td className="px-5 py-4 hidden md:table-cell">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full"
                      style={{ width: `${Math.min(100, member.overallProgress)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 tabular-nums w-9 text-right">
                    {member.overallProgress.toFixed(0)}%
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 text-sm font-medium text-right tabular-nums">
                <span className={member.ltv > 0 ? "text-lime-600" : "text-slate-400"}>
                  {member.ltv > 0 ? formatCurrency(member.ltv) : "$0"}
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-slate-500 text-right hidden lg:table-cell">
                {formatDate(member.joinedAt)}
              </td>
              <td className="px-5 py-4 text-right hidden md:table-cell">
                <div className="flex items-center justify-end gap-2">
                  <ActivityStatusDot status={member.activityStatus} />
                  <span className="text-sm text-slate-500">
                    {formatLastActive(member.lastActiveAt)}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 text-center">
                <button
                  onClick={(e) => handleMessageClick(e, member.id)}
                  className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-colors"
                  title="Send message"
                >
                  <MessageIcon className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
