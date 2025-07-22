// src/app/hooks/useZonesNuclear.ts - IMPROVED LOADING COORDINATION
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useUnifiedApp } from "../contexts/UnifiedAppContext";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import { PersonEndpoint } from "../types/person";
import { Zone } from "../types/zones";

export interface ZoneWithUnreadCount extends Zone {
  unreadCount: number;
  hasUnreadMessages: boolean;
}

interface UseZonesNuclearResult {
  zones: ZoneWithUnreadCount[];
  person: PersonEndpoint;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useZonesNuclear(
  personId: string,
  translationLang: string
): UseZonesNuclearResult {
  const {
    zoneUnreadCounts,
    updateZoneUnreadCount,
    isSocketConnected,
    isHydrated,
  } = useUnifiedApp();
  const personIdNum = parseInt(personId);

  // Track loading states more granularly
  const [hasInitializedCounters, setHasInitializedCounters] = useState(false);

  // ===== PERMANENT ZONE CACHE (No Expiration) =====
  const {
    data,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["zones_permanent", personId, translationLang],
    queryFn: async () => {
      console.log("🏗️ [ZONES_NUCLEAR] Loading zones metadata");

      const response = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      return response.data;
    },

    // ===== AGGRESSIVE CACHING =====
    staleTime: Infinity, // Never stale - zones don't change often
    gcTime: Infinity, // Never garbage collect
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    enabled: !!personId, // Start loading immediately when personId is available
  });

  // ===== INITIALIZE ZONE COUNTERS =====
  useEffect(() => {
    if (!data?.zones || hasInitializedCounters || !isHydrated) return;

    console.log(
      "🔌 [ZONES_NUCLEAR] Initializing",
      data.zones.length,
      "zone counters"
    );

    // Initialize all zone counters to 0 (this doesn't need to block rendering)
    data.zones.forEach((zone: Zone) => {
      updateZoneUnreadCount(zone.zoneId, 0);
    });

    setHasInitializedCounters(true);
  }, [data?.zones, hasInitializedCounters, isHydrated, updateZoneUnreadCount]);

  // ===== COMBINE CACHED ZONES WITH LIVE COUNTERS =====
  const zonesWithUnreadCounts = useMemo<ZoneWithUnreadCount[]>(() => {
    // Show zones immediately when available, even if counters aren't initialized
    if (!data?.zones) return [];

    return data.zones.map((zone: Zone) => {
      const unreadCount = zoneUnreadCounts.get(zone.zoneId) || 0;

      return {
        ...zone,
        unreadCount,
        hasUnreadMessages: unreadCount > 0,
      };
    });
  }, [data?.zones, zoneUnreadCounts]); // Removed hasInitializedCounters dependency

  // ===== SIMPLIFIED LOADING STATE =====
  const isLoading =
    isQueryLoading || // Loading zones data
    (!isHydrated && (data?.zones?.length || 0) > 0); // Hydrating with existing data

  // ===== PERFORMANCE LOGGING =====
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🏗️ [ZONES_NUCLEAR] State:", {
        isHydrated,
        isQueryLoading,
        hasInitializedCounters,
        zonesCount: zonesWithUnreadCounts.length,
        isLoading,
        socketConnected: isSocketConnected,
      });
    }
  }, [
    isHydrated,
    isQueryLoading,
    hasInitializedCounters,
    zonesWithUnreadCounts.length,
    isLoading,
    isSocketConnected,
  ]);

  return {
    zones: zonesWithUnreadCounts,
    person: data?.person?.[0] || ({} as PersonEndpoint),
    isLoading: !!isLoading, // Ensure boolean, never undefined
    error: error ? "Failed to load zones" : null,
    refetch,
  };
}

// ===== NUCLEAR INBOX HOOK =====
export function useInboxNuclear(personId: string, translationLang: string) {
  const { zones, person, isLoading, error } = useZonesNuclear(
    personId,
    translationLang
  );

  // ===== FILTER ZONES WITH UNREAD MESSAGES =====
  const inboxItems = useMemo(() => {
    if (isLoading) return []; // Don't process while loading

    return zones
      .filter((zone) => zone.hasUnreadMessages)
      .map((zone) => ({
        zoneId: zone.zoneId,
        zoneName: zone.name,
        zoneDescription: zone.formattedAddress,
        unreadCount: zone.unreadCount,
        thread: {
          _id: `zone-${zone.zoneId}`,
          thread_status: 1,
          followers: [
            {
              person_id: parseInt(personId),
              following: true,
              last_accessed: new Date().toISOString(),
              _id: `follower-${personId}`,
              firstName: "Gebruiker",
              profilePic: null,
              lastName: "",
            },
          ],
          created_by: parseInt(personId),
          created_on: new Date().toISOString(),
          unread_message: {
            _id: `unread-${zone.zoneId}`,
            text: `${zone.unreadCount} nieuwe berichten in ${zone.name}`,
            attachments: [],
            thread_id: `zone-${zone.zoneId}`,
            lang_id_detected: "nl",
            metadata: { recipients: [] },
            is_deleted: false,
            created_by: 0,
            created_on: new Date().toISOString(),
            updated_on: new Date().toISOString(),
            updated_by: null,
            __v: 0,
            first_message: false,
            firstname: "Systeem",
          },
          dot: zone.unreadCount > 0,
          latest_message: {
            _id: `latest-${zone.zoneId}`,
            text: `${zone.unreadCount} nieuwe berichten`,
            attachments: [],
            thread_id: `zone-${zone.zoneId}`,
            lang_id_detected: "nl",
            metadata: { recipients: [] },
            is_deleted: false,
            created_by: 0,
            created_on: new Date().toISOString(),
            updated_on: new Date().toISOString(),
            updated_by: null,
            __v: 0,
            first_message: false,
            firstname: "Systeem",
          },
          unread_count: zone.unreadCount,
          communication_group: {
            id: null,
            translation_name: {},
            group_name: null,
          },
        },
      }));
  }, [zones, personId, isLoading]);

  const totalUnreadCount = useMemo(() => {
    return inboxItems.reduce((sum, item) => sum + item.unreadCount, 0);
  }, [inboxItems]);

  return {
    inboxData: {
      items: inboxItems,
      totalUnreadCount,
      lastUpdated: new Date().toISOString(),
    },
    isLoading,
    error,
    refetch: () => {}, // Zones are permanently cached
  };
}

// ===== NUCLEAR GLOBAL COUNTER HOOK =====
export function useGlobalUnreadCounterNuclear() {
  const { globalUnreadCount, isUserLoading } = useUnifiedApp();

  return {
    totalUnreadCount: globalUnreadCount,
    isLoading: isUserLoading,
    error: null,
    refetch: () => {}, // Real-time via socket
  };
}
