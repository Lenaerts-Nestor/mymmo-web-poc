// src/app/hooks/useThreadDetails.ts - DEBUG VERSION (DISABLE AUTO-MARK-AS-READ)

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
    if (!isVisible) return false;
    if (!isActiveChatPage) return 60 * 1000;
    if (!isUserActive) return 30 * 1000;
    return POLLING_INTERVALS.CONVERSATIONS;
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
    staleTime: 0,
    gcTime: 1 * 60 * 1000,
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 2,
    retryDelay: 1000,
    enabled: !!threadId && !!personId,
  });

  // 🎯 MARK AS READ FUNCTIONALITY
  const markAsRead = async () => {
    try {
      const personIdNum = parseInt(personId);

      // 🚨 DEBUG: Log before calling threadStatusUpdate
      console.log("🚨 [DEBUG] About to call threadStatusUpdate:", {
        threadId,
        personId: personIdNum,
        endpoint: "/service/mymmo-thread-service/threadStatusUpdate",
      });

      await MyMMOApiThreads.updateThreadStatus({
        threadId,
        personId: personIdNum,
        archiveStatus: false,
      });

      console.log("🚨 [DEBUG] threadStatusUpdate completed successfully");

      // Force refresh thread details after marking as read
      await refetch();

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [THREAD_DETAILS] Thread marked as read:", threadId);
      }
    } catch (error) {
      console.error("🚨 [DEBUG] threadStatusUpdate FAILED:", error);
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

  // 🚨 DEBUG: DISABLE AUTO-MARK AS READ TEMPORARILY
  // Comment out this useEffect to test if auto-mark-as-read is causing the issue
  /*
  useEffect(() => {
    if (isActiveChatPage && isVisible && isUserActive && unreadMessages.length > 0) {
      console.log('🚨 [DEBUG] Auto-mark-as-read would trigger in 2 seconds...');
      const markReadTimer = setTimeout(() => {
        console.log('🚨 [DEBUG] Auto-mark-as-read TRIGGERED - calling markAsRead()');
        markAsRead();
      }, 2000);

      return () => {
        console.log('🚨 [DEBUG] Auto-mark-as-read timer CANCELLED');
        clearTimeout(markReadTimer);
      };
    }
  }, [isActiveChatPage, isVisible, isUserActive, unreadMessages.length]);
  */

  // 🚨 DEBUG: Show warning that auto-mark-as-read is disabled
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && unreadMessages.length > 0) {
      console.log("🚨 [DEBUG] AUTO-MARK-AS-READ IS DISABLED FOR TESTING");
      console.log(
        "🚨 [DEBUG] Thread has",
        unreadMessages.length,
        "unread messages"
      );
      console.log(
        '🚨 [DEBUG] Use the manual "Markeer als gelezen" button to test'
      );
    }
  }, [unreadMessages.length]);

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
