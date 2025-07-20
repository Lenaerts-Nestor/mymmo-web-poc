// src/app/hooks/useThreadDetails.ts - ENHANCED: Socket.io + React Query Hybrid

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import MyMMOApiThreads, {
  GetThreadDetailsPayload,
  GetThreadDetailsResponse,
  ThreadMessage,
} from "../services/mymmo-thread-service/apiThreads";
import {
  POLLING_INTERVALS,
  getContextualPollingInterval,
  getPollingContext,
} from "../constants/pollings_interval";
import { useSocket } from "./useSocket";

interface UseThreadDetailsResult {
  messages: ThreadMessage[];
  readMessages: ThreadMessage[];
  unreadMessages: ThreadMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  markAsRead: () => Promise<void>;
  // 🆕 NEW: Socket-related functions
  sendMessageViaSocket: (text: string) => Promise<boolean>;
  isSocketConnected: boolean;
  socketStatus: string;
}

export function useThreadDetails(
  threadId: string,
  personId: string,
  transLangId: string,
  isActiveChatPage: boolean = true
): UseThreadDetailsResult {
  const [isVisible, setIsVisible] = useState(true);
  const [isUserActive, setIsUserActive] = useState(true);
  const queryClient = useQueryClient();

  // 🚀 SOCKET INTEGRATION: Initialize socket for this thread
  const {
    isConnected: isSocketConnected,
    status: socketStatus,
    sendSocketMessage,
    lastError: socketError,
  } = useSocket({
    threadId,
    personId: parseInt(personId),
    onMessage: (data) => {
      // Real-time message received - instantly update cache
      console.log("🔥 Real-time message received for thread:", threadId, data);

      // Immediately invalidate and refetch for instant updates
      queryClient.invalidateQueries({
        queryKey: ["threadDetails", threadId, personId, transLangId],
      });
    },
    onError: (error) => {
      console.error("🔴 Socket error in thread details:", error);
    },
  });

  // 🎯 REAL-TIME: Enhanced visibility and activity detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔍 [THREAD_DETAILS] Page visibility:",
          !document.hidden ? "VISIBLE" : "HIDDEN"
        );
      }
    };

    // Track user activity for smart polling
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      setIsUserActive(true);
      clearTimeout(idleTimer);
      // User is idle after 3 minutes in chat
      idleTimer = setTimeout(() => setIsUserActive(false), 3 * 60 * 1000);
    };

    // Activity event listeners
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetIdleTimer);
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initialize
    resetIdleTimer();

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(idleTimer);
    };
  }, []);

  // 🎯 HYBRID POLLING: Reduce polling when socket is connected
  const pollingContext = getPollingContext(
    isVisible,
    isUserActive,
    isActiveChatPage
  );

  // 🚀 OPTIMIZATION: Reduce polling intervals when socket is connected
  let pollingInterval = getContextualPollingInterval(pollingContext);

  // If socket is connected, we can afford to poll much less frequently
  if (isSocketConnected && pollingInterval) {
    // Reduce polling by 90% when socket is active - socket provides real-time updates
    pollingInterval = pollingInterval * 10; // 3s becomes 30s, 30s becomes 5min

    if (process.env.NODE_ENV === "development") {
      console.log(
        "⚡ Socket connected - reducing polling interval to:",
        pollingInterval
      );
    }
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["threadDetails", threadId, personId, transLangId],
    queryFn: async (): Promise<GetThreadDetailsResponse> => {
      const personIdNum = parseInt(personId);

      // Debug logging for API monitoring
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [THREAD_DETAILS] API call triggered:", {
          threadId,
          personId: personIdNum,
          interval: pollingInterval,
          context: pollingContext,
          socketConnected: isSocketConnected,
        });
      }

      return await MyMMOApiThreads.getThreadDetails({
        threadId,
        transLangId,
        personId: personIdNum,
      });
    },

    // 🎯 HYBRID CONFIGURATION: Socket primary, polling as backup
    staleTime: isSocketConnected ? 30 * 1000 : 0, // Longer stale time when socket is active
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 2,
    retryDelay: 1000,
    enabled: !!threadId && !!personId,
  });

  // Extract messages from API response
  const readMessages = data?.data?.readMessages || [];
  const unreadMessages = data?.data?.unreadMessages || [];
  const allMessages = [...readMessages, ...unreadMessages].sort(
    (a, b) =>
      new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
  );

  // 🆕 ENHANCED: Mark as read function with socket awareness
  const markAsRead = useCallback(async () => {
    try {
      const personIdNum = parseInt(personId);
      await MyMMOApiThreads.updateThreadLastAccess({
        threadId,
        personId: personIdNum,
      });

      // Immediately invalidate caches for instant UI update
      queryClient.invalidateQueries({
        queryKey: ["threadDetails", threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["threads"],
      });

      if (process.env.NODE_ENV === "development") {
        console.log("✅ [THREAD_DETAILS] Marked as read:", threadId);
      }
    } catch (error) {
      console.error("❌ [THREAD_DETAILS] Mark as read failed:", error);
    }
  }, [threadId, personId, queryClient]);

  // 🆕 NEW: Send message via socket with fallback to HTTP
  const sendMessageViaSocket = useCallback(
    async (text: string): Promise<boolean> => {
      const personIdNum = parseInt(personId);

      if (isSocketConnected) {
        // Try socket first for instant delivery
        console.log("🚀 Sending message via socket...");
        const socketSuccess = sendSocketMessage({
          threadId,
          text,
          createdBy: personIdNum,
          completed: false,
        });

        if (socketSuccess) {
          // Socket message sent - the response will trigger cache invalidation
          // No need to manually update cache, socket events will handle it
          return true;
        }
      }

      // Fallback to HTTP API if socket fails
      console.log("📡 Fallback: Sending message via HTTP API...");
      try {
        await MyMMOApiThreads.saveMessage({
          threadId,
          text,
          createdBy: personIdNum,
          completed: false,
        });

        // HTTP success - manually invalidate caches
        queryClient.invalidateQueries({
          queryKey: ["threadDetails", threadId],
        });
        queryClient.invalidateQueries({
          queryKey: ["threads"],
        });

        return true;
      } catch (error) {
        console.error("❌ HTTP message send failed:", error);
        return false;
      }
    },
    [threadId, personId, isSocketConnected, sendSocketMessage, queryClient]
  );

  // Auto-mark as read when user opens the chat
  useEffect(() => {
    if (unreadMessages.length > 0 && isActiveChatPage && isVisible) {
      // Auto-mark as read after a short delay to ensure user sees the messages
      const markAsReadTimer = setTimeout(() => {
        markAsRead();
      }, 1000);

      return () => clearTimeout(markAsReadTimer);
    }
  }, [unreadMessages.length, isActiveChatPage, isVisible, markAsRead]);

  const errorMessage =
    error || socketError
      ? "Fout bij het laden van berichten. Probeer het opnieuw."
      : null;

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [THREAD_DETAILS] Status:", {
        threadId,
        context: pollingContext,
        interval: pollingInterval,
        isVisible,
        isUserActive,
        isActiveChatPage,
        messagesCount: allMessages.length,
        unreadCount: unreadMessages.length,
        socketConnected: isSocketConnected,
        socketStatus,
      });
    }
  }, [
    threadId,
    pollingContext,
    pollingInterval,
    isVisible,
    isUserActive,
    isActiveChatPage,
    allMessages.length,
    unreadMessages.length,
    isSocketConnected,
    socketStatus,
  ]);

  return {
    messages: allMessages,
    readMessages,
    unreadMessages,
    isLoading,
    error: errorMessage,
    refetch,
    markAsRead,
    // 🆕 NEW: Socket-enhanced functions
    sendMessageViaSocket,
    isSocketConnected,
    socketStatus,
  };
}
