"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "./ChatProvider";
import { ConversationList } from "./ConversationList";
import { NewMessageModal } from "./NewMessageModal";
import { useAuth } from "@/components/auth/AuthProvider";

function ChatBubbleIcon({ className = "w-6 h-6" }: { className?: string }) {
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

export function ChatHeaderButton() {
  const { user } = useAuth();
  const { toggleList, isListOpen, totalUnreadCount } = useChat();
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Chat Button - matches NotificationBell style */}
      <button
        onClick={toggleList}
        className="relative p-2 text-[#6b7280] hover:text-[#222222] hover:bg-gray-50 rounded-lg transition-colors"
        aria-label={`Messages${totalUnreadCount > 0 ? ` (${totalUnreadCount} unread)` : ""}`}
      >
        <ChatBubbleIcon />

        {/* Unread Badge - matches NotificationBell style */}
        {totalUnreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#ee5d0b] text-white text-xs font-medium rounded-full">
            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - positioned from header */}
      {isListOpen && (
        <ConversationList
          onNewMessage={() => setIsNewMessageOpen(true)}
          isHeaderDropdown={true}
        />
      )}

      {/* New message modal */}
      <NewMessageModal
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
      />
    </div>
  );
}
