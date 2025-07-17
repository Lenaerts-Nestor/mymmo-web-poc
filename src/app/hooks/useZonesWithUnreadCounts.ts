// src/app/hooks/useZonesWithUnreadCounts.ts

import { useQuery } from "@tanstack/react-query";
import { PersonEndpoint } from "@/app/types/person";
import { GetZonesByPersonResponse } from "../types/apiEndpoints";
import { Zone } from "../types/zones";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";

export interface ZoneWithUnreadCount extends Zone {
  unreadCount: number;
  hasUnreadMessages: boolean;
}

interface UseZonesWithUnreadResult {
  zones: ZoneWithUnreadCount[];
  person: PersonEndpoint;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useZonesWithUnreadCounts(
  personId: string,
  translationLang: string
): UseZonesWithUnreadResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["zonesWithUnread", personId, translationLang],
    queryFn: async (): Promise<{
      zones: ZoneWithUnreadCount[];
      person: PersonEndpoint;
    }> => {
      const personIdNum = parseInt(personId);

      // Step 1: Get zones for this person
      const zonesResponse = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      const zones = zonesResponse.data.zones;
      const person = zonesResponse.data.person[0];

      if (zones.length === 0) {
        return {
          zones: [],
          person,
        };
      }

      // Step 2: Get threads for each zone to calculate unread counts
      const zonesWithUnreadPromises = zones.map(async (zone) => {
        try {
          const threadsResponse = await MyMMOApiThreads.getThreads({
            zoneId: zone.zoneId,
            personId: personIdNum,
            type: "active",
            transLangId: translationLang,
          });

          const threads = threadsResponse.data || [];
          const unreadCount = threads.reduce(
            (sum, thread) => sum + thread.unread_count,
            0
          );

          return {
            ...zone,
            unreadCount,
            hasUnreadMessages: unreadCount > 0,
          } as ZoneWithUnreadCount;
        } catch (error) {
          console.error(
            `Failed to fetch threads for zone ${zone.zoneId}:`,
            error
          );

          // Return zone with 0 unread count on error
          return {
            ...zone,
            unreadCount: 0,
            hasUnreadMessages: false,
          } as ZoneWithUnreadCount;
        }
      });

      const zonesWithUnread = await Promise.all(zonesWithUnreadPromises);

      return {
        zones: zonesWithUnread,
        person,
      };
    },

    // Similar refresh strategy as threads
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds - less frequent than threads
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 1,
    retryDelay: 1000,
    enabled: !!personId,
  });

  // Transform data or provide defaults , //! dit is belangrijk de data?.zones is een array , laat het zo, indianse mensen hebben het zo aangemaakt :c

  const zones = data?.zones || [];
  const person = data?.person;
  const errorMessage = error
    ? "Fout bij het laden van zones. Probeer het opnieuw."
    : null;

  if (!person && !isLoading && !error) {
    return {
      zones: [],
      person: {} as PersonEndpoint,
      isLoading: false,
      error: "Persoon niet gevonden",
      refetch,
    };
  }

  return {
    zones,
    person: person!,
    isLoading,
    error: errorMessage,
    refetch,
  };
}
