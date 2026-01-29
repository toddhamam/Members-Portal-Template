"use client";

import { memo, useState } from "react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { MessageWithSender, AttachmentType } from "@/lib/supabase/types";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showSender?: boolean;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function PlayIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ImageAttachment({
  url,
  name,
  isOwnMessage,
}: {
  url: string;
  name: string | null;
  isOwnMessage: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg overflow-hidden max-w-[240px]"
    >
      {loading && !error && (
        <div className="w-[240px] h-[160px] bg-gray-200 animate-pulse rounded-lg" />
      )}
      {error ? (
        <div className="w-[240px] h-[160px] bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      ) : (
        <img
          src={url}
          alt={name || "Image attachment"}
          className={`max-w-full h-auto rounded-lg ${loading ? 'hidden' : ''}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          style={{ maxHeight: '300px' }}
        />
      )}
    </a>
  );
}

function VideoAttachment({
  url,
  name,
  isOwnMessage,
}: {
  url: string;
  name: string | null;
  isOwnMessage: boolean;
}) {
  const [showVideo, setShowVideo] = useState(false);

  if (showVideo) {
    return (
      <video
        src={url}
        controls
        autoPlay
        className="max-w-[280px] max-h-[200px] rounded-lg"
      >
        Your browser does not support video playback.
      </video>
    );
  }

  return (
    <button
      onClick={() => setShowVideo(true)}
      className="relative block w-[240px] h-[160px] bg-gray-800 rounded-lg overflow-hidden group"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white transition-colors">
          <PlayIcon className="w-8 h-8 text-gray-800 ml-1" />
        </div>
      </div>
      <span className="absolute bottom-2 left-2 text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
        {name || 'Video'}
      </span>
    </button>
  );
}

function DocumentAttachment({
  url,
  name,
  size,
  isOwnMessage,
}: {
  url: string;
  name: string | null;
  size: number | null;
  isOwnMessage: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-colors
        ${isOwnMessage
          ? 'bg-[#c49464] hover:bg-[#b48454]'
          : 'bg-gray-200 hover:bg-gray-300'
        }
      `}
    >
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
        ${isOwnMessage ? 'bg-white/20' : 'bg-gray-300'}
      `}>
        <span className="text-lg">📄</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
          {name || 'Document'}
        </p>
        {size && (
          <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
            {formatFileSize(size)}
          </p>
        )}
      </div>
      <DownloadIcon className={`w-5 h-5 flex-shrink-0 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`} />
    </a>
  );
}

function AttachmentRenderer({
  type,
  url,
  name,
  size,
  isOwnMessage,
}: {
  type: AttachmentType;
  url: string;
  name: string | null;
  size: number | null;
  isOwnMessage: boolean;
}) {
  switch (type) {
    case 'image':
      return <ImageAttachment url={url} name={name} isOwnMessage={isOwnMessage} />;
    case 'video':
      return <VideoAttachment url={url} name={name} isOwnMessage={isOwnMessage} />;
    case 'document':
      return <DocumentAttachment url={url} name={name} size={size} isOwnMessage={isOwnMessage} />;
    default:
      return <DocumentAttachment url={url} name={name} size={size} isOwnMessage={isOwnMessage} />;
  }
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showSender = false,
}: MessageBubbleProps) {
  const {
    sender,
    content,
    created_at,
    is_edited,
    attachment_url,
    attachment_type,
    attachment_name,
    attachment_size_bytes,
  } = message;

  const hasAttachment = attachment_url && attachment_type;
  const hasContent = content && content.trim().length > 0;

  return (
    <div
      className={`
        flex gap-2 max-w-[85%]
        ${isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"}
      `}
    >
      {/* Avatar (only for received messages) */}
      {!isOwnMessage && showAvatar && (
        <UserAvatar
          avatarUrl={sender.avatarUrl}
          name={sender.name}
          userId={sender.id}
          size="sm"
          className="flex-shrink-0 mt-1"
        />
      )}

      {/* Message content */}
      <div
        className={`
          flex flex-col
          ${isOwnMessage ? "items-end" : "items-start"}
        `}
      >
        {/* Sender name (optional) */}
        {showSender && !isOwnMessage && (
          <span className="text-xs text-gray-500 mb-1 ml-1">
            {sender.name || "Member"}
            {sender.isAdmin && (
              <span className="ml-1 text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </span>
        )}

        {/* Attachment (if any) */}
        {hasAttachment && (
          <div className="mb-1">
            <AttachmentRenderer
              type={attachment_type as AttachmentType}
              url={attachment_url}
              name={attachment_name}
              size={attachment_size_bytes}
              isOwnMessage={isOwnMessage}
            />
          </div>
        )}

        {/* Text Bubble (if has content) */}
        {hasContent && (
          <div
            className={`
              px-3 py-2 rounded-2xl
              ${
                isOwnMessage
                  ? "bg-[#d4a574] text-white rounded-br-md"
                  : "bg-gray-100 text-gray-900 rounded-bl-md"
              }
            `}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`
            flex items-center gap-1 mt-1 px-1
            text-[10px] text-gray-400
          `}
        >
          <span>{formatMessageTime(created_at)}</span>
          {is_edited && <span>(edited)</span>}
        </div>
      </div>
    </div>
  );
});
