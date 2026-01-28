"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "./ChatProvider";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/components/auth/AuthProvider";

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function SoundOnIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );
}

function SoundOffIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );
}

interface ConversationListProps {
  onNewMessage?: () => void;
  isHeaderDropdown?: boolean;
}

export function ConversationList({ onNewMessage, isHeaderDropdown = false }: ConversationListProps) {
  const { isListOpen, closeList, openConversation, soundEnabled, toggleSound } = useChat();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.is_admin || false;

  const { conversations, loading, error, hasMore, loadMore } = useConversations({
    search: debouncedSearch,
    pollInterval: isListOpen ? 30000 : 0, // Poll every 30 seconds when open
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Click outside to close (only needed when not in header dropdown mode)
  useEffect(() => {
    if (!isListOpen || isHeaderDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        // Check if clicking on the chat button (don't close if so)
        const chatButton = (e.target as Element).closest('[aria-label*="Messages"], [aria-label*="messages"]');
        if (!chatButton) {
          closeList();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isListOpen, closeList, isHeaderDropdown]);

  // When rendered as header dropdown, always show (visibility controlled by parent)
  if (!isHeaderDropdown && !isListOpen) {
    return null;
  }

  // Different positioning based on mode
  const positionClasses = isHeaderDropdown
    ? "absolute right-0 mt-2" // Dropdown from header button
    : "fixed bottom-24 right-6"; // Fixed position (legacy)

  return (
    <div
      ref={listRef}
      className={`
        ${positionClasses} z-50
        w-[min(320px,calc(100vw-1rem))] max-h-[500px]
        bg-white rounded-lg shadow-lg
        border border-gray-200
        flex flex-col
        overflow-hidden
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Chats</h3>
        <div className="flex items-center gap-0.5">
          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled
                ? "text-[#d4a574] hover:bg-gray-100"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
            title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
          >
            {soundEnabled ? <SoundOnIcon className="w-4 h-4" /> : <SoundOffIcon className="w-4 h-4" />}
          </button>
          {/* New message button (admin only) */}
          {isAdmin && onNewMessage && (
            <button
              onClick={onNewMessage}
              className="p-2 text-gray-500 hover:text-[#d4a574] hover:bg-gray-100 rounded-lg transition-colors"
              title="New message"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={closeList}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
            className="
              w-full pl-9 pr-3 py-2
              text-sm
              border border-gray-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#d4a574]/50 focus:border-[#d4a574]
              placeholder:text-gray-400
            "
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500">
            Failed to load conversations
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No conversations yet</p>
            {isAdmin && (
              <p className="text-xs mt-1 text-gray-400">
                Click + to start a new conversation
              </p>
            )}
          </div>
        ) : (
          <div className="p-1">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onClick={() => openConversation(conversation.id)}
              />
            ))}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full py-2 text-sm text-[#d4a574] hover:text-[#c49464] transition-colors"
              >
                Load more...
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
