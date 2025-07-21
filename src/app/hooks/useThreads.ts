// src/app/hooks/useThreads.ts - ENHANCED: Socket.io + React Query Hybrid for Thread Lists

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Thread, GetThreadsResponse } from "../types/threads";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";
import { useSocketContext } from "../contexts/SocketContext";
import {
  POLLING_INTERVALS,
  getContextualPollingInterval,
} from "../constants/pollings_interval";

interface UseThreadsResult {
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  // 🆕 NEW: Socket status
  isSocketConnected: boolean;
  socketStatus: string;
}

export function useThreads(
  personId: string,
  zoneId: string,
  transLangId: string,
  isActiveChatPage: boolean = false
): UseThreadsResult {
  const [isVisible, setIsVisible] = useState(true);
  const [isUserActive, setIsUserActive] = useState(true);
  const queryClient = useQueryClient();

  // 🚀 SOCKET INTEGRATION for thread list updates
  const {
    isConnected: isSocketConnected,
    status: socketStatus,
    onThreadUpdate,
    offThreadUpdate,
  } = useSocketContext();

  // 🚀 SOCKET EVENT HANDLER for thread list updates
  useEffect(() => {
    const handleThreadUpdate = (data: any) => {
      console.log("🔥 Thread list update received:", data);

      // Invalidate threads cache for instant UI updates
      queryClient.invalidateQueries({
        queryKey: ["threads", personId, zoneId, transLangId],
      });

      // Also invalidate inbox for unread counter updates
      queryClient.invalidateQueries({
        queryKey: ["inbox"],
      });

      // Invalidate zones for global unread counts
      queryClient.invalidateQueries({
        queryKey: ["zonesWithUnread"],
      });
    };

    // Register socket listener
    onThreadUpdate(handleThreadUpdate);

    // Cleanup
    return () => {
      offThreadUpdate(handleThreadUpdate);
    };
  }, [
    queryClient,
    personId,
    zoneId,
    transLangId,
    onThreadUpdate,
    offThreadUpdate,
  ]);

  // 🎯 OPTIMIZED: Enhanced visibility and activity detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Track user activity (mouse movement, clicks, keyboard)
    const handleUserActivity = () => {
      setIsUserActive(true);
    };

    const handleUserIdle = () => {
      setIsUserActive(false);
    };

    // Reset idle timer on activity
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      setIsUserActive(true);
      // User is idle after 2 minutes of no activity
      idleTimer = setTimeout(handleUserIdle, 2 * 60 * 1000);
    };

    // Event listeners for user activity
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousemove", resetIdleTimer);
    document.addEventListener("mousedown", resetIdleTimer);
    document.addEventListener("keypress", resetIdleTimer);
    document.addEventListener("scroll", resetIdleTimer);
    document.addEventListener("touchstart", resetIdleTimer);

    // Initialize idle timer
    resetIdleTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousemove", resetIdleTimer);
      document.removeEventListener("mousedown", resetIdleTimer);
      document.removeEventListener("keypress", resetIdleTimer);
      document.removeEventListener("scroll", resetIdleTimer);
      document.removeEventListener("touchstart", resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, []);

  // 🎯 SMART POLLING: Determine polling context
  const getPollingContext = (): "active-chat" | "background-chat" | "other" => {
    if (!isVisible) return "other"; // Tab hidden = no polling
    if (!isUserActive) return "background-chat"; // User idle = slow polling
    if (isActiveChatPage) return "active-chat"; // Active chat = fast polling
    return "background-chat"; // Default = slow polling
  };

  const pollingContext = getPollingContext();
  let pollingInterval = getContextualPollingInterval(pollingContext);

  // 🚀 OPTIMIZATION: Reduce polling when socket is connected
  if (isSocketConnected && pollingInterval) {
    // Reduce polling by 80% when socket is active - socket provides real-time updates
    pollingInterval = pollingInterval * 5; // 5s becomes 25s, 60s becomes 5min

    if (process.env.NODE_ENV === "development") {
      console.log(
        "⚡ Socket connected - reducing threads polling interval to:",
        pollingInterval
      );
    }
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["threads", personId, zoneId, transLangId],
    queryFn: async (): Promise<GetThreadsResponse> => {
      const personIdNum = parseInt(personId);
      const zoneIdNum = parseInt(zoneId);

      // Debug logging voor API call monitoring
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [THREADS] API call triggered:", {
          personId: personIdNum,
          zoneId: zoneIdNum,
          context: pollingContext,
          interval: pollingInterval,
          socketConnected: isSocketConnected,
        });
      }

      return await MyMMOApiThreads.getThreads({
        zoneId: zoneIdNum,
        personId: personIdNum,
        type: "active",
        transLangId: transLangId,
      });
    },

    // 🎯 HYBRID POLLING CONFIGURATION
    staleTime: isSocketConnected
      ? isActiveChatPage
        ? 30 * 1000
        : 60 * 1000 // Longer stale time when socket active
      : isActiveChatPage
      ? 0
      : 30 * 1000, // Shorter stale time without socket
    gcTime: 2 * 60 * 1000, // 2 minutes

    // ⚡ PERFORMANCE: Context-aware polling interval (reduced when socket active)
    refetchInterval: pollingInterval,

    // 🎯 OPTIMIZED: No background polling for better performance
    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 1,
    retryDelay: 1000,
    enabled: !!personId && !!zoneId,
  });

  const threads = data?.data || [];
  const errorMessage = error
    ? "Fout bij het laden van threads. Probeer het opnieuw."
    : null;

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [THREADS] Polling status:", {
        context: pollingContext,
        interval: pollingInterval,
        isVisible,
        isUserActive,
        isActiveChatPage,
        threadsCount: threads.length,
        socketConnected: isSocketConnected,
        socketStatus,
      });
    }
  }, [
    pollingContext,
    pollingInterval,
    isVisible,
    isUserActive,
    isActiveChatPage,
    threads.length,
    isSocketConnected,
    socketStatus,
  ]);

  return {
    threads,
    isLoading,
    error: errorMessage,
    refetch,
    // 🆕 NEW: Socket status
    isSocketConnected,
    socketStatus,
  };
}
