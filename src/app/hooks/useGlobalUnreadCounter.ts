// src/app/hooks/useGlobalUnreadCounterOptimized.ts

import { useState, useEffect } from "react";
import { useSocketZones } from "../contexts/socket/SocketZoneProvider";
import MyMMOApiZone from "../services/mymmo-service/apiZones";

interface GlobalUnreadCounterResult {
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  progress?: { loaded: number; total: number };
}

export function useGlobalUnreadCounter(
  personId: string,
  translationLang: string
): GlobalUnreadCounterResult {
  const personIdNum = parseInt(personId);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    subscribeToZoneUpdates,
    loadZonesProgressively,
    zoneUnreadCounts,
    isLoadingZones,
    loadingProgress,
    hasLoadedOnce,
  } = useSocketZones();

  useEffect(() => {
    let mounted = true;

    const initializeZones = async () => {
      if (isInitialized || hasLoadedOnce) return;

      try {
        const response = await MyMMOApiZone.getZonesByPerson(
          personIdNum,
          personIdNum,
          translationLang
        );

        if (!mounted) return;

        const zones = response.data.zones || [];
        if (zones.length === 0) {
          setIsInitialized(true);
          return;
        }

        subscribeToZoneUpdates(personIdNum, translationLang);

        const zoneIds = zones.map((zone: any) => zone.zoneId);
        await loadZonesProgressively(zoneIds, personIdNum, translationLang);

        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error(" Initialization failed:", error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeZones();

    return () => {
      mounted = false;
    };
  }, [
    personIdNum,
    translationLang,
    subscribeToZoneUpdates,
    loadZonesProgressively,
    isInitialized,
  ]);

  const totalUnreadCount = Array.from(zoneUnreadCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  const refetch = () => {
    setIsInitialized(false);
  };

  return {
    totalUnreadCount,
    isLoading: !isInitialized || isLoadingZones,
    error: null,
    refetch,
    progress: isLoadingZones ? loadingProgress : undefined,
  };
}
