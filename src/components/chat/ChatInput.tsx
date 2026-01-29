"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import type { AttachmentType } from "@/lib/supabase/types";

function SendIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );
}

function AttachIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>
  );
}

function CloseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export interface AttachmentData {
  url: string;
  type: AttachmentType;
  name: string;
  size: number;
}

interface ChatInputProps {
  onSend: (content: string, attachment?: AttachmentData) => void;
  conversationId: string;
  disabled?: boolean;
  placeholder?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: AttachmentType): string {
  switch (type) {
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'document': return '📄';
    default: return '📎';
  }
}

function getAttachmentType(mimeType: string): AttachmentType | null {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet') ||
    mimeType.startsWith('text/')
  ) return 'document';
  return null;
}

export function ChatInput({
  onSend,
  conversationId,
  disabled = false,
  placeholder = "Message",
}: ChatInputProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if ((!trimmed && !selectedFile) || disabled || uploading) return;

    // If there's a file, upload it first
    if (selectedFile) {
      setUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('conversationId', conversationId);

        const response = await fetch('/api/messages/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        const attachment: AttachmentData = {
          url: data.attachment.url,
          type: data.attachment.type,
          name: data.attachment.name,
          size: data.attachment.size,
        };

        // Send message with attachment
        onSend(trimmed, attachment);
        setContent("");
        setSelectedFile(null);
      } catch (error) {
        console.error('[ChatInput] Upload failed:', error);
        setUploadError(error instanceof Error ? error.message : 'Upload failed');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    } else {
      // Send text-only message
      onSend(trimmed);
      setContent("");
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [content, selectedFile, disabled, uploading, conversationId, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = 100; // Max 4-5 lines
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const attachmentType = getAttachmentType(file.type);
    if (!attachmentType) {
      setUploadError('File type not supported');
      return;
    }

    // Validate file size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File too large (max 25MB)');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  const canSend = (content.trim().length > 0 || selectedFile) && !disabled && !uploading;

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* File preview */}
      {selectedFile && (
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-lg">
              {getFileIcon(getAttachmentType(selectedFile.type) || 'document')}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              aria-label="Remove file"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="px-3 pt-2">
          <p className="text-xs text-red-500">{uploadError}</p>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        {/* File attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className={`
            p-2 rounded-xl transition-colors flex-shrink-0
            ${disabled || uploading
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }
          `}
          aria-label="Attach file"
        >
          <AttachIcon className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || uploading}
          rows={1}
          className="
            flex-1 resize-none
            px-3 py-2
            text-sm
            border border-gray-200 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-[#d4a574]/50 focus:border-[#d4a574]
            disabled:bg-gray-50 disabled:text-gray-400
            placeholder:text-gray-400
          "
          style={{ maxHeight: "100px" }}
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            p-2 rounded-xl transition-colors flex-shrink-0
            ${
              canSend
                ? "bg-[#d4a574] text-white hover:bg-[#c49464]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
          aria-label="Send message"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SendIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
