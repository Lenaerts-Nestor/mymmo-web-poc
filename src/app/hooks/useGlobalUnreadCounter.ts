// src/app/hooks/useGlobalUnreadCounter.ts - PERFORMANCE OPTIMIZED

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";
import { POLLING_INTERVALS } from "../constants/pollings_interval";

interface GlobalUnreadCounterResult {
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGlobalUnreadCounter(
  personId: string,
  translationLang: string,
  enablePolling: boolean = true
): GlobalUnreadCounterResult {
  const [isVisible, setIsVisible] = useState(true);

  // 🎯 OPTIMIZED: Enhanced page visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);

      // Debug logging voor performance monitoring
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔍 [GLOBAL_COUNTER] Page visibility changed:",
          !document.hidden ? "VISIBLE" : "HIDDEN"
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["globalUnreadCounter", personId, translationLang],
    queryFn: async (): Promise<number> => {
      const personIdNum = parseInt(personId);

      // Debug logging voor API call monitoring
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔍 [GLOBAL_COUNTER] API call triggered for person:",
          personIdNum
        );
      }

      try {
        // Step 1: Get all zones for this person
        const zonesResponse = await MyMMOApiZone.getZonesByPerson(
          personIdNum,
          personIdNum,
          translationLang
        );

        const zones = zonesResponse.data.zones;

        if (zones.length === 0) {
          return 0;
        }

        // Step 2: Get threads for all zones in parallel
        const threadsPromises = zones.map(async (zone) => {
          try {
            const threadsResponse = await MyMMOApiThreads.getThreads({
              zoneId: zone.zoneId,
              personId: personIdNum,
              type: "active",
              transLangId: translationLang,
            });

            return threadsResponse.data || [];
          } catch (error) {
            console.error(
              `Failed to fetch threads for zone ${zone.zoneId}:`,
              error
            );
            return [];
          }
        });

        const threadsResults = await Promise.all(threadsPromises);

        // Step 3: Calculate total unread count
        const totalUnreadCount = threadsResults
          .flat()
          .reduce((sum, thread) => sum + thread.unread_count, 0);

        // Debug logging voor resultaat monitoring
        if (process.env.NODE_ENV === "development") {
          console.log(
            "🔍 [GLOBAL_COUNTER] Total unread count:",
            totalUnreadCount
          );
        }

        return totalUnreadCount;
      } catch (error) {
        console.error("Global unread counter failed:", error);
        return 0;
      }
    },

    // 🎯 OPTIMIZED POLLING CONFIGURATION
    staleTime: 0,
    gcTime: 60 * 1000, // 1 minute

    // ⚡ PERFORMANCE: Gebruik optimized interval (60s instead of 30s)
    refetchInterval:
      enablePolling && isVisible ? POLLING_INTERVALS.GLOBAL_COUNTER : false,

    // 🎯 OPTIMIZED: Geen background polling voor betere performance
    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 1,
    retryDelay: 2000,
    enabled: !!personId && enablePolling,
  });

  const totalUnreadCount = data || 0;
  const errorMessage = error ? "Fout bij unread counter" : null;

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [GLOBAL_COUNTER] Polling status:", {
        enabled: enablePolling && isVisible,
        interval:
          enablePolling && isVisible
            ? POLLING_INTERVALS.GLOBAL_COUNTER
            : "DISABLED",
        unreadCount: totalUnreadCount,
      });
    }
  }, [enablePolling, isVisible, totalUnreadCount]);

  return {
    totalUnreadCount,
    isLoading,
    error: errorMessage,
    refetch,
  };
}
