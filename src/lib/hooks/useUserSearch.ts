"use client";

import { useEffect, useState, useRef } from "react";

interface SearchUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function useUserSearch(query: string) {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search for very short queries
    if (!query || query.length < 2) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Debounce 300ms
    const timeoutId = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(
          `/api/discussion/users/search?q=${encodeURIComponent(query)}`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("User search error:", err);
          setUsers([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return { users, isLoading };
}
