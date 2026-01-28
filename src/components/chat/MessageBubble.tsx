"use client";

import { memo } from "react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { MessageWithSender } from "@/lib/supabase/types";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showSender?: boolean;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showSender = false,
}: MessageBubbleProps) {
  const { sender, content, created_at, is_edited } = message;

  return (
    <div
      className={`
        flex gap-2 max-w-[85%]
        ${isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"}
      `}
    >
      {/* Avatar (only for received messages) */}
      {!isOwnMessage && showAvatar && (
        <UserAvatar
          avatarUrl={sender.avatarUrl}
          name={sender.name}
          userId={sender.id}
          size="sm"
          className="flex-shrink-0 mt-1"
        />
      )}

      {/* Message content */}
      <div
        className={`
          flex flex-col
          ${isOwnMessage ? "items-end" : "items-start"}
        `}
      >
        {/* Sender name (optional) */}
        {showSender && !isOwnMessage && (
          <span className="text-xs text-gray-500 mb-1 ml-1">
            {sender.name || "Member"}
            {sender.isAdmin && (
              <span className="ml-1 text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`
            px-3 py-2 rounded-2xl
            ${
              isOwnMessage
                ? "bg-[#d4a574] text-white rounded-br-md"
                : "bg-gray-100 text-gray-900 rounded-bl-md"
            }
          `}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </div>

        {/* Timestamp */}
        <div
          className={`
            flex items-center gap-1 mt-1 px-1
            text-[10px] text-gray-400
          `}
        >
          <span>{formatMessageTime(created_at)}</span>
          {is_edited && <span>(edited)</span>}
        </div>
      </div>
    </div>
  );
});
