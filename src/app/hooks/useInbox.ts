// src/app/hooks/useInbox.ts

import { useQuery } from "@tanstack/react-query";
import { InboxData, UseInboxResult } from "../types/inbox";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";
import { POLLING_INTERVALS } from "../constants/pollings_interval";

export function useInbox(
  personId: string,
  translationLang: string
): UseInboxResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["inbox", personId, translationLang],
    queryFn: async (): Promise<InboxData> => {
      const personIdNum = parseInt(personId);

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

      return {
        items: inboxItems,
        totalUnreadCount,
        lastUpdated: new Date().toISOString(),
      };
    },

    //! dit is voor de snelheid van het aanroepen van de inbox messages, als je wilt dat de inbox messages sneller worden opgehaald, dan moet je deze waardes aanpassen
    //! opletten dat de inbox messages niet te vaak worden opgehaald, want dan krijg je een error van de API

    // Refresh every 10 seconds like threads
    staleTime: 0,
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: POLLING_INTERVALS.INBOX, // 30 seconds
    refetchIntervalInBackground: true,
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

  return {
    inboxData,
    isLoading,
    error: errorMessage,
    refetch,
  };
}
