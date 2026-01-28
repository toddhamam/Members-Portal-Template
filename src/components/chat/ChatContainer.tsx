"use client";

import { useEffect, useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { MinimizedConversation } from "./MinimizedConversation";
import { useChat } from "./ChatProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import type { ConversationWithParticipant } from "@/lib/supabase/types";

export function ChatContainer() {
  const { user } = useAuth();
  const { openConversations, minimizedConversations } = useChat();
  const [conversationsCache, setConversationsCache] = useState<Map<string, ConversationWithParticipant>>(new Map());

  // Fetch conversation data for open windows
  useEffect(() => {
    const fetchConversationData = async (conversationId: string) => {
      if (conversationsCache.has(conversationId)) return;

      try {
        const response = await fetch(`/api/messages/conversations/${conversationId}`);
        if (!response.ok) return;

        const data = await response.json();
        const participants = data.conversation.participants;
        const otherParticipant = participants.find((p: { id: string }) => p.id !== user?.id);

        if (otherParticipant) {
          setConversationsCache((prev) => {
            const newCache = new Map(prev);
            newCache.set(conversationId, {
              id: conversationId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_message_at: null,
              last_message_preview: null,
              otherParticipant: {
                id: otherParticipant.id,
                name: otherParticipant.name,
                avatarUrl: otherParticipant.avatarUrl,
                isAdmin: otherParticipant.isAdmin,
              },
              unreadCount: 0,
            });
            return newCache;
          });
        }
      } catch (error) {
        console.error("[ChatContainer] Error fetching conversation:", error);
      }
    };

    // Fetch data for all open and minimized conversations
    [...openConversations, ...minimizedConversations].forEach((id) => {
      fetchConversationData(id);
    });
  }, [openConversations, minimizedConversations, user?.id, conversationsCache]);

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Open chat windows */}
      {openConversations.map((conversationId, index) => (
        <ChatWindow
          key={conversationId}
          conversationId={conversationId}
          conversation={conversationsCache.get(conversationId)}
          position={index}
        />
      ))}

      {/* Minimized conversations */}
      {minimizedConversations.map((conversationId, index) => (
        <MinimizedConversation
          key={conversationId}
          conversationId={conversationId}
          conversation={conversationsCache.get(conversationId)}
          position={openConversations.length + index}
        />
      ))}
    </>
  );
}
