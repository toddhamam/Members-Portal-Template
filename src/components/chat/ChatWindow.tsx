"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useChat } from "./ChatProvider";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { MemberContextSidebar, MemberContextToggle } from "./MemberContextSidebar";
import { useMessages } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import type { ConversationWithParticipant, MessageWithSender } from "@/lib/supabase/types";

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MinimizeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

interface ChatWindowProps {
  conversationId: string;
  conversation?: ConversationWithParticipant;
  position: number; // Position from right (0, 1, 2)
}

export function ChatWindow({ conversationId, conversation, position }: ChatWindowProps) {
  const { closeConversation, minimizeConversation, refreshUnreadCount, triggerConversationListRefresh } = useChat();
  const { user, profile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const [showMemberContext, setShowMemberContext] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isAdmin = profile?.is_admin ?? false;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    messages,
    participants,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    addMessage,
  } = useMessages(conversationId, {
    pollInterval: 3000, // Poll every 3 seconds when window is open
  });

  // Memoize the onSuccess callback to prevent useSendMessage from recreating
  const handleMessageSent = useCallback((message: MessageWithSender) => {
    addMessage(message);
  }, [addMessage]);

  const { sendMessage, sending } = useSendMessage({
    onSuccess: handleMessageSent,
  });

  // Find the other participant
  const otherParticipant = conversation?.otherParticipant ||
    participants.find((p) => p.id !== user?.id) ||
    { id: "", name: "Loading...", avatarUrl: null, isAdmin: false };

  // Scroll to bottom when new messages arrive (if not scrolled up)
  useEffect(() => {
    if (!hasScrolledUp && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, hasScrolledUp]);

  // Mark as read when opening the window
  useEffect(() => {
    const markAsRead = async () => {
      try {
        const response = await fetch(`/api/messages/conversations/${conversationId}/mark-read`, {
          method: "POST",
        });
        if (response.ok) {
          // Refresh unread count from server to ensure accuracy
          refreshUnreadCount();
          // Also trigger conversation list refresh to update UI
          triggerConversationListRefresh();
        }
      } catch (error) {
        console.error("[ChatWindow] Failed to mark as read:", error);
      }
    };

    // Always mark as read when window opens
    markAsRead();
  }, [conversationId, refreshUnreadCount, triggerConversationListRefresh]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setHasScrolledUp(!isAtBottom);

    // Load more when scrolling to top
    if (scrollTop < 50 && hasMore && !loadingMore) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadMore]);

  const handleSend = useCallback((content: string, attachment?: { url: string; type: string; name: string; size: number }) => {
    sendMessage(conversationId, content, attachment as Parameters<typeof sendMessage>[2]);
  }, [conversationId, sendMessage]);

  // Group messages by date
  const groupedMessages: { date: string; messages: MessageWithSender[] }[] = [];
  let currentDate = "";

  for (const message of messages) {
    const messageDate = new Date(message.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: messageDate, messages: [] });
    }

    groupedMessages[groupedMessages.length - 1].messages.push(message);
  }

  // Determine if we're chatting with a member (non-admin) and can show context
  // Hide context sidebar on mobile
  const canShowMemberContext = isAdmin && !otherParticipant.isAdmin && otherParticipant.id && !isMobile;

  // Calculate window width based on sidebar state (desktop only)
  const baseWidth = 340;
  const sidebarWidth = showMemberContext ? 200 : 0;
  const totalWidth = baseWidth + sidebarWidth;

  // Calculate position offset (each window + gap) - desktop only
  const rightOffset = 6 + position * (totalWidth + 16);

  // Mobile: full screen chat
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 safe-area-top">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => closeConversation(conversationId)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <UserAvatar
              avatarUrl={otherParticipant.avatarUrl}
              name={otherParticipant.name}
              userId={otherParticipant.id}
              size="sm"
            />
            <div className="min-w-0">
              <span className="text-base font-medium text-gray-900 truncate block">
                {formatDisplayName(otherParticipant.name)}
              </span>
              {otherParticipant.isAdmin && (
                <span className="text-xs text-violet-600">Admin</span>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {loadingMore && (
            <div className="text-center py-2">
              <span className="text-xs text-gray-400">Loading...</span>
            </div>
          )}

          {hasMore && !loadingMore && (
            <button
              onClick={loadMore}
              className="w-full text-center py-2 text-sm text-[#d4a574] hover:text-[#c49464]"
            >
              Load earlier messages
            </button>
          )}

          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm text-gray-400">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm text-gray-400">No messages yet</span>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{group.date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-2">
                  {group.messages.map((message, idx) => {
                    const isOwnMessage = message.sender_id === user?.id;
                    const prevMessage = group.messages[idx - 1];
                    const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                        showAvatar={showAvatar}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="safe-area-bottom">
          <ChatInput
            onSend={handleSend}
            conversationId={conversationId}
            disabled={sending || loading}
            placeholder={`Message ${formatDisplayName(otherParticipant.name)}`}
          />
        </div>
      </div>
    );
  }

  // Desktop: floating window
  return (
    <div
      className="
        fixed bottom-24 z-40
        h-[450px] max-h-[calc(100vh-8rem)]
        bg-white rounded-xl shadow-2xl
        border border-gray-200
        flex
        overflow-hidden
        transition-all duration-200
      "
      style={{
        width: `${totalWidth}px`,
        right: `${rightOffset / 4}rem`,
      }}
    >
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <UserAvatar
              avatarUrl={otherParticipant.avatarUrl}
              name={otherParticipant.name}
              userId={otherParticipant.id}
              size="sm"
            />
            <div className="min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate block">
                {formatDisplayName(otherParticipant.name)}
              </span>
              {otherParticipant.isAdmin && (
                <span className="text-[10px] text-violet-600">Admin</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Member context toggle for admins */}
            {canShowMemberContext && !showMemberContext && (
              <MemberContextToggle onClick={() => setShowMemberContext(true)} />
            )}
            <button
              onClick={() => minimizeConversation(conversationId)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Minimize"
            >
              <MinimizeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => closeConversation(conversationId)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Close"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 space-y-4"
        >
          {/* Loading more indicator */}
          {loadingMore && (
            <div className="text-center py-2">
              <span className="text-xs text-gray-400">Loading...</span>
            </div>
          )}

          {/* Load more button */}
          {hasMore && !loadingMore && (
            <button
              onClick={loadMore}
              className="w-full text-center py-2 text-xs text-[#d4a574] hover:text-[#c49464]"
            >
              Load earlier messages
            </button>
          )}

          {/* Initial loading */}
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm text-gray-400">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm text-gray-400">No messages yet</span>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{group.date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Messages for this date */}
                <div className="space-y-2">
                  {group.messages.map((message, idx) => {
                    const isOwnMessage = message.sender_id === user?.id;
                    const prevMessage = group.messages[idx - 1];
                    const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                        showAvatar={showAvatar}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          conversationId={conversationId}
          disabled={sending || loading}
          placeholder={`Message ${formatDisplayName(otherParticipant.name)}`}
        />
      </div>

      {/* Member Context Sidebar (admin only) */}
      {canShowMemberContext && showMemberContext && (
        <MemberContextSidebar
          memberId={otherParticipant.id}
          isOpen={showMemberContext}
          onClose={() => setShowMemberContext(false)}
        />
      )}
    </div>
  );
}
