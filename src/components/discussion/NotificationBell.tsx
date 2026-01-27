"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import type { NotificationWithActor } from "@/lib/supabase/types";

function BellIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getNotificationText(notification: NotificationWithActor): string {
  const actorName = formatDisplayName(notification.actor?.full_name, "Someone");

  switch (notification.type) {
    case "mention":
      return `${actorName} mentioned you`;
    case "reply_to_post":
      return `${actorName} replied to your post`;
    case "reply_to_comment":
      return `${actorName} replied to your comment`;
    case "reaction":
      return `${actorName} reacted to your post`;
    default:
      return `${actorName} interacted with you`;
  }
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: NotificationWithActor;
  onMarkRead: (id: string) => void;
}) {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
  };

  const linkHref = notification.post_id
    ? `/portal/community/post/${notification.post_id}`
    : "/portal/community";

  return (
    <Link
      href={linkHref}
      onClick={handleClick}
      className={`block px-4 py-3 hover:bg-[#faf9f7] transition-colors ${
        !notification.is_read ? "bg-[#fef7f0]" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <UserAvatar
          avatarUrl={notification.actor?.avatar_url}
          name={notification.actor?.full_name}
          userId={notification.actor_id}
          size="sm"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#222222]">
            {getNotificationText(notification)}
          </p>
          {notification.preview_text && (
            <p className="text-xs text-[#6b7280] truncate mt-0.5">
              {notification.preview_text}
            </p>
          )}
          <p className="text-xs text-[#9ca3af] mt-1">
            {formatTimeAgo(notification.created_at)}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-[#d4a574] flex-shrink-0 mt-2" />
        )}
      </div>
    </Link>
  );
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    markAsRead,
    markAllRead,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = (id: string) => {
    markAsRead([id]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#6b7280] hover:text-[#222222] hover:bg-gray-50 rounded-lg transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <BellIcon />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#ee5d0b] text-white text-xs font-medium rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
            <h3 className="font-medium text-[#222222]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-[#d4a574] hover:text-[#b8956c] font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-6 h-6 border-2 border-[#d4a574] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#6b7280]">No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="w-full py-3 text-sm text-[#d4a574] hover:text-[#b8956c] hover:bg-[#faf9f7] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : "Load more"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#e5e7eb]">
            <Link
              href="/portal/community"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-sm text-[#d4a574] hover:text-[#b8956c] hover:bg-[#faf9f7] transition-colors"
            >
              View all in Community
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
