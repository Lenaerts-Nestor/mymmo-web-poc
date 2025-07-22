// src/app/hooks/useZonesNuclear.ts - SIMPLE FIX
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useUnifiedApp } from "../contexts/UnifiedAppContext";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import { PersonEndpoint } from "../types/person";
import { Zone } from "../types/zones";

export interface ZoneWithUnreadCount extends Zone {
  unreadCount: number;
  hasUnreadMessages: boolean;
}

interface UseZonesResult {
  zones: ZoneWithUnreadCount[];
  person: PersonEndpoint;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useZones(
  personId: string,
  translationLang: string
): UseZonesResult {
  const { zoneUnreadCounts, updateZoneUnreadCount } = useUnifiedApp();
  const personIdNum = parseInt(personId);

  // Simple query - no complex caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["zones_simple", personId, translationLang],
    queryFn: async () => {
      const response = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );
      return response.data;
    },
    enabled: !!personId,
  });

  // Initialize counters when zones load
  useEffect(() => {
    if (data?.zones) {
      data.zones.forEach((zone: Zone) => {
        updateZoneUnreadCount(zone.zoneId, 0);
      });
    }
  }, [data?.zones, updateZoneUnreadCount]);

  // Combine zones with counters
  const zones = useMemo<ZoneWithUnreadCount[]>(() => {
    if (!data?.zones) return [];

    return data.zones.map((zone: Zone) => {
      const unreadCount = zoneUnreadCounts.get(zone.zoneId) || 0;
      return {
        ...zone,
        unreadCount,
        hasUnreadMessages: unreadCount > 0,
      };
    });
  }, [data?.zones, zoneUnreadCounts]);

  return {
    zones,
    person: data?.person?.[0] || ({} as PersonEndpoint),
    isLoading, // Use React Query's loading state directly
    error: error ? "Failed to load zones" : null,
    refetch,
  };
}

// Keep other hooks simple too
export function useInboxNuclear(personId: string, translationLang: string) {
  const { zones, isLoading, error } = useZones(personId, translationLang);

  const inboxItems = zones
    .filter((zone) => zone.hasUnreadMessages)
    .map((zone) => ({
      zoneId: zone.zoneId,
      zoneName: zone.name,
      zoneDescription: zone.formattedAddress,
      unreadCount: zone.unreadCount,
      thread: {
        _id: `zone-${zone.zoneId}`,
        latest_message: {
          _id: `latest-${zone.zoneId}`,
          text: `${zone.unreadCount} nieuwe berichten`,
          created_on: new Date().toISOString(),
        },
      },
    }));

  return {
    inboxData: {
      items: inboxItems,
      totalUnreadCount: inboxItems.reduce(
        (sum, item) => sum + item.unreadCount,
        0
      ),
      lastUpdated: new Date().toISOString(),
    },
    isLoading,
    error,
    refetch: () => {},
  };
}
