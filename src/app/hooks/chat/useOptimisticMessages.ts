// src/app/hooks/chat/useOptimisticMessages.ts - Optimistic Message Management

"use client";

import { useRef, useCallback } from "react";
import { ThreadMessage } from "../../services/mymmo-thread-service/apiThreads";

export function useOptimisticMessages() {
  const optimisticMessages = useRef<Set<string>>(new Set());

  // Create optimistic message
  const createOptimisticMessage = useCallback(
    (text: string, threadId: string, createdBy: number, attachments?: any[]): ThreadMessage => {
      const optimisticId = `temp-${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      const optimisticMessage: ThreadMessage = {
        _id: optimisticId,
        text: text.trim(),
        created_on: now,
        created_by: createdBy,
        thread_id: threadId,
        attachments: attachments || [],
        lang_id_detected: "",
        metadata: { recipients: [] },
        is_deleted: false,
        updated_on: now,
        updated_by: null,
        __v: 0,
      };

      optimisticMessages.current.add(optimisticId);
      return optimisticMessage;
    },
    []
  );

  // Check if message is optimistic
  const isOptimisticMessage = useCallback((messageId: string): boolean => {
    return (
      optimisticMessages.current.has(messageId) || messageId.startsWith("temp-")
    );
  }, []);

  // Remove optimistic message
  const removeOptimisticMessage = useCallback((messageId: string) => {
    optimisticMessages.current.delete(messageId);
  }, []);

  // Update optimistic message with real message
  const updateOptimisticMessage = useCallback(
    (messages: ThreadMessage[], newMessage: ThreadMessage): ThreadMessage[] => {
      // Check if this is an update to an optimistic message
      if (optimisticMessages.current.has(newMessage._id)) {
        optimisticMessages.current.delete(newMessage._id);

        // Replace optimistic message with real one
        return messages.map((msg) =>
          msg._id.startsWith("temp-") && msg.text === newMessage.text
            ? newMessage
            : msg
        );
      }

      // Add new message if not already present
      if (messages.some((msg) => msg._id === newMessage._id)) {
        return messages; // Avoid duplicates
      }

      // Insert in chronological order
      const newMessages = [...messages, newMessage];
      return newMessages.sort(
        (a, b) =>
          new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
      );
    },
    []
  );

  // Clean up failed optimistic messages
  const cleanupOptimisticMessages = useCallback(
    (messages: ThreadMessage[], failedMessageId: string): ThreadMessage[] => {
      optimisticMessages.current.delete(failedMessageId);
      return messages.filter((msg) => msg._id !== failedMessageId);
    },
    []
  );

  // Clear all optimistic messages
  const clearOptimisticMessages = useCallback(() => {
    optimisticMessages.current.clear();
  }, []);

  return {
    createOptimisticMessage,
    isOptimisticMessage,
    removeOptimisticMessage,
    updateOptimisticMessage,
    cleanupOptimisticMessages,
    clearOptimisticMessages,
    optimisticMessageIds: Array.from(optimisticMessages.current),
  };
}
