'use client';

import { useState, useEffect } from 'react';

interface AudioPlayerProps {
  productSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  title: string;
  onProgress?: (progress: number, currentTime: number) => void;
  onComplete?: () => void;
  initialPosition?: number;
}

export function AudioPlayer({
  productSlug,
  moduleSlug,
  lessonSlug,
  title,
  onProgress,
  onComplete,
  initialPosition = 0,
}: AudioPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          product: productSlug,
          module: moduleSlug,
          lesson: lessonSlug,
        });

        const response = await fetch(`/api/content/signed-url?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load audio');
        }

        setUrl(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [productSlug, moduleSlug, lessonSlug]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-[#d4a574]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h3 className="text-white font-medium">{title}</h3>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a574]"></div>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && url && (
        <audio
          src={url}
          controls
          className="w-full"
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            if (onProgress && audio.duration) {
              const progress = (audio.currentTime / audio.duration) * 100;
              onProgress(progress, audio.currentTime);
            }
          }}
          onEnded={() => onComplete?.()}
          onLoadedMetadata={(e) => {
            if (initialPosition > 0) {
              e.currentTarget.currentTime = initialPosition;
            }
          }}
        />
      )}

      {!isLoading && !error && !url && (
        <p className="text-gray-400 text-center">Audio coming soon</p>
      )}
    </div>
  );
}
