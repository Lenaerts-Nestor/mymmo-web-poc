// src/app/hooks/useZonesWithUnreadCounts.ts - SOCKET ONLY VERSION

import { useState, useEffect, useCallback } from "react";
import { PersonEndpoint } from "@/app/types/person";
import { Zone } from "@/app/types/zones";
import { useSocketContext } from "../contexts/SocketContext";
import MyMMOApiZone from "../services/mymmo-service/apiZones";

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
  const [zones, setZones] = useState<ZoneWithUnreadCount[]>([]);
  const [person, setPerson] = useState<PersonEndpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFallbackRefresh, setLastFallbackRefresh] = useState<number>(0);

  const {
    socket,
    isConnected,
    status,
    initializeZones,
    onInboxUpdate,
    offInboxUpdate,
    userZones,
  } = useSocketContext();

  // Store for threads by zone (in-memory for unread count calculation)
  const [threadsByZone, setThreadsByZone] = useState<Record<string, any[]>>({});

  // Initial zones fetch (single HTTP call as per requirements)
  const fetchInitialZones = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(
        "🏠 [ZONES_UNREAD] Fetching initial zones for person:",
        personId
      );

      const personIdNum = parseInt(personId);
      const zonesResponse = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      const zonesData = zonesResponse.data.zones;
      const personData = zonesResponse.data.person[0];

      console.log("🏠 [ZONES_UNREAD] Loaded", zonesData.length, "zones");

      setPerson(personData);

      // Initialize zones in socket context (joins rooms + fetches threads)
      initializeZones(zonesData);

      setError(null);
    } catch (err: any) {
      console.error("❌ [ZONES_UNREAD] Failed to load initial zones:", err);
      setError(err.message || "Failed to load initial data");
      setIsLoading(false);
    }
  }, [personId, translationLang, initializeZones]);

  // Handle socket inbox updates for unread count calculation
  useEffect(() => {
    const handleInboxUpdate = (data: any) => {
      console.log("🏠 [ZONES_UNREAD] Processing update:", data);

      // Handle update_groups response (threads for a specific zone)
      if (data.threadsData || data.threads) {
        const threads = data.threadsData || data.threads;
        const zoneId = data.zoneId || threads[0]?.zone_id;

        if (zoneId && Array.isArray(threads)) {
          console.log(
            "🏠 [ZONES_UNREAD] Updating threads for zone:",
            zoneId,
            "count:",
            threads.length
          );

          setThreadsByZone((prev) => ({
            ...prev,
            [zoneId]: threads,
          }));

          // Set loading to false after first zone response
          setIsLoading(false);
        }
      }

      // Handle single thread updates
      if (data.thread_id || data._id) {
        const threadId = data.thread_id || data._id;
        console.log("🏠 [ZONES_UNREAD] Updating single thread:", threadId);

        setThreadsByZone((prev) => {
          const newState = { ...prev };
          // Find and update the thread in the appropriate zone
          Object.keys(newState).forEach((zoneId) => {
            const zoneThreads = newState[zoneId];
            const threadIndex = zoneThreads.findIndex(
              (t) => t._id === threadId
            );
            if (threadIndex !== -1) {
              newState[zoneId] = [...zoneThreads];
              newState[zoneId][threadIndex] = {
                ...newState[zoneId][threadIndex],
                ...data,
              };
            }
          });
          return newState;
        });
      }

      // Handle new message updates (increment unread count)
      if (data.type === "new_message" && data.thread_id) {
        const threadId = data.thread_id;
        const isOwnMessage = data.message?.created_by === parseInt(personId);

        if (!isOwnMessage) {
          console.log(
            "🏠 [ZONES_UNREAD] New message received, incrementing unread for thread:",
            threadId
          );

          setThreadsByZone((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((zoneId) => {
              const zoneThreads = newState[zoneId];
              const threadIndex = zoneThreads.findIndex(
                (t) => t._id === threadId
              );
              if (threadIndex !== -1) {
                newState[zoneId] = [...zoneThreads];
                newState[zoneId][threadIndex] = {
                  ...newState[zoneId][threadIndex],
                  unread_count:
                    (newState[zoneId][threadIndex].unread_count || 0) + 1,
                };
              }
            });
            return newState;
          });
        }
      }
    };

    onInboxUpdate(handleInboxUpdate);
    return () => offInboxUpdate(handleInboxUpdate);
  }, [onInboxUpdate, offInboxUpdate, personId]);

  // Calculate zones with unread counts from threadsByZone and userZones
  useEffect(() => {
    const zonesData = userZones;
    if (zonesData.length === 0 || Object.keys(threadsByZone).length === 0) {
      return;
    }

    console.log("🏠 [ZONES_UNREAD] Calculating zones with unread counts");

    const zonesWithUnread: ZoneWithUnreadCount[] = zonesData.map((zone) => {
      const zoneThreads = threadsByZone[zone.zoneId] || [];
      const unreadCount = zoneThreads.reduce(
        (sum, thread) => sum + (thread.unread_count || 0),
        0
      );

      return {
        ...zone,
        unreadCount,
        hasUnreadMessages: unreadCount > 0,
      };
    });

    console.log(
      "🏠 [ZONES_UNREAD] Calculated",
      zonesWithUnread.length,
      "zones with unread counts"
    );

    setZones(zonesWithUnread);
  }, [threadsByZone, userZones]);

  // Fallback refresh after 30s disconnect (as per requirements)
  useEffect(() => {
    if (!isConnected && status === "disconnected") {
      const timer = setTimeout(() => {
        if (!isConnected && Date.now() - lastFallbackRefresh > 30000) {
          console.log(
            "🔄 [ZONES_UNREAD] Socket disconnected >30s, triggering fallback refresh"
          );
          fetchInitialZones();
          setLastFallbackRefresh(Date.now());
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, status, fetchInitialZones, lastFallbackRefresh]);

  // Initialize when socket connects
  useEffect(() => {
    if (isConnected && userZones.length === 0) {
      fetchInitialZones();
    }
  }, [isConnected, fetchInitialZones, userZones.length]);

  const refetch = useCallback(() => {
    // Trigger socket refresh instead of HTTP polling
    if (socket && isConnected && userZones.length > 0) {
      console.log("🏠 [ZONES_UNREAD] Manual refetch via socket");
      userZones.forEach((zone) => {
        socket.emit("fetch_threads", {
          zoneId: zone.zoneId,
          personId: parseInt(personId),
          type: "active",
          transLangId: translationLang,
        });
      });
    } else {
      // Fallback to full refresh if socket not available
      fetchInitialZones();
    }
  }, [
    socket,
    isConnected,
    userZones,
    personId,
    translationLang,
    fetchInitialZones,
  ]);

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🏠 [ZONES_UNREAD] Status:", {
        socketConnected: isConnected,
        zonesCount: userZones.length,
        threadsLoaded: Object.keys(threadsByZone).length,
        zonesWithUnreadCount: zones.length,
        isLoading,
      });
    }
  }, [isConnected, userZones.length, threadsByZone, zones.length, isLoading]);

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
