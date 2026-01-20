'use client';

import { useState, useEffect, memo } from 'react';

interface DownloadButtonProps {
  productSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  title: string;
}

interface CachedUrl {
  url: string;
  cachedAt: number;
}

// Cache TTL: 50 minutes (signed URLs expire in 60 minutes)
const CACHE_TTL_MS = 50 * 60 * 1000;

function DownloadIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

export const DownloadButton = memo(function DownloadButton({
  productSlug,
  moduleSlug,
  lessonSlug,
  title,
}: DownloadButtonProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state
    setUrl(null);
    setIsLoading(true);
    setError(null);

    // Check sessionStorage cache first
    const cacheKey = `download-url:${productSlug}:${moduleSlug}:${lessonSlug}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const data = JSON.parse(cached) as CachedUrl;
        // Check if cached URL is still valid
        if (data.cachedAt && Date.now() - data.cachedAt < CACHE_TTL_MS) {
          setUrl(data.url);
          setIsLoading(false);
          return;
        }
      } catch {
        // Invalid cache, continue to fetch
      }
    }

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
          throw new Error(data.error || 'Failed to get download link');
        }

        // Cache the response
        sessionStorage.setItem(cacheKey, JSON.stringify({
          url: data.url,
          cachedAt: Date.now()
        }));

        setUrl(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get download link');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [productSlug, moduleSlug, lessonSlug]);

  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-[#d4a574]/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <DownloadIcon className="w-8 h-8 text-[#d4a574]" />
      </div>
      <h3 className="text-lg font-medium text-[#222222] mb-2">{title}</h3>
      <p className="text-[#6b7280] mb-4">Click below to download this resource</p>

      {isLoading && (
        <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-400 font-medium px-6 py-3 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400"></div>
          Loading...
        </div>
      )}

      {error && (
        <div>
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && url && (
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#222222] hover:bg-black text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          <DownloadIcon className="w-5 h-5" />
          Download
        </a>
      )}

      {!isLoading && !error && !url && (
        <p className="text-[#9ca3af]">Download coming soon</p>
      )}
    </div>
  );
});
