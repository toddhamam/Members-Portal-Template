"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { notifyNewMessage, areSoundNotificationsEnabled, setSoundNotificationsEnabled } from "@/lib/sounds";

interface ChatState {
  isListOpen: boolean;
  openConversations: string[]; // IDs of open chat windows
  minimizedConversations: string[];
}

interface ChatContextValue extends ChatState {
  totalUnreadCount: number;
  soundEnabled: boolean;
  conversationListVersion: number; // Increment to trigger conversation list refresh
  openList: () => void;
  closeList: () => void;
  toggleList: () => void;
  openConversation: (id: string) => void;
  closeConversation: (id: string) => void;
  minimizeConversation: (id: string) => void;
  maximizeConversation: (id: string) => void;
  refreshUnreadCount: () => void;
  decrementUnread: (amount: number) => void;
  toggleSound: () => void;
  triggerConversationListRefresh: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

// Safe hook that returns null if not in provider
export function useChatOptional() {
  return useContext(ChatContext);
}

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user } = useAuth();
  const { unreadCount, refresh: refreshUnreadCount, decrementBy } = useUnreadCount({
    enabled: !!user,
    pollInterval: 60000, // Poll every 60 seconds
  });

  const [state, setState] = useState<ChatState>({
    isListOpen: false,
    openConversations: [],
    minimizedConversations: [],
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [conversationListVersion, setConversationListVersion] = useState(0);
  const prevUnreadCount = useRef<number>(0);

  // Initialize sound preference from localStorage
  useEffect(() => {
    setSoundEnabled(areSoundNotificationsEnabled());
  }, []);

  // Play sound when unread count increases
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && prevUnreadCount.current !== 0) {
      // New message arrived - play notification sound
      notifyNewMessage();
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  // Close everything when user logs out
  useEffect(() => {
    if (!user) {
      setState({
        isListOpen: false,
        openConversations: [],
        minimizedConversations: [],
      });
    }
  }, [user]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      setSoundNotificationsEnabled(newValue);
      return newValue;
    });
  }, []);

  const openList = useCallback(() => {
    setState((prev) => ({ ...prev, isListOpen: true }));
  }, []);

  const closeList = useCallback(() => {
    setState((prev) => ({ ...prev, isListOpen: false }));
  }, []);

  const toggleList = useCallback(() => {
    setState((prev) => ({ ...prev, isListOpen: !prev.isListOpen }));
  }, []);

  const openConversation = useCallback((id: string) => {
    setState((prev) => {
      // Remove from minimized if it was minimized
      const minimized = prev.minimizedConversations.filter((cid) => cid !== id);

      // Add to open if not already there
      const open = prev.openConversations.includes(id)
        ? prev.openConversations
        : [...prev.openConversations, id];

      // Limit to 3 open conversations (close oldest if needed)
      const limitedOpen = open.length > 3 ? open.slice(-3) : open;

      return {
        ...prev,
        isListOpen: false, // Close list when opening a conversation
        openConversations: limitedOpen,
        minimizedConversations: minimized,
      };
    });
  }, []);

  const closeConversation = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      openConversations: prev.openConversations.filter((cid) => cid !== id),
      minimizedConversations: prev.minimizedConversations.filter((cid) => cid !== id),
    }));
  }, []);

  const minimizeConversation = useCallback((id: string) => {
    setState((prev) => {
      // Remove from open
      const open = prev.openConversations.filter((cid) => cid !== id);

      // Add to minimized if not already there
      const minimized = prev.minimizedConversations.includes(id)
        ? prev.minimizedConversations
        : [...prev.minimizedConversations, id];

      return {
        ...prev,
        openConversations: open,
        minimizedConversations: minimized,
      };
    });
  }, []);

  const maximizeConversation = useCallback((id: string) => {
    setState((prev) => {
      // Remove from minimized
      const minimized = prev.minimizedConversations.filter((cid) => cid !== id);

      // Add to open
      const open = prev.openConversations.includes(id)
        ? prev.openConversations
        : [...prev.openConversations, id];

      // Limit to 3 open
      const limitedOpen = open.length > 3 ? open.slice(-3) : open;

      return {
        ...prev,
        openConversations: limitedOpen,
        minimizedConversations: minimized,
      };
    });
  }, []);

  const triggerConversationListRefresh = useCallback(() => {
    setConversationListVersion((v) => v + 1);
  }, []);

  const value: ChatContextValue = {
    ...state,
    totalUnreadCount: unreadCount,
    soundEnabled,
    conversationListVersion,
    openList,
    closeList,
    toggleList,
    openConversation,
    closeConversation,
    minimizeConversation,
    maximizeConversation,
    refreshUnreadCount,
    decrementUnread: decrementBy,
    toggleSound,
    triggerConversationListRefresh,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
