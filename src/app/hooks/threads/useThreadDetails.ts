// src/app/hooks/threads/useThreadDetails.ts - SOCKET ONLY VERSION

import { useState, useEffect, useCallback } from "react";
import { useSocketContext } from "../../contexts/SocketContext";
import MyMMOApiThreads, {
  ThreadMessage,
} from "../../services/mymmo-thread-service/apiThreads";
import { useSocketRooms } from "../useSocketRooms";

interface UseThreadDetailsResult {
  messages: ThreadMessage[];
  readMessages: ThreadMessage[];
  unreadMessages: ThreadMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  markAsRead: () => Promise<void>;
  sendMessageViaSocket: (text: string) => Promise<boolean>;
  isSocketConnected: boolean;
  socketStatus: string;
  pollingContext: string; // Keep for compatibility
}

export function useThreadDetails(
  threadId: string,
  personId: string,
  zoneId: string,
  transLangId: string,
  isActiveChatPage: boolean = true // Keep for compatibility
): UseThreadDetailsResult {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [readMessages, setReadMessages] = useState<ThreadMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAccessTime, setLastAccessTime] = useState<Date | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const personIdNum = parseInt(personId);

  // Socket integration
  const {
    isConnected,
    status,
    sendMessage: socketSendMessage,
    onMessageReceived,
    offMessageReceived,
    socket,
  } = useSocketContext();

  // Room management for this specific thread
  useSocketRooms({
    threadId,
    zoneId,
    personId: personIdNum,
    autoJoin: true,
  });

  // Initial load via HTTP (single call as per requirements)
  const loadInitialMessages = useCallback(async () => {
    if (initialLoadDone) return; // Prevent multiple initial loads

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        "💬 [THREAD_DETAILS] Loading initial messages for thread:",
        threadId
      );

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

      setInitialLoadDone(true);
      console.log("💬 [THREAD_DETAILS] Loaded", allMessages.length, "messages");
    } catch (err: any) {
      console.error(
        "❌ [THREAD_DETAILS] Failed to load initial messages:",
        err
      );
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [threadId, transLangId, personIdNum, initialLoadDone]);

  // Handle real-time message updates via socket
  useEffect(() => {
    const handleRealtimeMessage = (message: any) => {
      // Only process messages for this thread
      if (message.thread_id !== threadId) return;

      console.log(
        "💬 [THREAD_DETAILS] Received real-time message:",
        message._id
      );

      const newMessage: ThreadMessage = {
        _id: message._id,
        text: message.text,
        created_on: message.created_on,
        created_by: message.created_by,
        thread_id: message.thread_id,
        attachments: message.attachments || [],
        lang_id_detected: message.lang_id_detected || "",
        metadata: { recipients: message.metadata?.recipients || [] },
        is_deleted: false,
        updated_on: message.created_on,
        updated_by: null,
        __v: 0,
      };

      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === newMessage._id)) {
          return prev;
        }
        // Add in chronological order
        const newMessages = [...prev, newMessage];
        return newMessages.sort(
          (a, b) =>
            new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
        );
      });

      // If it's not our message, add to unread
      if (newMessage.created_by !== personIdNum) {
        setUnreadMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    };

    onMessageReceived(handleRealtimeMessage);
    return () => offMessageReceived(handleRealtimeMessage);
  }, [threadId, personIdNum, onMessageReceived, offMessageReceived]);

  // Load initial messages when component mounts
  useEffect(() => {
    if (threadId && personId) {
      loadInitialMessages();
    }
  }, [threadId, personId, loadInitialMessages]);

  // Mark as read function
  const markAsRead = useCallback(async () => {
    try {
      console.log("✅ [THREAD_DETAILS] Marking thread as read:", threadId);

      await MyMMOApiThreads.updateThreadLastAccess({
        threadId,
        personId: personIdNum,
      });

      // Update local state
      const now = new Date();
      setLastAccessTime(now);
      setReadMessages((prev) => [...prev, ...unreadMessages]);
      setUnreadMessages([]);

      console.log("✅ [THREAD_DETAILS] Thread marked as read");
    } catch (error) {
      console.error("❌ [THREAD_DETAILS] Mark as read failed:", error);
    }
  }, [threadId, personIdNum, unreadMessages]);

  // Send message via socket with fallback to HTTP
  const sendMessageViaSocket = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim()) return false;

      console.log("🚀 [THREAD_DETAILS] Sending message via socket...");

      if (isConnected) {
        // Try socket first for instant delivery
        const socketSuccess = await socketSendMessage(
          threadId,
          text,
          personIdNum
        );

        if (socketSuccess) {
          console.log("✅ [THREAD_DETAILS] Message sent via socket");
          return true;
        }
      }

      // Fallback to HTTP API if socket fails
      console.log(
        "📡 [THREAD_DETAILS] Fallback: Sending message via HTTP API..."
      );
      try {
        await MyMMOApiThreads.saveMessage({
          threadId,
          text,
          createdBy: personIdNum,
          completed: false,
        });

        console.log("✅ [THREAD_DETAILS] Message sent via HTTP");
        return true;
      } catch (error) {
        console.error("❌ [THREAD_DETAILS] HTTP message send failed:", error);
        return false;
      }
    },
    [threadId, personIdNum, isConnected, socketSendMessage]
  );

  const refetch = useCallback(async () => {
    console.log("🔄 [THREAD_DETAILS] Manual refetch triggered");

    if (socket && isConnected) {
      // Use socket to refresh thread details
      socket.emit("fetch_thread_messages", {
        threadId,
        personId: personIdNum,
        transLangId,
      });
    } else {
      // Fallback to HTTP refresh
      setInitialLoadDone(false);
      await loadInitialMessages();
    }
  }, [
    socket,
    isConnected,
    threadId,
    personIdNum,
    transLangId,
    loadInitialMessages,
  ]);

  // Update read/unread splits when lastAccessTime changes
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

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("💬 [THREAD_DETAILS] Status:", {
        threadId,
        socketConnected: isConnected,
        socketStatus: status,
        messagesCount: messages.length,
        unreadCount: unreadMessages.length,
        isLoading,
        error: error ? "Has error" : "No error",
      });
    }
  }, [
    threadId,
    isConnected,
    status,
    messages.length,
    unreadMessages.length,
    isLoading,
    error,
  ]);

  return {
    messages,
    readMessages,
    unreadMessages,
    isLoading,
    error,
    refetch,
    markAsRead,
    sendMessageViaSocket,
    isSocketConnected: isConnected,
    socketStatus: status,
    pollingContext: "socket-only", // Static value for compatibility
  };
}
