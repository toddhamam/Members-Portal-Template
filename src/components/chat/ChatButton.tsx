"use client";

import { useChat } from "./ChatProvider";
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

export function ChatButton() {
  const { user } = useAuth();
  const { toggleList, isListOpen, totalUnreadCount } = useChat();

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <button
      onClick={toggleList}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-[#222222] hover:bg-black
        text-white
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-all duration-200
        ${isListOpen ? "ring-2 ring-[#d4a574]" : ""}
      `}
      aria-label={isListOpen ? "Close messages" : "Open messages"}
    >
      <ChatBubbleIcon className="w-6 h-6" />

      {/* Unread badge */}
      {totalUnreadCount > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            min-w-[20px] h-5
            bg-red-500 text-white
            text-xs font-bold
            rounded-full
            flex items-center justify-center
            px-1
          "
        >
          {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
        </span>
      )}
    </button>
  );
}
