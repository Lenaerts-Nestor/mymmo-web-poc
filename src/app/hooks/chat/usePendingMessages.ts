"use client";

import { useRef, useCallback } from "react";
import { ThreadMessage } from "../../services/mymmo-thread-service/apiThreads";

export function usePendingMessages() {
  const pendingMessageSet = useRef<Set<string>>(new Set());

  const createTemporaryMessage = useCallback(
    (text: string, threadId: string, createdBy: number): ThreadMessage => {
      const optimisticId = `temp-${Date.now()}-${Math.random()}`;

      const optimisticMessage: ThreadMessage = {
        _id: optimisticId,
        text: text.trim(),
        created_on: new Date().toISOString(),
        created_by: createdBy,
        thread_id: threadId,
        attachments: [],
        lang_id_detected: "",
        metadata: { recipients: [] },
        is_deleted: false,
        updated_on: new Date().toISOString(),
        updated_by: null,
        __v: 0,
      };

      pendingMessageSet.current.add(optimisticId);
      return optimisticMessage;
    },
    []
  );

  const isPendingMessage = useCallback((messageId: string): boolean => {
    return (
      pendingMessageSet.current.has(messageId) || messageId.startsWith("temp-")
    );
  }, []);

  const removeOptimisticMessage = useCallback((messageId: string) => {
    pendingMessageSet.current.delete(messageId);
  }, []);

  const handleMessageUpdate = useCallback(
    (messages: ThreadMessage[], newMessage: ThreadMessage): ThreadMessage[] => {
      if (pendingMessageSet.current.has(newMessage._id)) {
        pendingMessageSet.current.delete(newMessage._id);

        return messages.map((msg) =>
          msg._id.startsWith("temp-") && msg.text === newMessage.text
            ? newMessage
            : msg
        );
      }

      if (messages.some((msg) => msg._id === newMessage._id)) {
        return messages;
      }

      const newMessages = [...messages, newMessage];
      return newMessages.sort(
        (a, b) =>
          new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
      );
    },
    []
  );

  const cleanupOptimisticMessages = useCallback(
    (messages: ThreadMessage[], failedMessageId: string): ThreadMessage[] => {
      pendingMessageSet.current.delete(failedMessageId);
      return messages.filter((msg) => msg._id !== failedMessageId);
    },
    []
  );

  const resetPendingMessages = useCallback(() => {
    pendingMessageSet.current.clear();
  }, []);

  return {
    createOptimisticMessage: createTemporaryMessage,
    isOptimisticMessage: isPendingMessage,
    removeOptimisticMessage,
    updateOptimisticMessage: handleMessageUpdate,
    cleanupOptimisticMessages,
    clearOptimisticMessages: resetPendingMessages,
    optimisticMessageIds: Array.from(pendingMessageSet.current),
  };
}
