import { useState, useEffect, useCallback } from 'react';

interface UseUnreadCountOptions {
  pollInterval?: number; // in milliseconds, 0 to disable
  enabled?: boolean;
}

export function useUnreadCount(options: UseUnreadCountOptions = {}) {
  const { pollInterval = 60000, enabled = true } = options; // Default: poll every 60 seconds

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch('/api/messages/unread-count');

      if (!response.ok) {
        // Don't throw for auth errors - user might not be logged in
        if (response.status === 401) {
          setUnreadCount(0);
          return;
        }
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error('[useUnreadCount] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch unread count');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchUnreadCount();
    }
  }, [enabled, fetchUnreadCount]);

  // Polling
  useEffect(() => {
    if (!enabled || pollInterval <= 0) return;

    const interval = setInterval(fetchUnreadCount, pollInterval);
    return () => clearInterval(interval);
  }, [enabled, pollInterval, fetchUnreadCount]);

  // Window focus handler - refresh when user returns to tab
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, fetchUnreadCount]);

  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Manually decrement count (for optimistic updates when marking as read)
  const decrementBy = useCallback((amount: number) => {
    setUnreadCount((prev) => Math.max(0, prev - amount));
  }, []);

  // Manually increment count (for optimistic updates when receiving a message)
  const incrementBy = useCallback((amount: number) => {
    setUnreadCount((prev) => prev + amount);
  }, []);

  return {
    unreadCount,
    loading,
    error,
    refresh,
    decrementBy,
    incrementBy,
  };
}
