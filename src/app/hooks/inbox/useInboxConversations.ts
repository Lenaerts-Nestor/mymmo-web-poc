"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Thread } from "../../types/threads";
import { useZonesContext } from "../../contexts/ZonesContext";
import MyMMOApiThreads from "../../services/mymmo-thread-service/apiThreads";

interface UseInboxConversationsResult {
  unreadConversations: Thread[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  totalUnreadCount: number;
}

export function useInboxConversations(
  personId: string,
  transLangId: string = "nl"
): UseInboxConversationsResult {
  const [unreadConversations, setUnreadConversations] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const { zones } = useZonesContext();
  const personIdNum = parseInt(personId);

  // Fetch threads for all zones that have unread messages
  const fetchUnreadConversations = useCallback(async () => {
    if (fetchingRef.current) return;
    
    console.log("📥 [INBOX] Fetching unread conversations for all zones", { 
      zonesCount: zones.length,
      zonesWithUnread: zones.filter(zone => zone.unreadCount > 0).length
    });

    // Get zones with unread messages
    const zonesWithUnread = zones.filter(zone => zone.unreadCount > 0);
    
    if (zonesWithUnread.length === 0) {
      console.log("📥 [INBOX] No zones with unread messages");
      setUnreadConversations([]);
      setIsLoading(false);
      return;
    }

    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const allUnreadConversations: Thread[] = [];

      // Fetch threads for each zone with unread messages
      for (const zone of zonesWithUnread) {
        console.log(`📥 [INBOX] Fetching threads for zone ${zone.zoneId} with ${zone.unreadCount} unread`);
        
        try {
          const response = await MyMMOApiThreads.getThreads({
            zoneId: parseInt(zone.zoneId.toString()),
            personId: personIdNum,
            type: "active",
            transLangId: transLangId,
          });

          // Filter only threads with unread messages and add zone_id
          const unreadThreads = response.data
            .filter((thread: Thread) => (thread.unread_count || 0) > 0)
            .map((thread: Thread) => ({
              ...thread,
              zone_id: parseInt(zone.zoneId.toString())
            }));

          console.log(`📥 [INBOX] Found ${unreadThreads.length} unread conversations in zone ${zone.zoneId}`);
          allUnreadConversations.push(...unreadThreads);
        } catch (zoneError) {
          console.error(`📥 [INBOX] Error fetching threads for zone ${zone.zoneId}:`, zoneError);
        }
      }

      setUnreadConversations(allUnreadConversations);
      console.log(`📥 [INBOX] Total unread conversations: ${allUnreadConversations.length}`);
      
    } catch (error) {
      console.error("📥 [INBOX] Error fetching unread conversations:", error);
      setError("Failed to fetch unread conversations");
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [zones, personIdNum, transLangId]);

  // Fetch conversations when zones change
  useEffect(() => {
    if (zones.length > 0) {
      console.log("📥 [INBOX] Zones changed, triggering fetch", zones.length);
      fetchUnreadConversations();
    }
  }, [zones, fetchUnreadConversations]);

  // Calculate total unread count
  const totalUnreadCount = unreadConversations.reduce(
    (sum, conversation) => sum + (conversation.unread_count || 0), 
    0
  );

  const refetch = useCallback(() => {
    console.log("📥 [INBOX] Manual refetch triggered");
    fetchUnreadConversations();
  }, [fetchUnreadConversations]);

  return {
    unreadConversations,
    isLoading,
    error,
    refetch,
    totalUnreadCount,
  };
}