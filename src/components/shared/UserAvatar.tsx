"use client";

import { useState } from "react";

interface UserAvatarProps {
  /** User's uploaded avatar URL */
  avatarUrl?: string | null;
  /** User's full name for initials fallback */
  name?: string | null;
  /** User ID for generating unique default avatar */
  userId?: string | null;
  /** Size class - default is w-10 h-10 */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

/**
 * Generates initials from a name.
 * "John Doe" -> "JD"
 * "John" -> "J"
 * null -> "?"
 */
function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "?";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    // Single name - return first 2 characters
    return parts[0].slice(0, 2).toUpperCase();
  }

  // Multiple names - first letter of first name + first letter of last name
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return (firstName[0] + lastName[0]).toUpperCase();
}

/**
 * Generates a unique default avatar URL using DiceBear.
 * Each user ID produces a unique, consistent avatar.
 */
function getDefaultAvatarUrl(userId?: string | null): string {
  const seed = userId || "default";
  // Using "shapes" style for a clean, modern look
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=d4a574,ee5d0b,222222,6b7280&shape1Color=ffffff&shape2Color=ffffff&shape3Color=ffffff`;
}

/**
 * UserAvatar component with smart fallbacks:
 * 1. Shows uploaded avatar if available
 * 2. Falls back to DiceBear generated avatar (unique per user ID)
 * 3. Falls back to initials if image fails to load
 */
export function UserAvatar({
  avatarUrl,
  name,
  userId,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = getInitials(name);
  const sizeClass = sizeClasses[size];

  // Determine which image to show
  const hasUploadedAvatar = avatarUrl && !imageError;
  const showDefaultAvatar = !hasUploadedAvatar && userId && !imageError;
  const showInitials = imageError || (!avatarUrl && !userId);

  const imageUrl = hasUploadedAvatar
    ? avatarUrl
    : showDefaultAvatar
      ? getDefaultAvatarUrl(userId)
      : null;

  if (showInitials || !imageUrl) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-[#d4a574] flex items-center justify-center text-white font-medium flex-shrink-0 ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name || "User avatar"}
      onError={() => setImageError(true)}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
    />
  );
}

/**
 * Formats a name for privacy-friendly display.
 * "John Doe" -> "John D."
 * "John" -> "John"
 * null -> "Member"
 */
export function formatDisplayName(name?: string | null, fallback = "Member"): string {
  if (!name || !name.trim()) return fallback;

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    // Single name - return as-is
    return parts[0];
  }

  // Multiple names - first name + last initial
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName[0]}.`;
}

/**
 * Export utilities for use elsewhere
 */
export { getInitials, getDefaultAvatarUrl };
