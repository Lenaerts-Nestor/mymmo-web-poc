// src/app/hooks/useZonesWithUnreadCountsOptimized.ts

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocketZones } from "../contexts/socket/SocketZoneProvider";
import { PersonEndpoint } from "../types/person";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import { ZoneWithUnreadCount } from "./useZonesNuclear";

interface UseZonesWithUnreadOptimizedResult {
  zones: ZoneWithUnreadCount[];
  person: PersonEndpoint;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useZonesWithUnreadCountsOptimized(
  personId: string,
  translationLang: string
): UseZonesWithUnreadOptimizedResult {
  const personIdNum = parseInt(personId);

  const {
    subscribeToZoneUpdates,
    loadZonesProgressively,
    zoneUnreadCounts,
    isLoadingZones,
  } = useSocketZones();

  // Load zone metadata
  const {
    data,
    isLoading: isLoadingZoneMeta,
    error,
  } = useQuery({
    queryKey: ["zones_with_unread_optimized", personId, translationLang],
    queryFn: async () => {
      const response = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!personId,
  });

  // Initialize progressive loading
  useEffect(() => {
    if (!data?.zones || data.zones.length === 0) return;

    subscribeToZoneUpdates(personIdNum, translationLang);

    const zoneIds = data.zones.map((zone: any) => zone.zoneId);
    loadZonesProgressively(zoneIds, personIdNum, translationLang);
  }, [
    data,
    personIdNum,
    translationLang,
    subscribeToZoneUpdates,
    loadZonesProgressively,
  ]);

  // Build zones with unread counts from real-time data
  const zones: ZoneWithUnreadCount[] = (data?.zones || []).map((zone: any) => ({
    ...zone,
    unreadCount: zoneUnreadCounts.get(zone.zoneId) || 0,
    hasUnreadMessages: (zoneUnreadCounts.get(zone.zoneId) || 0) > 0,
  }));

  return {
    zones,
    person: data?.person?.[0] || ({} as PersonEndpoint),
    isLoading: isLoadingZoneMeta || isLoadingZones,
    error: error ? "Failed to load zones" : null,
    refetch: () => {
      if (data?.zones) {
        const zoneIds = data.zones.map((zone: any) => zone.zoneId);
        loadZonesProgressively(zoneIds, personIdNum, translationLang);
      }
    },
  };
}
