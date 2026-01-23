import type { Metadata } from "next";
import { MarketingHeader, MarketingFooter, MediaCard } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Media & Content",
  description: "Explore our collection of videos, podcasts, and content to support your journey of awakening and transformation.",
};

// Featured YouTube videos - can be updated with actual video IDs
const featuredVideos = [
  {
    id: "1",
    title: "What is Resistance Mapping?",
    description: "Learn how to identify and clear the patterns keeping you stuck.",
    url: "https://www.youtube.com/@IWInitiate",
    duration: "12:34",
  },
  {
    id: "2",
    title: "The Dark Night of the Soul Explained",
    description: "Understanding the spiritual awakening process and how to navigate it.",
    url: "https://www.youtube.com/@IWInitiate",
    duration: "18:45",
  },
  {
    id: "3",
    title: "Breaking Free from Fear Loops",
    description: "Practical techniques for escaping repetitive fear patterns.",
    url: "https://www.youtube.com/@IWInitiate",
    duration: "15:22",
  },
];

// Podcast episodes - can be updated with actual episode links
const podcastEpisodes = [
  {
    id: "1",
    title: "Ep 1: The Journey Begins",
    description: "An introduction to inner wealth and spiritual awakening.",
    url: "https://open.spotify.com/show/innerwealthinitiate",
    platform: "Spotify",
    duration: "45:00",
  },
  {
    id: "2",
    title: "Ep 2: Understanding Your Patterns",
    description: "How to recognize the programs running your life.",
    url: "https://podcasts.apple.com/podcast/innerwealthinitiate",
    platform: "Apple Podcasts",
    duration: "38:15",
  },
  {
    id: "3",
    title: "Ep 3: The Art of Surrender",
    description: "Why letting go is the key to transformation.",
    url: "https://open.spotify.com/show/innerwealthinitiate",
    platform: "Spotify",
    duration: "42:30",
  },
];

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a]">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4 sm:mb-6">
            Media & Content
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
            Explore our collection of videos, podcasts, and content designed to support
            your journey of awakening and transformation.
          </p>

          {/* Subscribe buttons - stack on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://www.youtube.com/@IWInitiate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-700 text-white font-medium rounded transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Subscribe on YouTube
            </a>
            <a
              href="https://www.instagram.com/innerwealthinitiate/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-700 active:to-pink-700 text-white font-medium rounded transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            <h2 className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-white">
              Featured Videos
            </h2>
            <a
              href="https://www.youtube.com/@IWInitiate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d4a574] hover:text-[#ee5d0b] active:text-[#ee5d0b] text-sm font-medium transition-colors"
            >
              View all videos &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredVideos.map((video) => (
              <MediaCard
                key={video.id}
                type="youtube"
                title={video.title}
                description={video.description}
                url={video.url}
                duration={video.duration}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 bg-[#252525]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            <h2 className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-white">
              Podcast Episodes
            </h2>
            <div className="flex items-center gap-4">
              <a
                href="https://open.spotify.com/show/innerwealthinitiate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1DB954] hover:opacity-80 active:opacity-80 transition-opacity p-1"
                aria-label="Listen on Spotify"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </a>
              <a
                href="https://podcasts.apple.com/podcast/innerwealthinitiate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:opacity-80 active:opacity-80 transition-opacity p-1"
                aria-label="Listen on Apple Podcasts"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5.34 0A5.328 5.328 0 0 0 0 5.34v13.32A5.328 5.328 0 0 0 5.34 24h13.32A5.328 5.328 0 0 0 24 18.66V5.34A5.328 5.328 0 0 0 18.66 0zm6.525 2.568c4.988 0 9.037 4.05 9.037 9.037 0 1.795-.262 2.682-.8 3.803-.539 1.12-1.209 2.09-2.094 3.003a.748.748 0 0 1-1.05.036.748.748 0 0 1-.036-1.05c.753-.777 1.322-1.604 1.772-2.543.451-.94.651-1.63.651-3.249 0-4.156-3.38-7.537-7.537-7.537S4.34 7.449 4.34 11.605c0 1.62.2 2.309.65 3.249.45.939 1.02 1.766 1.773 2.543a.748.748 0 0 1-.036 1.05.748.748 0 0 1-1.05-.036c-.886-.913-1.556-1.882-2.095-3.003-.538-1.121-.8-2.008-.8-3.803 0-4.988 4.049-9.037 9.037-9.037zm0 3.013a6.024 6.024 0 0 0-6.024 6.024c0 1.198.174 1.91.534 2.662.359.752.852 1.44 1.48 2.122a.748.748 0 0 1-.041 1.049.748.748 0 0 1-1.049-.041c-.738-.797-1.315-1.615-1.749-2.524-.433-.909-.675-1.804-.675-3.268A7.524 7.524 0 0 1 11.865 4.08a7.524 7.524 0 0 1 7.524 7.524c0 1.464-.242 2.36-.675 3.268-.434.91-1.011 1.727-1.749 2.524a.748.748 0 0 1-1.049.041.748.748 0 0 1-.041-1.049c.628-.682 1.121-1.37 1.48-2.122.36-.752.534-1.464.534-2.662a6.024 6.024 0 0 0-6.024-6.024zm0 3.013a3.011 3.011 0 0 0-3.013 3.011c0 1.31.444 2.1.964 2.9.52.8 1.09 1.484 1.67 2.117.58.633 1.097 1.2 1.38 1.823.281.622.281 1.2.281 2.011v.264c0 .414.336.75.75.75s.75-.336.75-.75v-.264c0-.81 0-1.389.281-2.011.283-.623.8-1.19 1.38-1.823.58-.633 1.15-1.317 1.67-2.117.52-.8.964-1.59.964-2.9a3.011 3.011 0 0 0-3.011-3.011zm0 1.5c.834 0 1.511.677 1.511 1.511s-.677 1.511-1.511 1.511-1.513-.677-1.513-1.511.679-1.511 1.513-1.511z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {podcastEpisodes.map((episode) => (
              <MediaCard
                key={episode.id}
                type="podcast"
                title={episode.title}
                description={episode.description}
                url={episode.url}
                duration={episode.duration}
                platform={episode.platform}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter/Subscribe CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white mb-3 sm:mb-4">
            Stay Connected
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Join our community and get notified when new content is released.
            Follow us on social media for daily inspiration and guidance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://www.youtube.com/@IWInitiate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-6 py-3 border border-gray-700 hover:border-[#d4a574] active:border-[#d4a574] text-white font-medium rounded transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </a>
            <a
              href="https://www.instagram.com/innerwealthinitiate/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-6 py-3 border border-gray-700 hover:border-[#d4a574] active:border-[#d4a574] text-white font-medium rounded transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
