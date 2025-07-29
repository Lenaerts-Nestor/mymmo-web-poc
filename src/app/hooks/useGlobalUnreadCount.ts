"use client";

import { useMemo } from "react";
import { useZonesContext } from "../contexts/ZonesContext";

export function useGlobalUnreadCount() {
  const { zones, isLoading, error, refetch } = useZonesContext();

  const totalUnreadCount = useMemo(() => {
    console.log("🔢 [GLOBAL] Calculating total unread count", {
      zonesCount: zones.length,
      unreadCounts: zones.map((z) => ({
        zoneId: z.zoneId,
        count: z.unreadCount,
      })),
    });

    const total = zones.reduce((sum, zone) => sum + zone.unreadCount, 0);
    console.log(`🔢 [GLOBAL] Total unread count: ${total}`);

    return total;
  }, [zones]);

  return {
    totalUnreadCount,
    isLoading,
    error,
    refetch,
  };
}
