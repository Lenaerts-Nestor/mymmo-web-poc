// src/app/hooks/useChatMessages.ts - REAL-TIME CHAT STATE MANAGEMENT
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocketContext, RealtimeMessage } from "../contexts/SocketContext";
import MyMMOApiThreads, {
  ThreadMessage,
} from "../services/mymmo-thread-service/apiThreads";

interface UseChatMessagesResult {
  messages: ThreadMessage[];
  readMessages: ThreadMessage[];
  unreadMessages: ThreadMessage[];
  isLoading: boolean;
  error: string | null;

  // Message actions
  sendMessage: (text: string) => Promise<boolean>;
  markAsRead: () => Promise<void>;
  refreshMessages: () => Promise<void>;

  // Real-time status
  isConnected: boolean;
  socketStatus: string;
}

interface UseChatMessagesOptions {
  threadId: string;
  personId: string;
  zoneId: string;
  transLangId: string;
  autoMarkAsRead?: boolean;
}

export function useChatMessages({
  threadId,
  personId,
  zoneId,
  transLangId,
  autoMarkAsRead = true,
}: UseChatMessagesOptions): UseChatMessagesResult {
  // Socket integration
  const {
    isConnected,
    status: socketStatus,
    joinThreadRoom,
    leaveThreadRoom,
    sendMessage: socketSendMessage,
    onMessageReceived,
    offMessageReceived,
  } = useSocketContext();

  // Local state for messages (NO React Query for real-time data)
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [readMessages, setReadMessages] = useState<ThreadMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAccessTime, setLastAccessTime] = useState<Date | null>(null);

  // Track optimistic messages to avoid duplicates
  const optimisticMessages = useRef<Set<string>>(new Set());
  const personIdNum = parseInt(personId);

  // 🚀 REAL-TIME MESSAGE HANDLER
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

      // Remove from optimistic if it was an optimistic message
      if (optimisticMessages.current.has(newMessage._id)) {
        optimisticMessages.current.delete(newMessage._id);

        // Update existing optimistic message
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id.startsWith("temp-") && msg.text === newMessage.text
              ? newMessage
              : msg
          )
        );
      } else {
        // Add new message
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((msg) => msg._id === newMessage._id)) {
            return prev;
          }

          // Insert in chronological order
          const newMessages = [...prev, newMessage];
          return newMessages.sort(
            (a, b) =>
              new Date(a.created_on).getTime() -
              new Date(b.created_on).getTime()
          );
        });
      }

      // Auto-mark as read if enabled and message is from another user
      if (autoMarkAsRead && newMessage.created_by !== personIdNum) {
        setTimeout(() => markAsRead(), 1000);
      }
    },
    [threadId, personIdNum, autoMarkAsRead]
  );

  // 🚀 JOIN/LEAVE THREAD ROOM
  useEffect(() => {
    if (isConnected && threadId && zoneId) {
      console.log("🎯 Joining thread room for real-time chat");
      joinThreadRoom(threadId, zoneId);

      return () => {
        console.log("🚪 Leaving thread room");
        leaveThreadRoom(threadId, zoneId);
      };
    }
  }, [isConnected, threadId, zoneId, joinThreadRoom, leaveThreadRoom]);

  // 🚀 REGISTER REAL-TIME MESSAGE LISTENER
  useEffect(() => {
    onMessageReceived(handleRealtimeMessage);

    return () => {
      offMessageReceived(handleRealtimeMessage);
    };
  }, [handleRealtimeMessage, onMessageReceived, offMessageReceived]);

  // 🚀 LOAD INITIAL MESSAGES (React Query for initial load only)
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

  // 🚀 SEND MESSAGE WITH OPTIMISTIC UPDATES
  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim()) return false;

      const optimisticId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: ThreadMessage = {
        _id: optimisticId,
        text: text.trim(),
        created_on: new Date().toISOString(),
        created_by: personIdNum,
        thread_id: threadId,
        attachments: [],
        lang_id_detected: "",
        metadata: { recipients: [] },
        is_deleted: false,
        updated_on: new Date().toISOString(),
        updated_by: null,
        __v: 0,
      };

      // Add optimistic message immediately
      setMessages((prev) => [...prev, optimisticMessage]);
      optimisticMessages.current.add(optimisticId);

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

        // Remove optimistic message and let normal flow handle the real one
        optimisticMessages.current.delete(optimisticId);
        setMessages((prev) => prev.filter((msg) => msg._id !== optimisticId));

        // Refresh to get the real message
        await refreshMessages();

        return true;
      } catch (err: any) {
        console.error("❌ Failed to send message:", err);

        // Remove failed optimistic message
        optimisticMessages.current.delete(optimisticId);
        setMessages((prev) => prev.filter((msg) => msg._id !== optimisticId));

        setError(err.message || "Failed to send message");
        return false;
      }
    },
    [threadId, personIdNum, isConnected, socketSendMessage]
  );

  // 🚀 MARK AS READ
  const markAsRead = useCallback(async () => {
    try {
      await MyMMOApiThreads.updateThreadLastAccess({
        threadId,
        personId: personIdNum,
      });

      // Update local state immediately
      const now = new Date();
      setLastAccessTime(now);

      // Move unread to read
      setReadMessages((prev) => [...prev, ...unreadMessages]);
      setUnreadMessages([]);

      console.log("✅ Marked as read:", threadId);
    } catch (err: any) {
      console.error("❌ Failed to mark as read:", err);
    }
  }, [threadId, personIdNum, unreadMessages]);

  // 🚀 REFRESH MESSAGES (force reload from API)
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
