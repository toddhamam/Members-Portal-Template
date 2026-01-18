'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseContentUrlOptions {
  productSlug: string;
  moduleSlug: string;
  lessonSlug: string;
}

interface ContentUrlData {
  url: string | null;
  embedUrl?: string | null;
  type: 'bunny' | 'supabase' | 'external' | 'text' | null;
  contentType: 'video' | 'audio' | 'pdf' | 'download' | 'text' | null;
}

interface UseContentUrlResult extends ContentUrlData {
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useContentUrl({
  productSlug,
  moduleSlug,
  lessonSlug,
}: UseContentUrlOptions): UseContentUrlResult {
  const [data, setData] = useState<ContentUrlData>({
    url: null,
    embedUrl: null,
    type: null,
    contentType: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        product: productSlug,
        module: moduleSlug,
        lesson: lessonSlug,
      });

      const response = await fetch(`/api/content/signed-url?${params}`);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to get content URL');
      }

      setData({
        url: responseData.url || null,
        embedUrl: responseData.embedUrl || null,
        type: responseData.type || null,
        contentType: responseData.contentType || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
      setData({ url: null, embedUrl: null, type: null, contentType: null });
    } finally {
      setIsLoading(false);
    }
  }, [productSlug, moduleSlug, lessonSlug]);

  useEffect(() => {
    fetchUrl();
  }, [fetchUrl]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchUrl,
  };
}
