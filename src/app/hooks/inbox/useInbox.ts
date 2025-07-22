// src/app/hooks/inbox/useInboxOptimized.ts

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSocketZones } from "../../contexts/socket/SocketZoneProvider";
import { InboxData, UseInboxResult } from "../../types/inbox";
import MyMMOApiZone from "../../services/mymmo-service/apiZones";

export function useInbox(
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

  const { data: zonesData, isLoading: isLoadingZoneMeta } = useQuery({
    queryKey: ["zones_meta", personId, translationLang],
    queryFn: async () => {
      console.log(" Loading zone metadata only");

      const response = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      return response.data;
    },
    //! dit veranderen met constant. voor het moment gaan we het hier zo laten
    staleTime: 5 * 60 * 1000, // 5 minutes (zones don't change often)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: false, // No polling needed
    enabled: !!personId,
  });

  useEffect(() => {
    if (!zonesData?.zones || zonesData.zones.length === 0) return;

    subscribeToZoneUpdates(personIdNum, translationLang);

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

  useEffect(() => {
    if (!zonesData?.zones) return;

    const items = zonesData.zones
      .map((zone: any) => {
        const unreadCount = zoneUnreadCounts.get(zone.zoneId) || 0;

        if (unreadCount === 0) return null;

        return {
          zoneId: zone.zoneId,
          zoneName: zone.name,
          zoneDescription: zone.formattedAddress,
          unreadCount,
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

  const totalUnreadCount = Array.from(zoneUnreadCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  const inboxData: InboxData = {
    items: inboxItems,
    totalUnreadCount,
    lastUpdated: new Date().toISOString(),
  };

  const isLoading =
    isLoadingZoneMeta || (isLoadingZones && zoneUnreadCounts.size === 0);

  if (process.env.NODE_ENV === "development" && isLoadingZones) {
    console.log(
      ` Progress: ${loadingProgress.loaded}/${loadingProgress.total}`
    );
  }

  return {
    inboxData,
    isLoading,
    error: null,
    refetch: () => {
      if (zonesData?.zones) {
        const zoneIds = zonesData.zones.map((zone: any) => zone.zoneId);
        loadZonesProgressively(zoneIds, personIdNum, translationLang);
      }
    },
  };
}
