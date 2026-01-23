import Image from "next/image";

interface MediaCardProps {
  type: "youtube" | "podcast";
  title: string;
  description?: string;
  thumbnailUrl?: string;
  url: string;
  duration?: string;
  platform?: string;
}

export function MediaCard({
  type,
  title,
  description,
  thumbnailUrl,
  url,
  duration,
  platform,
}: MediaCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#252525] rounded-lg overflow-hidden group block active:ring-2 active:ring-[#d4a574] lg:hover:ring-2 lg:hover:ring-[#d4a574] transition-all touch-manipulation"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-[#1a1a2e] to-[#0f3460]">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {type === "youtube" ? (
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 16.5v-9l7 4.5-7 4.5z" />
              </svg>
            )}
          </div>
        )}

        {/* Play overlay - visible on mobile, hover on desktop */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ee5d0b] flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-0.5 sm:ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            {duration}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 sm:gap-1.5 bg-black/80 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
          {type === "youtube" ? (
            <>
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>YouTube</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span>{platform || "Podcast"}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="text-white font-medium text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-[#d4a574] group-active:text-[#d4a574] transition-colors leading-snug">
          {title}
        </h3>
        {description && (
          <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{description}</p>
        )}
      </div>
    </a>
  );
}
