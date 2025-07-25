// src/app/hooks/useZonesWithUnreadCounts.ts - SIMPLIFIED VERSION

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

  const {
    socket,
    isConnected,
    initializeZones,
    onInboxUpdate,
    offInboxUpdate,
  } = useSocketContext();

  // Simple unread counts storage
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Fetch zones and display immediately
  const fetchZones = useCallback(async () => {
    try {
      setIsLoading(true);

      const personIdNum = parseInt(personId);
      const response = await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );

      const zonesData = response.data.zones;
      const personData = response.data.person[0];

      const zonesWithUnread: ZoneWithUnreadCount[] = zonesData.map((zone) => ({
        ...zone,
        unreadCount: 0,
        hasUnreadMessages: false,
      }));

      setZones(zonesWithUnread);
      setPerson(personData);
      setError(null);
      setIsLoading(false); // Show zones immediately

      if (isConnected) {
        initializeZones(zonesData, translationLang);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load zones");
      setIsLoading(false);
    }
  }, [personId, translationLang, isConnected, initializeZones]);

  // Handle socket updates for unread counts
  useEffect(() => {
    const handleInboxUpdate = (data: any) => {
      if (data.threadsData) {
        const threads = data.threadsData;
        const zoneId = threads[0]?.zone_id;

        if (zoneId && Array.isArray(threads)) {
          const unreadCount = threads.reduce(
            (sum, thread) =>
              sum + (thread.unread_count || thread.unreadCount || 0),
            0
          );

          setUnreadCounts((prev) => ({
            ...prev,
            [zoneId]: unreadCount,
          }));

          setIsLoading(false);
        }
      }

      if (data.type === "new_message" && data.thread_id && data.zone_id) {
        const isOwnMessage = data.message?.created_by === parseInt(personId);

        if (!isOwnMessage) {
          setUnreadCounts((prev) => {
            const newCount = (prev[data.zone_id] || 0) + 1;

            return {
              ...prev,
              [data.zone_id]: newCount,
            };
          });
        }
      }
    };

    onInboxUpdate(handleInboxUpdate);
    return () => offInboxUpdate(handleInboxUpdate);
  }, [onInboxUpdate, offInboxUpdate, personId]);

  // Update zones with unread counts when counts change
  useEffect(() => {
    if (zones.length === 0) return;

    setZones((prevZones) =>
      prevZones.map((zone) => ({
        ...zone,
        unreadCount: unreadCounts[zone.zoneId] || 0,
        hasUnreadMessages: (unreadCounts[zone.zoneId] || 0) > 0,
      }))
    );
  }, [unreadCounts]);

  // Load zones when connected
  useEffect(() => {
    if (isConnected || !socket) {
      fetchZones();
    }
  }, [fetchZones, isConnected, socket]);

  const refetch = useCallback(() => {
    fetchZones();
  }, [fetchZones]);

  return {
    zones,
    person: person || ({} as PersonEndpoint),
    isLoading,
    error,
    refetch,
  };
}
