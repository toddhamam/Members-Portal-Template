'use client';

import { useState, useEffect, memo } from 'react';

interface VideoPlayerProps {
  productSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  thumbnailUrl?: string;
  onProgress?: (progress: number, currentTime: number) => void;
  onComplete?: () => void;
  initialPosition?: number;
}

interface ContentData {
  url: string | null;
  embedUrl?: string;
  type: 'bunny' | 'supabase' | 'external' | null;
  contentType: string;
  cachedAt?: number;
}

// Cache TTL: 50 minutes (signed URLs expire in 60 minutes)
const CACHE_TTL_MS = 50 * 60 * 1000;

export const VideoPlayer = memo(function VideoPlayer({
  productSlug,
  moduleSlug,
  lessonSlug,
  thumbnailUrl,
  onProgress,
  onComplete,
  initialPosition = 0,
}: VideoPlayerProps) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset content when lesson changes
    setContent(null);
    setIsLoading(true);
    setError(null);

    // Check sessionStorage cache first
    const cacheKey = `video-url:${productSlug}:${moduleSlug}:${lessonSlug}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const data = JSON.parse(cached) as ContentData;
        // Check if cached URL is still valid
        if (data.cachedAt && Date.now() - data.cachedAt < CACHE_TTL_MS) {
          setContent(data);
          setIsLoading(false);
          return;
        }
      } catch {
        // Invalid cache, continue to fetch
      }
    }

    // Fetch fresh signed URL
    async function fetchContent() {
      try {
        const params = new URLSearchParams({
          product: productSlug,
          module: moduleSlug,
          lesson: lessonSlug,
        });

        const response = await fetch(`/api/content/signed-url?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load video');
        }

        // Cache the response
        const dataWithTimestamp = { ...data, cachedAt: Date.now() };
        sessionStorage.setItem(cacheKey, JSON.stringify(dataWithTimestamp));

        setContent(dataWithTimestamp);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [productSlug, moduleSlug, lessonSlug]);

  const retryFetch = () => {
    // Clear cache and refetch
    const cacheKey = `video-url:${productSlug}:${moduleSlug}:${lessonSlug}`;
    sessionStorage.removeItem(cacheKey);
    setContent(null);
    setIsLoading(true);
    setError(null);

    // Trigger re-fetch by forcing state update
    const params = new URLSearchParams({
      product: productSlug,
      module: moduleSlug,
      lesson: lessonSlug,
    });

    fetch(`/api/content/signed-url?${params}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        const dataWithTimestamp = { ...data, cachedAt: Date.now() };
        sessionStorage.setItem(cacheKey, JSON.stringify(dataWithTimestamp));
        setContent(dataWithTimestamp);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={retryFetch}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!content?.url && !content?.embedUrl) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center text-gray-400">
        Video coming soon
      </div>
    );
  }

  // Bunny Stream embed (most secure - uses their player with token auth)
  if (content.type === 'bunny' && content.embedUrl) {
    return (
      <div className="aspect-video bg-black w-full max-w-full overflow-hidden">
        <iframe
          src={content.embedUrl}
          loading="lazy"
          className="w-full h-full border-0 max-w-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video URL (for signed HLS streams or external sources)
  if (content.url) {
    // Check if it's an HLS stream
    if (content.url.includes('.m3u8')) {
      // For HLS, we'd use hls.js - for now, use native support or fallback
      return (
        <div className="aspect-video bg-black w-full max-w-full overflow-hidden">
          <video
            src={content.url}
            controls
            className="w-full h-full max-w-full"
            poster={thumbnailUrl}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              if (onProgress && video.duration) {
                const progress = (video.currentTime / video.duration) * 100;
                onProgress(progress, video.currentTime);
              }
            }}
            onEnded={() => onComplete?.()}
            onLoadedMetadata={(e) => {
              // Seek to initial position if provided
              if (initialPosition > 0) {
                e.currentTarget.currentTime = initialPosition;
              }
            }}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    // Regular video file
    return (
      <div className="aspect-video bg-black w-full max-w-full overflow-hidden">
        <video
          src={content.url}
          controls
          className="w-full h-full max-w-full"
          poster={thumbnailUrl}
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            if (onProgress && video.duration) {
              const progress = (video.currentTime / video.duration) * 100;
              onProgress(progress, video.currentTime);
            }
          }}
          onEnded={() => onComplete?.()}
          onLoadedMetadata={(e) => {
            if (initialPosition > 0) {
              e.currentTarget.currentTime = initialPosition;
            }
          }}
        >
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black flex items-center justify-center text-gray-400">
      Video unavailable
    </div>
  );
});
