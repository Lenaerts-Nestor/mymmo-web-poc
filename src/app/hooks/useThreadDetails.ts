// src/app/hooks/useThreadDetails.ts - FIXED: Auto Mark-as-Read & Real-time Updates

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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

interface UseThreadDetailsResult {
  messages: ThreadMessage[];
  readMessages: ThreadMessage[];
  unreadMessages: ThreadMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  markAsRead: () => Promise<void>;
}

export function useThreadDetails(
  threadId: string,
  personId: string,
  transLangId: string,
  isActiveChatPage: boolean = true
): UseThreadDetailsResult {
  const [isVisible, setIsVisible] = useState(true);
  const [isUserActive, setIsUserActive] = useState(true);

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

  // 🎯 SMART POLLING: Determine optimal polling interval using consistent context
  const pollingContext = getPollingContext(
    isVisible,
    isUserActive,
    isActiveChatPage
  );
  const pollingInterval = getContextualPollingInterval(pollingContext);

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
          context: pollingContext, // 🔧 FIXED: Use consistent context variable
        });
      }

      return await MyMMOApiThreads.getThreadDetails({
        threadId,
        transLangId,
        personId: personIdNum,
      });
    },

    // 🎯 REAL-TIME CONFIGURATION
    staleTime: 0, // Always fresh for active chat
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 2,
    retryDelay: 1000,
    enabled: !!threadId && !!personId,
  });

  // 🔧 FIXED: Mark as read using CORRECT endpoint that updates last_accessed
  const markAsRead = async () => {
    try {
      const personIdNum = parseInt(personId);

      console.log("🔧 [FIXED] Using threadLastAccessUpdate endpoint:", {
        threadId,
        personId: personIdNum,
        endpoint: "/service/mymmo-thread-service/threadLastAccessUpdate",
        note: "This endpoint updates last_accessed for unread counts",
      });

      // 🚀 CORRECT: Use the endpoint that actually updates last_accessed
      await MyMMOApiThreads.updateThreadLastAccess({
        threadId,
        personId: personIdNum,
      });

      console.log("✅ [FIXED] Thread last_accessed updated successfully");

      // Force refresh thread details after marking as read
      await refetch();

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [THREAD_DETAILS] Thread marked as read:", threadId);
      }
    } catch (error) {
      console.error("❌ [ERROR] markAsRead failed:", error);
    }
  };

  // Transform data
  const threadData = data?.data;
  const readMessages = threadData?.readMessages || [];
  const unreadMessages = threadData?.unreadMessages || [];

  // Combine and sort all messages by timestamp
  const allMessages = [...readMessages, ...unreadMessages].sort(
    (a, b) =>
      new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
  );

  const errorMessage = error
    ? "Fout bij het laden van berichten. Probeer het opnieuw."
    : null;

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [THREAD_DETAILS] Polling status:", {
        threadId,
        interval: pollingInterval,
        context: pollingContext, // 🔧 FIXED: Use consistent context
        isVisible,
        isUserActive,
        isActiveChatPage,
        messagesCount: allMessages.length,
        unreadCount: unreadMessages.length,
      });
    }
  }, [
    threadId,
    pollingInterval,
    pollingContext, // 🔧 FIXED: Use context variable in dependency
    isVisible,
    isUserActive,
    isActiveChatPage,
    allMessages.length,
    unreadMessages.length,
  ]);

  // ✅ FIXED: Re-enabled auto-mark-as-read with proper conditions
  useEffect(() => {
    if (
      isActiveChatPage &&
      isVisible &&
      isUserActive &&
      unreadMessages.length > 0 &&
      !isLoading // Don't auto-mark while loading
    ) {
      console.log("✅ [AUTO-MARK-AS-READ] Triggering in 3 seconds...", {
        unreadCount: unreadMessages.length,
        threadId,
      });

      const markReadTimer = setTimeout(() => {
        console.log("✅ [AUTO-MARK-AS-READ] EXECUTING - calling markAsRead()");
        markAsRead();
      }, 3000); // 3 seconds delay to ensure user has seen the messages

      return () => {
        console.log("✅ [AUTO-MARK-AS-READ] Timer cancelled");
        clearTimeout(markReadTimer);
      };
    }
  }, [
    isActiveChatPage,
    isVisible,
    isUserActive,
    unreadMessages.length,
    isLoading,
  ]);

  return {
    messages: allMessages,
    readMessages,
    unreadMessages,
    isLoading,
    error: errorMessage,
    refetch,
    markAsRead,
  };
}
