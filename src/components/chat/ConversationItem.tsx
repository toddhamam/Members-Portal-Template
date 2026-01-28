"use client";

import { memo } from "react";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import type { ConversationWithParticipant } from "@/lib/supabase/types";

interface ConversationItemProps {
  conversation: ConversationWithParticipant;
  onClick: () => void;
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  // For older messages, show month and year
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const currentYear = now.getFullYear();

  if (year === currentYear) {
    return month;
  }
  return `${month} '${String(year).slice(2)}`;
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  onClick,
}: ConversationItemProps) {
  const { otherParticipant, last_message_preview, last_message_at, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-start gap-3 p-3 rounded-lg
        text-left transition-colors
        ${hasUnread ? "bg-[#d4a574]/10" : "hover:bg-gray-100"}
      `}
    >
      {/* Avatar */}
      <UserAvatar
        avatarUrl={otherParticipant.avatarUrl}
        name={otherParticipant.name}
        userId={otherParticipant.id}
        size="md"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          {/* Name */}
          <span
            className={`
              text-sm truncate
              ${hasUnread ? "font-semibold text-[#222222]" : "font-medium text-gray-700"}
            `}
          >
            {formatDisplayName(otherParticipant.name)}
          </span>

          {/* Timestamp */}
          {last_message_at && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatRelativeTime(last_message_at)}
            </span>
          )}
        </div>

        {/* Preview */}
        {last_message_preview && (
          <p
            className={`
              text-sm truncate mt-0.5
              ${hasUnread ? "text-gray-700" : "text-gray-500"}
            `}
          >
            {last_message_preview}
          </p>
        )}
      </div>

      {/* Unread indicator */}
      {hasUnread && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#d4a574] mt-2" />
      )}
    </button>
  );
});
