import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConversationWithParticipant } from '@/lib/supabase/types';

interface ConversationsResponse {
  conversations: ConversationWithParticipant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface UseConversationsOptions {
  search?: string;
  pollInterval?: number; // in milliseconds, 0 to disable
}

export function useConversations(options: UseConversationsOptions = {}) {
  const { search = '', pollInterval = 0 } = options;

  const [conversations, setConversations] = useState<ConversationWithParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Track current search to prevent stale results
  const currentSearchRef = useRef(search);
  // Track if fetch is in progress
  const fetchInProgressRef = useRef(false);

  const fetchConversations = useCallback(async (pageNum: number = 1, append: boolean = false, searchTerm?: string) => {
    // Use provided searchTerm or current ref value
    const currentSearch = searchTerm ?? currentSearchRef.current;

    // Prevent concurrent initial fetches
    if (fetchInProgressRef.current && !append) return;

    try {
      if (!append) {
        setLoading(true);
        fetchInProgressRef.current = true;
      }

      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '20',
      });

      if (currentSearch) {
        params.set('search', currentSearch);
      }

      const response = await fetch(`/api/messages/conversations?${params}`);

      // Check if search changed during fetch - discard stale results
      if (currentSearchRef.current !== currentSearch) {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data: ConversationsResponse = await response.json();

      // Double-check search didn't change
      if (currentSearchRef.current !== currentSearch) {
        return;
      }

      if (append) {
        setConversations((prev) => [...prev, ...data.conversations]);
      } else {
        setConversations(data.conversations);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      if (currentSearchRef.current === currentSearch) {
        console.error('[useConversations] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      }
    } finally {
      if (currentSearchRef.current === currentSearch) {
        setLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, []);

  // Initial fetch and search changes
  useEffect(() => {
    currentSearchRef.current = search;
    fetchInProgressRef.current = false;
    fetchConversations(1, false, search);
  }, [search, fetchConversations]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(() => {
      // Only poll if no fetch in progress
      if (!fetchInProgressRef.current) {
        fetchConversations(1, false, currentSearchRef.current);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, fetchConversations]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchConversations(page + 1, true);
    }
  }, [loading, hasMore, page, fetchConversations]);

  const refresh = useCallback(() => {
    fetchConversations(1, false);
  }, [fetchConversations]);

  // Update a single conversation in the list (for optimistic updates)
  const updateConversation = useCallback((conversationId: string, updates: Partial<ConversationWithParticipant>) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, ...updates } : c
      )
    );
  }, []);

  // Add a new conversation to the top of the list
  const addConversation = useCallback((conversation: ConversationWithParticipant) => {
    setConversations((prev) => {
      // Check if conversation already exists
      const exists = prev.some((c) => c.id === conversation.id);
      if (exists) {
        // Move to top and update
        return [
          conversation,
          ...prev.filter((c) => c.id !== conversation.id),
        ];
      }
      return [conversation, ...prev];
    });
  }, []);

  return {
    conversations,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateConversation,
    addConversation,
  };
}
