import { useState, useEffect, useCallback, useRef } from 'react';
import type { MessageWithSender } from '@/lib/supabase/types';

interface MessagesResponse {
  conversation: {
    id: string;
    participants: Array<{
      id: string;
      name: string | null;
      avatarUrl: string | null;
      isAdmin: boolean;
    }>;
  };
  messages: MessageWithSender[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

interface UseMessagesOptions {
  pollInterval?: number; // in milliseconds, 0 to disable
}

export function useMessages(conversationId: string | null, options: UseMessagesOptions = {}) {
  const { pollInterval = 0 } = options;

  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [participants, setParticipants] = useState<MessagesResponse['conversation']['participants']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Track the latest message ID to detect new messages during polling
  const latestMessageIdRef = useRef<string | null>(null);
  // Track the current conversation to prevent stale updates
  const currentConversationRef = useRef<string | null>(conversationId);
  // Track if a fetch is in progress to prevent race conditions
  const fetchInProgressRef = useRef(false);

  const fetchMessages = useCallback(async (cursor?: string | null, append: boolean = false) => {
    if (!conversationId) return;

    // Prevent concurrent fetches
    if (fetchInProgressRef.current && !append) return;

    const fetchingConversationId = conversationId;

    try {
      if (!append) {
        setLoading(true);
        fetchInProgressRef.current = true;
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({ limit: '50' });
      if (cursor) {
        params.set('before', cursor);
      }

      const response = await fetch(`/api/messages/conversations/${fetchingConversationId}?${params}`);

      // Check if conversation changed during fetch - discard stale results
      if (currentConversationRef.current !== fetchingConversationId) {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data: MessagesResponse = await response.json();

      // Double-check conversation didn't change
      if (currentConversationRef.current !== fetchingConversationId) {
        return;
      }

      if (append) {
        // Prepend older messages (loading history)
        setMessages((prev) => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
        setParticipants(data.conversation.participants);

        // Update latest message ID
        if (data.messages.length > 0) {
          latestMessageIdRef.current = data.messages[data.messages.length - 1].id;
        }
      }

      setHasMore(data.pagination.hasMore);
      setNextCursor(data.pagination.nextCursor);
      setError(null);
    } catch (err) {
      // Only set error if still on same conversation
      if (currentConversationRef.current === fetchingConversationId) {
        console.error('[useMessages] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      }
    } finally {
      if (currentConversationRef.current === fetchingConversationId) {
        setLoading(false);
        setLoadingMore(false);
      }
      fetchInProgressRef.current = false;
    }
  }, [conversationId]);

  // Initial fetch when conversation changes
  useEffect(() => {
    // Update the ref immediately when conversation changes
    currentConversationRef.current = conversationId;

    if (conversationId) {
      setMessages([]);
      setParticipants([]);
      setError(null);
      latestMessageIdRef.current = null;
      fetchInProgressRef.current = false;
      fetchMessages(null, false);
    }
  }, [conversationId, fetchMessages]);

  // Polling for new messages
  useEffect(() => {
    if (!conversationId || pollInterval <= 0) return;

    const pollingConversationId = conversationId;

    const interval = setInterval(async () => {
      // Skip if conversation changed or fetch in progress
      if (currentConversationRef.current !== pollingConversationId || fetchInProgressRef.current) {
        return;
      }

      // Fetch latest messages and check for new ones
      try {
        const response = await fetch(`/api/messages/conversations/${pollingConversationId}?limit=20`);

        // Check if conversation changed during fetch
        if (currentConversationRef.current !== pollingConversationId) {
          return;
        }

        if (!response.ok) return;

        const data: MessagesResponse = await response.json();

        // Double-check conversation didn't change
        if (currentConversationRef.current !== pollingConversationId) {
          return;
        }

        if (data.messages.length > 0) {
          const newLatestId = data.messages[data.messages.length - 1].id;

          // If we have new messages, update the list
          if (newLatestId !== latestMessageIdRef.current) {
            setMessages((prev) => {
              // Find messages that are new (not in our current list)
              const existingIds = new Set(prev.map((m) => m.id));
              const newMessages = data.messages.filter((m) => !existingIds.has(m.id));

              if (newMessages.length > 0) {
                latestMessageIdRef.current = newLatestId;
                return [...prev, ...newMessages];
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error('[useMessages] Polling error:', err);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [conversationId, pollInterval]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchMessages(nextCursor, true);
    }
  }, [loadingMore, hasMore, nextCursor, fetchMessages]);

  const refresh = useCallback(() => {
    fetchMessages(null, false);
  }, [fetchMessages]);

  // Add a message optimistically
  const addMessage = useCallback((message: MessageWithSender) => {
    setMessages((prev) => [...prev, message]);
    latestMessageIdRef.current = message.id;
  }, []);

  // Update a message (for edit status)
  const updateMessage = useCallback((messageId: string, updates: Partial<MessageWithSender>) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      )
    );
  }, []);

  return {
    messages,
    participants,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    addMessage,
    updateMessage,
  };
}
