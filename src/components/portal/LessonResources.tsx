"use client";

import { useState } from "react";
import type { LessonResource } from "@/lib/supabase/types";

function DownloadIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function DocumentIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ChecklistIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function AudioIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );
}

function VideoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function LinkIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'pdf':
      return DocumentIcon;
    case 'worksheet':
      return DocumentIcon;
    case 'checklist':
      return ChecklistIcon;
    case 'audio':
      return AudioIcon;
    case 'video':
      return VideoIcon;
    case 'link':
      return LinkIcon;
    default:
      return DocumentIcon;
  }
}

function getResourceLabel(type: string): string {
  switch (type) {
    case 'pdf':
      return 'PDF';
    case 'worksheet':
      return 'Worksheet';
    case 'checklist':
      return 'Checklist';
    case 'audio':
      return 'Audio';
    case 'video':
      return 'Video';
    case 'link':
      return 'Link';
    default:
      return 'Resource';
  }
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface LessonResourcesProps {
  resources: LessonResource[];
}

function ResourceItem({ resource }: { resource: LessonResource }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const Icon = getResourceIcon(resource.resource_type);
  const isExternal = !!resource.external_url && !resource.file_url;

  const handleDownload = async (e: React.MouseEvent) => {
    // For external links, let the browser handle it
    if (isExternal) {
      return;
    }

    e.preventDefault();
    setIsDownloading(true);

    try {
      // Fetch signed URL from API
      const response = await fetch(`/api/resources/${resource.id}`);
      const data = await response.json();

      console.log('Download API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get download URL');
      }

      if (!data.url) {
        throw new Error('No download URL returned');
      }

      // For cross-origin downloads, we need to navigate directly
      // The signed URL already has Content-Disposition: attachment set
      window.location.href = data.url;
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download resource. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isExternal) {
    return (
      <a
        href={resource.external_url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#f5f3ef] hover:bg-[#eceae6] rounded-lg transition-colors group"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#d4a574]/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4a574]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[#222222] text-sm sm:text-base truncate">
              {resource.title}
            </span>
            <span className="text-xs text-[#6b7280] bg-white px-2 py-0.5 rounded flex-shrink-0">
              {getResourceLabel(resource.resource_type)}
            </span>
          </div>
          {resource.description && (
            <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5 line-clamp-1">
              {resource.description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-[#6b7280] group-hover:text-[#222222] transition-colors">
          <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </a>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#f5f3ef] hover:bg-[#eceae6] rounded-lg transition-colors group text-left disabled:opacity-50 disabled:cursor-wait"
    >
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#d4a574]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4a574]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[#222222] text-sm sm:text-base truncate">
            {resource.title}
          </span>
          <span className="text-xs text-[#6b7280] bg-white px-2 py-0.5 rounded flex-shrink-0">
            {getResourceLabel(resource.resource_type)}
          </span>
        </div>
        {resource.description && (
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5 line-clamp-1">
            {resource.description}
          </p>
        )}
        {resource.file_size_bytes && (
          <p className="text-xs text-[#9ca3af] mt-1">
            {formatFileSize(resource.file_size_bytes)}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 text-[#6b7280] group-hover:text-[#222222] transition-colors">
        {isDownloading ? (
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#6b7280] border-t-transparent rounded-full animate-spin" />
        ) : (
          <DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </div>
    </button>
  );
}

export function LessonResources({ resources }: LessonResourcesProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-[#222222] mb-3 sm:mb-4 font-serif">
        Resources & Downloads
      </h3>

      <div className="space-y-2 sm:space-y-3">
        {resources.map((resource) => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
