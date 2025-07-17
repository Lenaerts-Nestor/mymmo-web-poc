// src/app/hooks/useThreadDetails.ts - REAL-TIME CHAT HOOK

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import MyMMOApiThreads, {
  GetThreadDetailsPayload,
  GetThreadDetailsResponse,
  ThreadMessage,
} from "../services/mymmo-thread-service/apiThreads";
import { POLLING_INTERVALS } from "../constants/pollings_interval";

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
  isActiveChatPage: boolean = true // Context awareness for real-time polling
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
      // User is idle after 3 minutes in chat (longer than threads)
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

  // 🎯 SMART POLLING: Determine optimal polling interval
  const getPollingInterval = (): number | false => {
    if (!isVisible) return false; // Hidden tab = no polling
    if (!isActiveChatPage) return 60 * 1000; // Background chat = 60s
    if (!isUserActive) return 30 * 1000; // Idle user = 30s
    return POLLING_INTERVALS.CONVERSATIONS; // Active chat = 5s (real-time!)
  };

  const pollingInterval = getPollingInterval();

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
          context: isActiveChatPage ? "ACTIVE_CHAT" : "BACKGROUND",
        });
      }

      return await MyMMOApiThreads.getThreadDetails({
        threadId,
        transLangId,
        personId: personIdNum,
      });
    },

    // 🎯 REAL-TIME CONFIGURATION
    staleTime: 0, // Always consider data stale for real-time updates
    gcTime: 1 * 60 * 1000, // 1 minute garbage collection

    // ⚡ PERFORMANCE: Smart polling interval
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false, // No background polling

    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 2, // Retry twice for reliability
    retryDelay: 1000,
    enabled: !!threadId && !!personId,
  });

  // 🎯 MARK AS READ FUNCTIONALITY
  const markAsRead = async () => {
    try {
      const personIdNum = parseInt(personId);
      await MyMMOApiThreads.updateThreadStatus({
        threadId,
        personId: personIdNum,
      });

      // Force refresh thread details after marking as read
      await refetch();

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [THREAD_DETAILS] Thread marked as read:", threadId);
      }
    } catch (error) {
      console.error("Failed to mark thread as read:", error);
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
    isVisible,
    isUserActive,
    isActiveChatPage,
    allMessages.length,
    unreadMessages.length,
  ]);

  // 🎯 AUTO-MARK AS READ: When user views thread with unread messages
  useEffect(() => {
    if (
      isActiveChatPage &&
      isVisible &&
      isUserActive &&
      unreadMessages.length > 0
    ) {
      // Mark as read after 2 seconds of viewing
      const markReadTimer = setTimeout(() => {
        markAsRead();
      }, 2000);

      return () => clearTimeout(markReadTimer);
    }
  }, [isActiveChatPage, isVisible, isUserActive, unreadMessages.length]);

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
