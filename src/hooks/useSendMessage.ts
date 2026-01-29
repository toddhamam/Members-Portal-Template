import { useState, useCallback } from 'react';
import type { MessageWithSender, AttachmentType } from '@/lib/supabase/types';

interface AttachmentData {
  url: string;
  type: AttachmentType;
  name: string;
  size: number;
}

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

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    attachment?: AttachmentData
  ): Promise<MessageWithSender | null> => {
    // Allow empty content if there's an attachment
    if (!conversationId || (!content.trim() && !attachment)) {
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
          content: content.trim() || (attachment ? '' : ''),
          attachment: attachment ? {
            url: attachment.url,
            type: attachment.type,
            name: attachment.name,
            size: attachment.size,
          } : undefined,
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
