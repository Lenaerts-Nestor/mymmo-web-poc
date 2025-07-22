"use client";

import { useState, useEffect, useCallback } from "react";
import { useUnifiedApp } from "../../contexts/UnifiedAppContext";
import {
  UseChatMessagesResult,
  UseChatMessagesOptions,
} from "../../types/chat";
import { ThreadMessage } from "../../services/mymmo-thread-service/apiThreads";
import MyMMOApiThreads from "../../services/mymmo-thread-service/apiThreads";
import { usePendingMessages } from "./usePendingMessages";

export function useChatMessages({
  threadId,
  personId,
  zoneId,
  transLangId,
  autoMarkAsRead = true,
}: UseChatMessagesOptions): UseChatMessagesResult {
  const personIdNum = parseInt(personId);

  const {
    isSocketConnected,
    socketStatus,
    sendMessage: socketSendMessage,
    onMessageReceived,
    offMessageReceived,
  } = useUnifiedApp();

  const {
    createOptimisticMessage,
    updateOptimisticMessage,
    cleanupOptimisticMessages,
  } = usePendingMessages();

  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [readMessages, setReadMessages] = useState<ThreadMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAccessTime, setLastAccessTime] = useState<Date | null>(null);

  const handleRealtimeMessage = useCallback(
    (realtimeMessage: any) => {
      if (realtimeMessage.thread_id !== threadId) return;

      const newMessage: ThreadMessage = {
        _id: realtimeMessage._id,
        text: realtimeMessage.text,
        created_on: realtimeMessage.created_on,
        created_by: realtimeMessage.created_by,
        thread_id: realtimeMessage.thread_id,
        attachments: realtimeMessage.attachments || [],
        lang_id_detected: "",
        metadata: { recipients: [] },
        is_deleted: false,
        updated_on: realtimeMessage.created_on,
        updated_by: null,
        __v: 0,
      };

      setMessages((prev) => updateOptimisticMessage(prev, newMessage));

      if (autoMarkAsRead && newMessage.created_by !== personIdNum) {
        setTimeout(() => markAsRead(), 1000);
      }
    },
    [threadId, personIdNum, autoMarkAsRead, updateOptimisticMessage]
  );

  useEffect(() => {
    onMessageReceived(handleRealtimeMessage);
    return () => offMessageReceived(handleRealtimeMessage);
  }, [handleRealtimeMessage, onMessageReceived, offMessageReceived]);

  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await MyMMOApiThreads.getThreadDetails({
        threadId,
        transLangId,
        personId: personIdNum,
      });

      const { readMessages: read, unreadMessages: unread } = response.data;
      const allMessages = [...read, ...unread].sort(
        (a, b) =>
          new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
      );

      setMessages(allMessages);
      setReadMessages(read);
      setUnreadMessages(unread);

      if (read.length > 0) {
        const lastReadMessage = read[read.length - 1];
        setLastAccessTime(new Date(lastReadMessage.created_on));
      }
    } catch (err: any) {
      console.error("Failed to load initial messages:", err);
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [threadId, transLangId, personIdNum]);

  useEffect(() => {
    if (threadId && personId) {
      loadInitialMessages();
    }
  }, [threadId, personId, loadInitialMessages]);

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim()) return false;

      const optimisticMessage = createOptimisticMessage(
        text,
        threadId,
        personIdNum
      );
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        if (isSocketConnected) {
          const socketSuccess = await socketSendMessage(
            threadId,
            text.trim(),
            personIdNum
          );

          if (socketSuccess) {
            return true;
          }
        }

        await MyMMOApiThreads.saveMessage({
          threadId,
          text: text.trim(),
          createdBy: personIdNum,
          completed: false,
        });

        setMessages((prev) =>
          cleanupOptimisticMessages(prev, optimisticMessage._id)
        );
        await refreshMessages();

        return true;
      } catch (err: any) {
        console.error("Failed to send message:", err);

        setMessages((prev) =>
          cleanupOptimisticMessages(prev, optimisticMessage._id)
        );
        setError(err.message || "Failed to send message");
        return false;
      }
    },
    [
      threadId,
      personIdNum,
      isSocketConnected,
      socketSendMessage,
      createOptimisticMessage,
      cleanupOptimisticMessages,
    ]
  );

  const markAsRead = useCallback(async () => {
    try {
      await MyMMOApiThreads.updateThreadLastAccess({
        threadId,
        personId: personIdNum,
      });

      const now = new Date();
      setLastAccessTime(now);
      setReadMessages((prev) => [...prev, ...unreadMessages]);
      setUnreadMessages([]);
    } catch (err: any) {
      console.error("Failed to mark as read:", err);
    }
  }, [threadId, personIdNum, unreadMessages]);

  const refreshMessages = useCallback(async () => {
    await loadInitialMessages();
  }, [loadInitialMessages]);

  useEffect(() => {
    if (!lastAccessTime) return;

    const read: ThreadMessage[] = [];
    const unread: ThreadMessage[] = [];

    messages.forEach((message) => {
      if (new Date(message.created_on) <= lastAccessTime) {
        read.push(message);
      } else {
        unread.push(message);
      }
    });

    setReadMessages(read);
    setUnreadMessages(unread);
  }, [messages, lastAccessTime]);

  return {
    messages,
    readMessages,
    unreadMessages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages,
    isConnected: isSocketConnected,
    socketStatus,
  };
}
