"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { PostWithAuthor } from "@/lib/supabase/types";

export interface HotTopic {
  tag: string;
  count: number;
}

interface SidebarResponse {
  pinned: PostWithAuthor[];
  trending: PostWithAuthor[];
  hotTopics: HotTopic[];
}

/**
 * Hook to fetch sidebar data: pinned posts, trending posts, and hot topics
 */
export function useSidebarData() {
  const { user } = useAuth();
  const [pinned, setPinned] = useState<PostWithAuthor[]>([]);
  const [trending, setTrending] = useState<PostWithAuthor[]>([]);
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSidebarData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/discussion/sidebar");

      if (!response.ok) {
        throw new Error("Failed to fetch sidebar data");
      }

      const data: SidebarResponse = await response.json();
      setPinned(data.pinned || []);
      setTrending(data.trending || []);
      setHotTopics(data.hotTopics || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch sidebar data"));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  return {
    pinned,
    trending,
    hotTopics,
    isLoading,
    error,
    refresh: fetchSidebarData,
  };
}
