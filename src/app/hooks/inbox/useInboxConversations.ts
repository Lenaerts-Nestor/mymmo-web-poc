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

  const { zones, isLoading: zonesLoading, initialize } = useZonesContext();
  const personIdNum = parseInt(personId);

  // Initialize zones context if needed
  useEffect(() => {
    if (personId && transLangId) {
      initialize(personId, transLangId);
    }
  }, [personId, transLangId, initialize]);

  // Fetch threads for all zones that have unread messages
  const fetchUnreadConversations = useCallback(async () => {
    if (fetchingRef.current) return;
    
    console.log("📥 [INBOX] Fetching unread conversations", { 
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
        console.log(`📥 [INBOX] Fetching zone ${zone.zoneId} (${zone.unreadCount} unread)`);
        
        try {
          const response = await MyMMOApiThreads.getThreads({
            zoneId: parseInt(zone.zoneId.toString()),
            personId: personIdNum,
            type: "active",
            transLangId: transLangId,
          });

          // Filter only threads with unread messages and enrich with zone info
          const unreadThreads = response.data
            .filter((thread: Thread) => (thread.unread_count || 0) > 0)
            .map((thread: Thread) => ({
              ...thread,
              zone_id: parseInt(zone.zoneId.toString()),
              zone_name: zone.name,
              zone_address: zone.formattedAddress || zone.street,
            }));

          console.log(`📥 [INBOX] Zone ${zone.zoneId}: ${unreadThreads.length} unread threads`);
          allUnreadConversations.push(...unreadThreads);
        } catch (zoneError) {
          console.error(`📥 [INBOX] Error fetching zone ${zone.zoneId}:`, zoneError);
          // Continue with other zones even if one fails
        }
      }

      setUnreadConversations(allUnreadConversations);
      console.log(`📥 [INBOX] TOTAL: ${allUnreadConversations.length} unread conversations`);
      
    } catch (error) {
      console.error("📥 [INBOX] Error fetching unread conversations:", error);
      setError("Failed to fetch unread conversations");
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [zones, personIdNum, transLangId]);

  // Fetch conversations when zones are ready and have unread counts
  useEffect(() => {
    if (zones.length > 0 && !zonesLoading) {
      const zonesWithUnread = zones.filter(zone => zone.unreadCount > 0);
      console.log("📥 [INBOX] Zones ready, checking for unread", {
        totalZones: zones.length,
        zonesWithUnread: zonesWithUnread.length
      });
      
      // Small delay to ensure socket updates have been processed
      const timeoutId = setTimeout(() => {
        fetchUnreadConversations();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (!zonesLoading && zones.length === 0) {
      // No zones loaded, clear conversations
      setUnreadConversations([]);
      setIsLoading(false);
    }
  }, [zones, zonesLoading, fetchUnreadConversations]);

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
    isLoading: zonesLoading || isLoading,
    error,
    refetch,
    totalUnreadCount,
  };
}