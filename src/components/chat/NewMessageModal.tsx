"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserAvatar, formatDisplayName } from "@/components/shared/UserAvatar";
import { useChat } from "./ChatProvider";

interface Member {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewMessageModal({ isOpen, onClose }: NewMessageModalProps) {
  const { openConversation } = useChat();
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch members when modal opens or search changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "20",
          sortBy: "full_name",
          sortOrder: "asc",
        });

        if (search) {
          params.set("search", search);
        }

        const response = await fetch(`/api/admin/members?${params}`);
        if (!response.ok) throw new Error("Failed to fetch members");

        const data = await response.json();
        setMembers(data.members || []);
      } catch (error) {
        console.error("[NewMessageModal] Error fetching members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMembers, 300);
    return () => clearTimeout(debounce);
  }, [isOpen, search]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSelectMember = useCallback(async (member: Member) => {
    setCreating(true);
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");

      const data = await response.json();
      onClose();
      openConversation(data.conversation.id);
    } catch (error) {
      console.error("[NewMessageModal] Error creating conversation:", error);
    } finally {
      setCreating(false);
    }
  }, [onClose, openConversation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="
          w-full max-w-md mx-4
          bg-white rounded-xl shadow-2xl
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">New Message</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              autoFocus
              className="
                w-full pl-9 pr-3 py-2
                text-sm
                border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#d4a574]/50 focus:border-[#d4a574]
                placeholder:text-gray-400
              "
            />
          </div>
        </div>

        {/* Members list */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">
                {search ? "No members found" : "No members available"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  disabled={creating}
                  className="
                    w-full flex items-center gap-3 p-3 rounded-lg
                    text-left transition-colors
                    hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  <UserAvatar
                    avatarUrl={member.avatar_url}
                    name={member.full_name}
                    userId={member.id}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 block truncate">
                      {formatDisplayName(member.full_name)}
                    </span>
                    <span className="text-xs text-gray-500 truncate block">
                      {member.email}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
