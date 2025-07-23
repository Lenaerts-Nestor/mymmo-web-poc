// src/app/hooks/inbox/useSocketInbox.ts - SIMPLIFIED VERSION

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocketContext } from "../../contexts/SocketContext";
import { InboxData, UseInboxResult } from "../../types/inbox";

export function useSocketInbox(
  personId: string,
  translationLang: string
): UseInboxResult {
  const [inboxData, setInboxData] = useState<InboxData>({
    items: [],
    totalUnreadCount: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false); // Start with false
  const [error, setError] = useState<string | null>(null);

  const { onInboxUpdate, offInboxUpdate, userZones } = useSocketContext();

  // Simple thread storage by zone
  const [threadsByZone, setThreadsByZone] = useState<Record<string, any[]>>({});

  // Handle socket updates
  useEffect(() => {
    const handleInboxUpdate = (data: any) => {
      console.log("📬 [INBOX] Socket update:", data);

      // Handle threads data from socket
      if (data.threadsData) {
        const threads = data.threadsData;
        const zoneId = threads[0]?.zone_id;

        if (zoneId && Array.isArray(threads)) {
          console.log(`🔧 FIXED - Processing threads: ${threads.length} for zone: ${zoneId}`);
          console.log(`📬 [INBOX] Updating ${threads.length} threads for zone ${zoneId}`);
          
          setThreadsByZone(prev => ({
            ...prev,
            [zoneId]: threads
          }));

          setIsLoading(false);
        }
      }

      // Update timestamp
      setInboxData(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
      }));
    };

    onInboxUpdate(handleInboxUpdate);
    return () => offInboxUpdate(handleInboxUpdate);
  }, [onInboxUpdate, offInboxUpdate]);

  // Calculate inbox data from threads
  useEffect(() => {
    if (userZones.length === 0) return;

    console.log("📬 [INBOX] Calculating inbox data");

    const inboxItems: any[] = [];
    let totalUnreadCount = 0;

    userZones.forEach((zone) => {
      const zoneThreads = threadsByZone[zone.zoneId] || [];
      const unreadThreads = zoneThreads.filter(thread => thread.unread_count > 0);

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

    // Sort by latest message
    inboxItems.sort((a, b) => {
      const aTime = new Date(a.thread.latest_message?.created_on || 0).getTime();
      const bTime = new Date(b.thread.latest_message?.created_on || 0).getTime();
      return bTime - aTime;
    });

    console.log("📬 [INBOX] Calculated:", inboxItems.length, "items,", totalUnreadCount, "unread");

    setInboxData(prev => ({
      items: inboxItems,
      totalUnreadCount,
      lastUpdated: prev.lastUpdated,
    }));
  }, [threadsByZone, userZones]);

  const refetch = useCallback(() => {
    // Reset data
    setThreadsByZone({});
    setInboxData({
      items: [],
      totalUnreadCount: 0,
      lastUpdated: new Date().toISOString(),
    });
    setError(null);
  }, []);

  return {
    inboxData,
    isLoading,
    error,
    refetch,
  };
}