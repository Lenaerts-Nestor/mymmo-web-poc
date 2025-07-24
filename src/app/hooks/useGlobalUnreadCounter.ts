// src/app/hooks/useGlobalUnreadCounter.ts - SIMPLIFIED VERSION

import { useState, useEffect, useCallback } from "react";
import { useSocketContext } from "../contexts/SocketContext";

interface GlobalUnreadCounterResult {
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGlobalUnreadCounter(
  personId: string,
  translationLang: string,
  enablePolling: boolean = true
): GlobalUnreadCounterResult {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Start with false - no loading needed
  const [error, setError] = useState<string | null>(null);

  const { onInboxUpdate, offInboxUpdate } = useSocketContext();

  // Simple unread counts per zone
  const [zoneCounts, setZoneCounts] = useState<Record<string, number>>({});

  // Handle socket updates
  useEffect(() => {
    const handleInboxUpdate = (data: any) => {
      // Handle threads data from socket
      if (data.threadsData) {
        const threads = data.threadsData;
        const zoneId = threads[0]?.zone_id;

        if (zoneId && Array.isArray(threads)) {
          // Calculate unread count for this zone
          const unreadCount = threads.reduce(
            (sum, thread) => sum + (thread.unread_count || thread.unreadCount || 0),
            0
          );

          // Update zone counts
          setZoneCounts(prev => ({
            ...prev,
            [zoneId]: unreadCount
          }));

          setIsLoading(false);
        }
      }

      // Handle new message updates with immediate update
      if (data.type === "new_message" && data.thread_id && data.zone_id) {
        const isOwnMessage = data.message?.created_by === parseInt(personId);
        
        if (!isOwnMessage) {
          console.log("📬 [UNREAD] New message received, updating count for zone:", data.zone_id);
          setZoneCounts(prev => {
            const newCount = (prev[data.zone_id] || 0) + 1;
            console.log("📬 [UNREAD] Zone", data.zone_id, "count updated to:", newCount);
            return {
              ...prev,
              [data.zone_id]: newCount
            };
          });
        }
      }
    };

    onInboxUpdate(handleInboxUpdate);
    return () => offInboxUpdate(handleInboxUpdate);
  }, [onInboxUpdate, offInboxUpdate, personId]);

  // Calculate total from zone counts
  useEffect(() => {
    const total = Object.values(zoneCounts).reduce((sum, count) => sum + count, 0);
    setTotalUnreadCount(total);
  }, [zoneCounts]);

  const refetch = useCallback(() => {
    // Reset counts and let socket data refresh
    setZoneCounts({});
    setTotalUnreadCount(0);
    setError(null);
  }, []);

  return {
    totalUnreadCount,
    isLoading,
    error,
    refetch,
  };
}