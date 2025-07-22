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

export function useGlobalUnreadCounterOptimized(
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

  // Initialize zone loading
  useEffect(() => {
    let mounted = true;

    const initializeZones = async () => {
      if (isInitialized || hasLoadedOnce) return; // ← CHANGE THIS

      try {
        // Get zone metadata
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

        // Subscribe to updates
        subscribeToZoneUpdates(personIdNum, translationLang);

        // Load zones progressively
        const zoneIds = zones.map((zone: any) => zone.zoneId);
        await loadZonesProgressively(zoneIds, personIdNum, translationLang);

        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error(
          "🚨 [GLOBAL_COUNTER_OPTIMIZED] Initialization failed:",
          error
        );
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

  // Calculate total from real-time data
  const totalUnreadCount = Array.from(zoneUnreadCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  const refetch = () => {
    setIsInitialized(false); // Trigger re-initialization
  };

  return {
    totalUnreadCount,
    isLoading: !isInitialized || isLoadingZones,
    error: null,
    refetch,
    progress: isLoadingZones ? loadingProgress : undefined,
  };
}
