// src/app/hooks/useInbox.ts - PERFORMANCE OPTIMIZED

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { InboxData, UseInboxResult } from "../types/inbox";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";
import { POLLING_INTERVALS } from "../constants/pollings_interval";

export function useInbox(
  personId: string,
  translationLang: string
): UseInboxResult {
  const [isVisible, setIsVisible] = useState(true);

  // 🎯 OPTIMIZED: Page visibility detection for smarter polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);

      // Debug logging voor performance monitoring
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔍 [INBOX] Page visibility changed:",
          !document.hidden ? "VISIBLE" : "HIDDEN"
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["inbox", personId, translationLang],
    queryFn: async (): Promise<InboxData> => {
      const personIdNum = parseInt(personId);

      // Debug logging voor API call monitoring
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [INBOX] API call triggered for person:", personIdNum);
      }

      // Step 1: Get all zones for this person
      const zonesResponse = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      const zones = zonesResponse.data.zones;

      if (zones.length === 0) {
        return {
          items: [],
          totalUnreadCount: 0,
          lastUpdated: new Date().toISOString(),
        };
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

          return {
            zone,
            threads: threadsResponse.data || [],
            error: null,
          };
        } catch (error) {
          console.error(
            `Failed to fetch threads for zone ${zone.zoneId}:`,
            error
          );
          return {
            zone,
            threads: [],
            error: error as Error,
          };
        }
      });

      const threadsResults = await Promise.all(threadsPromises);

      // Check if any zone failed to load
      const failedZones = threadsResults.filter((result) => result.error);
      if (failedZones.length > 0) {
        throw new Error(
          `Failed to load threads for ${
            failedZones.length
          } zone(s): ${failedZones.map((z) => z.zone.name).join(", ")}`
        );
      }

      // Step 3: Filter only threads with unread messages and create inbox items
      const inboxItems = threadsResults
        .flatMap(({ zone, threads }) => {
          const unreadThreads = threads.filter(
            (thread) => thread.unread_count > 0
          );

          return unreadThreads.map((thread) => ({
            zoneId: zone.zoneId,
            zoneName: zone.name,
            zoneDescription: zone.formattedAddress,
            thread,
            unreadCount: thread.unread_count,
          }));
        })
        .sort((a, b) => {
          // Sort by latest message timestamp (newest first)
          return (
            new Date(b.thread.latest_message.created_on).getTime() -
            new Date(a.thread.latest_message.created_on).getTime()
          );
        });

      // Step 4: Calculate total unread count
      const totalUnreadCount = inboxItems.reduce(
        (sum, item) => sum + item.unreadCount,
        0
      );

      // Debug logging voor resultaat monitoring
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [INBOX] Inbox data loaded:", {
          itemsCount: inboxItems.length,
          totalUnreadCount,
        });
      }

      return {
        items: inboxItems,
        totalUnreadCount,
        lastUpdated: new Date().toISOString(),
      };
    },

    // 🎯 OPTIMIZED POLLING CONFIGURATION
    // ⚡ PERFORMANCE: Verhoogd van 30s naar 45s voor minder API load
    staleTime: 0,
    gcTime: 2 * 60 * 1000, // 2 minutes

    // ⚡ PERFORMANCE: Gebruik optimized interval (45s instead of 30s)
    refetchInterval: isVisible ? POLLING_INTERVALS.INBOX : false,

    // 🎯 OPTIMIZED: Geen background polling voor betere performance
    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 1,
    retryDelay: 1000,
    enabled: !!personId,
  });

  const inboxData = data || {
    items: [],
    totalUnreadCount: 0,
    lastUpdated: new Date().toISOString(),
  };

  const errorMessage = error
    ? "Fout bij het laden van inbox. Probeer het opnieuw."
    : null;

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [INBOX] Polling status:", {
        enabled: isVisible,
        interval: isVisible ? POLLING_INTERVALS.INBOX : "DISABLED",
        itemsCount: inboxData.items.length,
        totalUnreadCount: inboxData.totalUnreadCount,
      });
    }
  }, [isVisible, inboxData.items.length, inboxData.totalUnreadCount]);

  return {
    inboxData,
    isLoading,
    error: errorMessage,
    refetch,
  };
}
