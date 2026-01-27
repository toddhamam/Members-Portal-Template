"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { NotificationWithActor } from "@/lib/supabase/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface NotificationsResponse {
  notifications: NotificationWithActor[];
  unreadCount: number;
  pagination: Pagination;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(
          `/api/discussion/notifications?page=${page}&limit=20`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data: NotificationsResponse = await response.json();

        if (append) {
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }
        setUnreadCount(data.unreadCount);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch notifications"));
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !isLoading) {
      fetchNotifications(pagination.page + 1, true);
    }
  }, [fetchNotifications, pagination.hasMore, pagination.page, isLoading]);

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/discussion/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const response = await fetch("/api/discussion/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications(1, false);
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore: pagination.hasMore,
    loadMore,
    markAsRead,
    markAllRead,
    refresh: () => fetchNotifications(1, false),
  };
}
