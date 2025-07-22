// src/app/hooks/chat/useChatMessages.ts - REFACTORED: Clean Chat Messages Hook

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

  // Socket integration
  const {
    isConnected,
    status: socketStatus,
    sendMessage: socketSendMessage,
    onMessageReceived,
    offMessageReceived,
  } = useSocketContext();

  // Room management
  const { joinedRooms } = useSocketRooms({
    threadId,
    zoneId,
    personId: personIdNum,
    autoJoin: true,
  });

  // Optimistic messages
  const {
    createOptimisticMessage,
    updateOptimisticMessage,
    cleanupOptimisticMessages,
  } = useOptimisticMessages();

  // Local state for messages
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [readMessages, setReadMessages] = useState<ThreadMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAccessTime, setLastAccessTime] = useState<Date | null>(null);

  // Real-time message handler
  const handleRealtimeMessage = useCallback(
    (realtimeMessage: RealtimeMessage) => {
      // Only handle messages for this thread
      if (realtimeMessage.thread_id !== threadId) return;

      console.log("💬 Processing real-time message for thread:", threadId);

      // Convert to ThreadMessage format
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

      // Update messages with optimistic handling
      setMessages((prev) => updateOptimisticMessage(prev, newMessage));

      // Auto-mark as read if enabled and message is from another user
      if (autoMarkAsRead && newMessage.created_by !== personIdNum) {
        setTimeout(() => markAsRead(), 1000);
      }
    },
    [threadId, personIdNum, autoMarkAsRead, updateOptimisticMessage]
  );

  // Register real-time message listener
  useEffect(() => {
    onMessageReceived(handleRealtimeMessage);
    return () => offMessageReceived(handleRealtimeMessage);
  }, [handleRealtimeMessage, onMessageReceived, offMessageReceived]);

  // Load initial messages
  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📥 Loading initial messages for thread:", threadId);

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

      // Set last access time for read/unread distinction
      if (read.length > 0) {
        const lastReadMessage = read[read.length - 1];
        setLastAccessTime(new Date(lastReadMessage.created_on));
      }

      console.log("✅ Initial messages loaded:", allMessages.length);
    } catch (err: any) {
      console.error("❌ Failed to load initial messages:", err);
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [threadId, transLangId, personIdNum]);

  // Load initial messages on mount
  useEffect(() => {
    if (threadId && personId) {
      loadInitialMessages();
    }
  }, [threadId, personId, loadInitialMessages]);

  // Send message with optimistic updates
  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim()) return false;

      // Create optimistic message
      const optimisticMessage = createOptimisticMessage(
        text,
        threadId,
        personIdNum
      );
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        // Try socket first
        if (isConnected) {
          console.log("🚀 Sending via socket...");
          const socketSuccess = await socketSendMessage(
            threadId,
            text.trim(),
            personIdNum
          );

          if (socketSuccess) {
            // Socket will handle the real message via real-time events
            return true;
          }
        }

        // Fallback to HTTP API
        console.log("📡 Fallback to HTTP API...");
        await MyMMOApiThreads.saveMessage({
          threadId,
          text: text.trim(),
          createdBy: personIdNum,
          completed: false,
        });

        // Remove optimistic message and refresh
        setMessages((prev) =>
          cleanupOptimisticMessages(prev, optimisticMessage._id)
        );
        await refreshMessages();

        return true;
      } catch (err: any) {
        console.error("❌ Failed to send message:", err);

        // Remove failed optimistic message
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

  // Mark as read
  const markAsRead = useCallback(async () => {
    try {
      await MyMMOApiThreads.updateThreadLastAccess({
        threadId,
        personId: personIdNum,
      });

      // Update local state immediately
      const now = new Date();
      setLastAccessTime(now);
      setReadMessages((prev) => [...prev, ...unreadMessages]);
      setUnreadMessages([]);

      console.log("✅ Marked as read:", threadId);
    } catch (err: any) {
      console.error("❌ Failed to mark as read:", err);
    }
  }, [threadId, personIdNum, unreadMessages]);

  // Refresh messages
  const refreshMessages = useCallback(async () => {
    await loadInitialMessages();
  }, [loadInitialMessages]);

  // Update read/unread status when messages change
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
