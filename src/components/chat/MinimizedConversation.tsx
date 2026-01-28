"use client";

import { memo } from "react";
import { useChat } from "./ChatProvider";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import type { ConversationWithParticipant } from "@/lib/supabase/types";

function CloseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface MinimizedConversationProps {
  conversationId: string;
  conversation?: ConversationWithParticipant;
  position: number;
}

export const MinimizedConversation = memo(function MinimizedConversation({
  conversationId,
  conversation,
  position,
}: MinimizedConversationProps) {
  const { maximizeConversation, closeConversation } = useChat();

  const participant = conversation?.otherParticipant || {
    id: "",
    name: "Loading...",
    avatarUrl: null,
    isAdmin: false,
  };

  // Position from right (each minimized bar is 180px wide + 8px gap)
  const rightOffset = 6 + position * (180 + 8);

  return (
    <div
      className="
        fixed bottom-6 z-40
        flex items-center gap-2
        px-3 py-2
        bg-[#222222] text-white
        rounded-lg shadow-lg
        cursor-pointer
        hover:bg-black
        transition-colors
      "
      style={{ right: `${rightOffset / 4}rem`, width: "180px" }}
      onClick={() => maximizeConversation(conversationId)}
    >
      <UserAvatar
        avatarUrl={participant.avatarUrl}
        name={participant.name}
        userId={participant.id}
        size="xs"
      />
      <span className="text-sm font-medium truncate flex-1">
        {formatDisplayName(participant.name)}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeConversation(conversationId);
        }}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
});
