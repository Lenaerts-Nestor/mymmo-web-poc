// src/app/hooks/useGlobalUnreadCounter.ts - SOCKET ONLY VERSION

import { useState, useEffect, useCallback } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import MyMMOApiZone from "../services/mymmo-service/apiZones";

interface GlobalUnreadCounterResult {
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGlobalUnreadCounter(
  personId: string,
  translationLang: string,
  enablePolling: boolean = true // Keep param for compatibility, but ignore
): GlobalUnreadCounterResult {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
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
        "🔍 [GLOBAL_COUNTER] Fetching initial zones for person:",
        personId
      );

      const personIdNum = parseInt(personId);
      const zonesResponse = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      const zones = zonesResponse.data.zones;
      console.log("🔍 [GLOBAL_COUNTER] Loaded", zones.length, "zones");

      // Initialize zones in socket context (joins rooms + fetches threads)
      initializeZones(zones);

      setError(null);
    } catch (err: any) {
      console.error("❌ [GLOBAL_COUNTER] Failed to load initial zones:", err);
      setError(err.message || "Failed to load initial data");
      setIsLoading(false);
    }
  }, [personId, translationLang, initializeZones]);

  // Handle socket inbox updates for unread count calculation
  useEffect(() => {
    const handleInboxUpdate = (data: any) => {
      console.log("🔍 [GLOBAL_COUNTER] Processing update:", data);

      // Handle update_groups response (threads for a specific zone)
      if (data.threadsData || data.threads) {
        const threads = data.threadsData || data.threads;
        const zoneId = data.zoneId || threads[0]?.zone_id;

        if (zoneId && Array.isArray(threads)) {
          console.log(
            "🔍 [GLOBAL_COUNTER] Updating threads for zone:",
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
        console.log("🔍 [GLOBAL_COUNTER] Updating single thread:", threadId);

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
            "🔍 [GLOBAL_COUNTER] New message received, incrementing unread for thread:",
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

  // Calculate total unread count from threadsByZone
  useEffect(() => {
    if (Object.keys(threadsByZone).length === 0) {
      return;
    }

    console.log("🔍 [GLOBAL_COUNTER] Calculating total unread count");

    let totalUnread = 0;

    Object.values(threadsByZone).forEach((zoneThreads) => {
      zoneThreads.forEach((thread) => {
        totalUnread += thread.unread_count || 0;
      });
    });

    console.log("🔍 [GLOBAL_COUNTER] Total unread count:", totalUnread);
    setTotalUnreadCount(totalUnread);
  }, [threadsByZone]);

  // Fallback refresh after 30s disconnect (as per requirements)
  useEffect(() => {
    if (!isConnected && status === "disconnected") {
      const timer = setTimeout(() => {
        if (!isConnected && Date.now() - lastFallbackRefresh > 30000) {
          console.log(
            "🔄 [GLOBAL_COUNTER] Socket disconnected >30s, triggering fallback refresh"
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
      console.log("🔍 [GLOBAL_COUNTER] Manual refetch via socket");
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
      console.log("🔍 [GLOBAL_COUNTER] Status:", {
        socketConnected: isConnected,
        zonesCount: userZones.length,
        threadsLoaded: Object.keys(threadsByZone).length,
        totalUnreadCount,
        isLoading,
      });
    }
  }, [
    isConnected,
    userZones.length,
    threadsByZone,
    totalUnreadCount,
    isLoading,
  ]);

  return {
    totalUnreadCount,
    isLoading,
    error,
    refetch,
  };
}
