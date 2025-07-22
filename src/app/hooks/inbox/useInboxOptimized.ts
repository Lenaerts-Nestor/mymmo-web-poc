// src/app/hooks/inbox/useInboxOptimized.ts

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSocketZones } from "../../contexts/socket/SocketZoneProvider";
import { InboxData, UseInboxResult } from "../../types/inbox";
import MyMMOApiZone from "../../services/mymmo-service/apiZones";

export function useInboxOptimized(
  personId: string,
  translationLang: string
): UseInboxResult {
  const personIdNum = parseInt(personId);
  const [inboxItems, setInboxItems] = useState<any[]>([]);

  const {
    subscribeToZoneUpdates,
    loadZonesProgressively,
    zoneUnreadCounts,
    isLoadingZones,
    loadingProgress,
  } = useSocketZones();

  // 🚀 STEP 1: Load zone metadata (FAST - no thread data)
  const { data: zonesData, isLoading: isLoadingZoneMeta } = useQuery({
    queryKey: ["zones_meta", personId, translationLang],
    queryFn: async () => {
      console.log("🏃‍♂️ [INBOX_OPTIMIZED] Loading zone metadata only");

      const response = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (zones don't change often)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: false, // No polling needed
    enabled: !!personId,
  });

  // 🚀 STEP 2: Progressive loading via Socket.IO
  useEffect(() => {
    if (!zonesData?.zones || zonesData.zones.length === 0) return;

    // Subscribe to real-time updates
    subscribeToZoneUpdates(personIdNum, translationLang);

    // Start progressive loading
    const zoneIds = zonesData.zones.map((zone: any) => zone.zoneId);
    loadZonesProgressively(zoneIds, personIdNum, translationLang);

    console.log(
      "📡 [INBOX_OPTIMIZED] Started progressive loading for",
      zoneIds.length,
      "zones"
    );
  }, [
    zonesData,
    personIdNum,
    translationLang,
    subscribeToZoneUpdates,
    loadZonesProgressively,
  ]);

  // 🎯 STEP 3: Build inbox from real-time data
  useEffect(() => {
    if (!zonesData?.zones) return;

    const items = zonesData.zones
      .map((zone: any) => {
        const unreadCount = zoneUnreadCounts.get(zone.zoneId) || 0;

        if (unreadCount === 0) return null; // Skip zones without unread messages

        return {
          zoneId: zone.zoneId,
          zoneName: zone.name,
          zoneDescription: zone.formattedAddress,
          unreadCount,
          // We'll add thread data as it loads progressively
          thread: {
            id: `zone-${zone.zoneId}`,
            latest_message: {
              text: "Loading...",
              created_on: new Date().toISOString(),
            },
          },
        };
      })
      .filter(Boolean);

    setInboxItems(items);
  }, [zonesData, zoneUnreadCounts]);

  // Calculate totals
  const totalUnreadCount = Array.from(zoneUnreadCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  const inboxData: InboxData = {
    items: inboxItems,
    totalUnreadCount,
    lastUpdated: new Date().toISOString(),
  };

  // Loading states
  const isLoading =
    isLoadingZoneMeta || (isLoadingZones && zoneUnreadCounts.size === 0);

  // Show progress in development
  if (process.env.NODE_ENV === "development" && isLoadingZones) {
    console.log(
      `📊 [INBOX_OPTIMIZED] Progress: ${loadingProgress.loaded}/${loadingProgress.total}`
    );
  }

  return {
    inboxData,
    isLoading,
    error: null,
    refetch: () => {
      // Trigger fresh zone loading
      if (zonesData?.zones) {
        const zoneIds = zonesData.zones.map((zone: any) => zone.zoneId);
        loadZonesProgressively(zoneIds, personIdNum, translationLang);
      }
    },
  };
}
