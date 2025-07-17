// src/app/hooks/useGlobalUnreadCounter.ts

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

  // Handle page visibility for efficient polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["globalUnreadCounter", personId, translationLang],
    queryFn: async (): Promise<number> => {
      const personIdNum = parseInt(personId);

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

        return totalUnreadCount;
      } catch (error) {
        console.error("Global unread counter failed:", error);
        return 0;
      }
    },

    staleTime: 0,
    gcTime: 60 * 1000, // 1 minute
    refetchInterval:
      enablePolling && isVisible ? POLLING_INTERVALS.GLOBAL_COUNTER : false, // 30 seconds when visible
    refetchIntervalInBackground: false, // Don't poll in background
    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 1,
    retryDelay: 2000,
    enabled: !!personId && enablePolling,
  });

  const totalUnreadCount = data || 0;
  const errorMessage = error ? "Fout bij unread counter" : null;

  return {
    totalUnreadCount,
    isLoading,
    error: errorMessage,
    refetch,
  };
}
