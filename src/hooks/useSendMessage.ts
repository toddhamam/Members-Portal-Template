import { useState, useCallback } from 'react';
import type { MessageWithSender } from '@/lib/supabase/types';

interface SendMessageResponse {
  message: MessageWithSender;
}

interface UseSendMessageOptions {
  onSuccess?: (message: MessageWithSender) => void;
  onError?: (error: string) => void;
}

export function useSendMessage(options: UseSendMessageOptions = {}) {
  const { onSuccess, onError } = options;

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (conversationId: string, content: string): Promise<MessageWithSender | null> => {
    if (!conversationId || !content.trim()) {
      return null;
    }

    try {
      setSending(true);
      setError(null);

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      const data: SendMessageResponse = await response.json();

      onSuccess?.(data.message);
      return data.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setSending(false);
    }
  }, [onSuccess, onError]);

  return {
    sendMessage,
    sending,
    error,
  };
}
