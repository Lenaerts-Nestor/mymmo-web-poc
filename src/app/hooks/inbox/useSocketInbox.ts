// src/app/hooks/inbox/useSocketInbox.ts - EXAMPLE IMPLEMENTATION

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocketContext } from "../../contexts/SocketContext";
import { InboxData, UseInboxResult } from "../../types/inbox";
import MyMMOApiZone from "../../services/mymmo-service/apiZones";

export function useSocketInbox(
  personId: string,
  translationLang: string
): UseInboxResult {
  const [inboxData, setInboxData] = useState<InboxData>({
    items: [],
    totalUnreadCount: 0,
    lastUpdated: new Date().toISOString(),
  });
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

  // Store for threads by zone (in-memory as per requirements)
  const [threadsByZone, setThreadsByZone] = useState<Record<string, any[]>>({});

  // Initial zones fetch (single HTTP call as per requirements)
  const fetchInitialZones = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("📡 Fetching initial zones for person:", personId);

      const personIdNum = parseInt(personId);
      const zonesResponse = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      const zones = zonesResponse.data.zones;
      console.log("📍 Loaded", zones.length, "zones");

      // Initialize zones in socket context (joins rooms + fetches threads)
      initializeZones(zones);

      setError(null);
    } catch (err: any) {
      console.error("❌ Failed to load initial zones:", err);
      setError(err.message || "Failed to load initial data");
      setIsLoading(false);
    }
  }, [personId, translationLang, initializeZones]);

  // Handle socket inbox updates
  useEffect(() => {
    const handleInboxUpdate = (data: any) => {
      console.log("📬 Processing inbox update:", data);

      // Handle update_groups response (threads for a specific zone)
      if (data.threadsData || data.threads) {
        const threads = data.threadsData || data.threads;
        const zoneId = data.zoneId || threads[0]?.zone_id;

        if (zoneId && Array.isArray(threads)) {
          console.log(
            "📋 Updating threads for zone:",
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
        console.log("📝 Updating single thread:", threadId);

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

      // Update last updated time
      setInboxData((prev) => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
      }));
    };

    onInboxUpdate(handleInboxUpdate);
    return () => offInboxUpdate(handleInboxUpdate);
  }, [onInboxUpdate, offInboxUpdate]);

  // Calculate inbox data from threadsByZone
  useEffect(() => {
    const zones = userZones;
    if (zones.length === 0 || Object.keys(threadsByZone).length === 0) {
      return;
    }

    console.log("🧮 Calculating inbox data from threads");

    const inboxItems: {
      zoneId: any;
      zoneName: any;
      zoneDescription: any;
      thread: any;
      unreadCount: any;
    }[] = [];
    let totalUnreadCount = 0;

    zones.forEach((zone) => {
      const zoneThreads = threadsByZone[zone.zoneId] || [];
      const unreadThreads = zoneThreads.filter(
        (thread) => thread.unread_count > 0
      );

      unreadThreads.forEach((thread) => {
        totalUnreadCount += thread.unread_count;
        inboxItems.push({
          zoneId: zone.zoneId,
          zoneName: zone.name,
          zoneDescription: zone.formattedAddress,
          thread,
          unreadCount: thread.unread_count,
        });
      });
    });

    // Sort by latest message timestamp
    inboxItems.sort(
      (a, b) =>
        new Date(b.thread.latest_message.created_on).getTime() -
        new Date(a.thread.latest_message.created_on).getTime()
    );

    console.log(
      "📊 Calculated inbox:",
      inboxItems.length,
      "items,",
      totalUnreadCount,
      "unread"
    );

    setInboxData((prev) => ({
      items: inboxItems,
      totalUnreadCount,
      lastUpdated: prev.lastUpdated, // Keep the last update time
    }));
  }, [threadsByZone, userZones]);

  // Fallback refresh after 30s disconnect
  useEffect(() => {
    if (!isConnected && status === "disconnected") {
      const timer = setTimeout(() => {
        if (!isConnected && Date.now() - lastFallbackRefresh > 30000) {
          console.log(
            "🔄 Socket disconnected >30s, triggering fallback refresh"
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
    fetchInitialZones();
  }, [fetchInitialZones]);

  return {
    inboxData,
    isLoading,
    error,
    refetch,
  };
}
