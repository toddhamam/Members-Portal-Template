"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUserSearch } from "@/lib/hooks/useUserSearch";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

interface MentionDropdownProps {
  users: Array<{ id: string; full_name: string | null; avatar_url: string | null }>;
  isLoading: boolean;
  selectedIndex: number;
  onSelect: (user: { id: string; full_name: string | null }) => void;
  position: { top: number; left: number };
}

function MentionDropdown({
  users,
  isLoading,
  selectedIndex,
  onSelect,
  position,
}: MentionDropdownProps) {
  if (!isLoading && users.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {isLoading ? (
        <div className="px-4 py-2 text-sm text-[#6b7280]">Searching...</div>
      ) : (
        users.map((user, index) => {
          const initials = user.full_name
            ? user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "?";

          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user)}
              className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-[#faf9f7] transition-colors ${
                index === selectedIndex ? "bg-[#faf9f7]" : ""
              }`}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || "User"}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#d4a574] flex items-center justify-center text-white text-xs font-medium">
                  {initials}
                </div>
              )}
              <span className="text-sm text-[#222222] truncate">
                {user.full_name || "Unknown User"}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}

export function MentionInput({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
  rows = 3,
  maxLength,
  disabled = false,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionState, setMentionState] = useState<{
    isActive: boolean;
    query: string;
    startPosition: number;
    dropdownPosition: { top: number; left: number };
  }>({
    isActive: false,
    query: "",
    startPosition: 0,
    dropdownPosition: { top: 0, left: 0 },
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { users, isLoading } = useUserSearch(
    mentionState.isActive ? mentionState.query : ""
  );

  // Reset selected index when users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [users]);

  const getCaretCoordinates = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { top: 0, left: 0 };

    // Create a mirror div to measure caret position
    const mirror = document.createElement("div");
    const style = window.getComputedStyle(textarea);

    // Copy styles
    mirror.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow: hidden;
      width: ${style.width};
      font: ${style.font};
      padding: ${style.padding};
      border: ${style.border};
      line-height: ${style.lineHeight};
    `;

    // Get text up to cursor
    const textBeforeCursor = value.substring(0, textarea.selectionStart);
    mirror.textContent = textBeforeCursor;

    // Add a span at the end to measure position
    const span = document.createElement("span");
    span.textContent = "|";
    mirror.appendChild(span);

    document.body.appendChild(mirror);

    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();

    document.body.removeChild(mirror);

    return {
      top: rect.top + (spanRect.top - mirrorRect.top) + 24, // Add line height offset
      left: Math.min(rect.left + (spanRect.left - mirrorRect.left), rect.right - 260),
    };
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    onChange(newValue);

    // Check for @ trigger
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // Check if we're in a valid mention context (no spaces after @, not inside existing mention)
      if (!/\s/.test(textAfterAt) && textAfterAt.length <= 30) {
        // Check if this @ is at the start or after a whitespace/newline
        const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : " ";
        if (/\s/.test(charBeforeAt) || lastAtIndex === 0) {
          setMentionState({
            isActive: true,
            query: textAfterAt,
            startPosition: lastAtIndex,
            dropdownPosition: getCaretCoordinates(),
          });
          return;
        }
      }
    }

    // Close mention dropdown if conditions not met
    if (mentionState.isActive) {
      setMentionState((prev) => ({ ...prev, isActive: false }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mentionState.isActive || users.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % users.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSelectUser(users[selectedIndex]);
    } else if (e.key === "Escape") {
      setMentionState((prev) => ({ ...prev, isActive: false }));
    }
  };

  const handleSelectUser = (user: { id: string; full_name: string | null }) => {
    if (!textareaRef.current) return;

    const displayName = user.full_name || "User";
    // Format: @[Display Name](user-id)
    const mentionText = `@[${displayName}](${user.id}) `;

    // Replace the @query with the mention
    const beforeMention = value.substring(0, mentionState.startPosition);
    const afterMention = value.substring(
      mentionState.startPosition + mentionState.query.length + 1
    );

    const newValue = beforeMention + mentionText + afterMention;
    onChange(newValue);

    // Close dropdown
    setMentionState((prev) => ({ ...prev, isActive: false }));

    // Focus textarea and set cursor position
    const newCursorPosition = mentionState.startPosition + mentionText.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (mentionState.isActive) {
        setMentionState((prev) => ({ ...prev, isActive: false }));
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mentionState.isActive]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full p-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a574] focus:border-transparent resize-none text-[#222222] placeholder:text-[#9ca3af] disabled:bg-gray-50 disabled:cursor-not-allowed ${className}`}
      />

      {mentionState.isActive && (
        <MentionDropdown
          users={users}
          isLoading={isLoading}
          selectedIndex={selectedIndex}
          onSelect={handleSelectUser}
          position={mentionState.dropdownPosition}
        />
      )}
    </div>
  );
}

// Utility to render text with mentions styled
export function renderMentions(text: string): React.ReactNode {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the styled mention
    const [, displayName, userId] = match;
    parts.push(
      <span
        key={`${userId}-${match.index}`}
        className="text-[#d4a574] font-medium cursor-pointer hover:underline"
      >
        @{displayName}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Extract user IDs from mentions in text
export function extractMentionIds(text: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const ids: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    ids.push(match[2]);
  }

  return [...new Set(ids)]; // Return unique IDs
}
