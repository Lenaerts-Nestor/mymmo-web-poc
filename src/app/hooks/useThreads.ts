// src/app/hooks/useThreads.ts - CONTEXT-AWARE PERFORMANCE OPTIMIZED

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Thread, GetThreadsResponse } from "../types/threads";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";
import {
  POLLING_INTERVALS,
  getContextualPollingInterval,
} from "../constants/pollings_interval";

interface UseThreadsResult {
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useThreads(
  personId: string,
  zoneId: string,
  transLangId: string,
  isActiveChatPage: boolean = false // 🎯 NEW: Context awareness
): UseThreadsResult {
  const [isVisible, setIsVisible] = useState(true);
  const [isUserActive, setIsUserActive] = useState(true);

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
  const pollingInterval = getContextualPollingInterval(pollingContext);

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
        });
      }

      return await MyMMOApiThreads.getThreads({
        zoneId: zoneIdNum,
        personId: personIdNum,
        type: "active",
        transLangId: transLangId,
      });
    },

    // 🎯 OPTIMIZED POLLING CONFIGURATION
    staleTime: isActiveChatPage ? 0 : 30 * 1000, // Active chat = always fresh, background = 30s stale
    gcTime: 2 * 60 * 1000, // 2 minutes

    // ⚡ PERFORMANCE: Context-aware polling interval
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
      });
    }
  }, [
    pollingContext,
    pollingInterval,
    isVisible,
    isUserActive,
    isActiveChatPage,
    threads.length,
  ]);

  return {
    threads,
    isLoading,
    error: errorMessage,
    refetch,
  };
}
