// src/app/hooks/chat/useChatMessages.ts - CLEANED

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useSocketContext,
  RealtimeMessage,
} from "../../contexts/SocketContext";
import { useOptimisticMessages } from "./useOptimisticMessages";
import {
  UseChatMessagesResult,
  UseChatMessagesOptions,
} from "../../types/chat";
import { ThreadMessage } from "../../services/mymmo-thread-service/apiThreads";
import MyMMOApiThreads from "../../services/mymmo-thread-service/apiThreads";
import { useSocketRooms } from "../useSocketRooms";

export function useChatMessages({
  threadId,
  personId,
  zoneId,
  transLangId,
  autoMarkAsRead = true,
}: UseChatMessagesOptions): UseChatMessagesResult {
  const personIdNum = parseInt(personId);

  const {
    isConnected,
    status: socketStatus,
    sendMessage: socketSendMessage,
    onMessageReceived,
    offMessageReceived,
  } = useSocketContext();

  const { joinedRooms } = useSocketRooms({
    threadId,
    zoneId,
    personId: personIdNum,
    autoJoin: true,
  });

  const {
    createOptimisticMessage,
    updateOptimisticMessage,
    cleanupOptimisticMessages,
  } = useOptimisticMessages();

  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [readMessages, setReadMessages] = useState<ThreadMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAccessTime, setLastAccessTime] = useState<Date | null>(null);

  const handleRealtimeMessage = useCallback(
    (realtimeMessage: RealtimeMessage) => {
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
        setTimeout(() => markAsRead(), 2000); // Increased delay to allow unread count updates
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

  // Auto-mark as read when unread messages are loaded
  useEffect(() => {
    if (autoMarkAsRead && unreadMessages.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        markAsRead();
      }, 1500); // Increased delay to allow unread count updates to propagate
      
      return () => clearTimeout(timer);
    }
  }, [autoMarkAsRead, unreadMessages.length, isLoading, markAsRead]);

  const sendMessage = useCallback(
    async (text: string, attachments?: any[]): Promise<boolean> => {
      if (!text.trim() && (!attachments || attachments.length === 0)) return false;

      const optimisticMessage = createOptimisticMessage(
        text,
        threadId,
        personIdNum,
        attachments
      );
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        if (isConnected) {
          const socketSuccess = await socketSendMessage(
            threadId,
            text.trim(),
            personIdNum,
            attachments
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
          attachments,
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
      isConnected,
      socketSendMessage,
      createOptimisticMessage,
      cleanupOptimisticMessages,
    ]
  );

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
    isConnected,
    socketStatus,
  };
}
