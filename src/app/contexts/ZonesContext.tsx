// src/app/contexts/ZonesContext.tsx - Global Zones State Management

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { PersonEndpoint } from "@/app/types/person";
import { Zone } from "@/app/types/zones";
import { useSocketContext } from "./SocketContext";
import MyMMOApiZone from "../services/mymmo-service/apiZones";

export interface ZoneWithUnreadCount extends Zone {
  unreadCount: number;
  hasUnreadMessages: boolean;
}

interface ZonesContextType {
  zones: ZoneWithUnreadCount[];
  person: PersonEndpoint | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  showAllZones: boolean;
  setSearchQuery: (query: string) => void;
  setShowAllZones: (showAll: boolean) => void;
  refetch: () => void;
  initialize: (personId: string, translationLang: string) => void;
}

const ZonesContext = createContext<ZonesContextType | null>(null);

interface ZonesProviderProps {
  children: React.ReactNode;
}

export function ZonesProvider({ children }: ZonesProviderProps) {
  const [zones, setZones] = useState<ZoneWithUnreadCount[]>([]);
  const [person, setPerson] = useState<PersonEndpoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllZones, setShowAllZones] = useState(false);

  // Track initialization state to prevent duplicate fetches
  const initializedRef = useRef<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const {
    socket,
    isConnected,
    initializeZones,
    onInboxUpdate,
    offInboxUpdate,
  } = useSocketContext();

  // Fetch zones only once per personId/translationLang combination
  const fetchZones = useCallback(
    async (personId: string, translationLang: string) => {
      const cacheKey = `${personId}-${translationLang}`;

      // Skip if already initialized for this combination
      if (initializedRef.current === cacheKey && zones.length > 0) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const personIdNum = parseInt(personId);
        const response = await MyMMOApiZone.getZonesByPerson(
          personIdNum,
          personIdNum,
          translationLang
        );

        const zonesData = response.data.zones;
        const personData = response.data.person[0];

        // Show zones immediately with zero unread counts
        const zonesWithUnread: ZoneWithUnreadCount[] = zonesData.map(
          (zone) => ({
            ...zone,
            unreadCount: 0,
            hasUnreadMessages: false,
          })
        );

        setZones(zonesWithUnread);
        setPerson(personData);
        setIsLoading(false);

        // Mark as initialized
        initializedRef.current = cacheKey;

        // Initialize socket connection for real-time updates
        if (isConnected) {
          initializeZones(zonesData, translationLang);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load zones");
        setIsLoading(false);
      }
    },
    [isConnected, initializeZones, zones.length]
  );

  // Handle socket updates for unread counts
  useEffect(() => {
    const handleInboxUpdate = (data: any) => {
      // Handle threads data from socket
      if (data.threadsData) {
        const threads = data.threadsData;
        const zoneId = threads[0]?.zone_id;

        if (zoneId && Array.isArray(threads)) {
          // Calculate unread count for this zone
          const unreadCount = threads.reduce(
            (sum, thread) =>
              sum + (thread.unread_count || thread.unreadCount || 0),
            0
          );

          // Update unread counts
          setUnreadCounts((prev) => ({
            ...prev,
            [zoneId]: unreadCount,
          }));

          setIsLoading(false);
        }
      }

      // Handle new message updates
      if (data.type === "new_message" && data.thread_id && data.zone_id) {
        const personId = initializedRef.current?.split("-")[0];
        const isOwnMessage =
          data.message?.created_by === parseInt(personId || "0");

        if (!isOwnMessage) {
          setUnreadCounts((prev) => ({
            ...prev,
            [data.zone_id]: (prev[data.zone_id] || 0) + 1,
          }));
        }
      }
    };

    onInboxUpdate(handleInboxUpdate);
    return () => offInboxUpdate(handleInboxUpdate);
  }, [onInboxUpdate, offInboxUpdate]);

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

  const initialize = useCallback(
    (personId: string, translationLang: string) => {
      if (isConnected || !socket) {
        fetchZones(personId, translationLang);
      }
    },
    [fetchZones, isConnected, socket]
  );

  const refetch = useCallback(() => {
    // Clear cache and refetch
    const cacheKey = initializedRef.current;
    initializedRef.current = null;
    setZones([]);
    setPerson(null);
    setUnreadCounts({});
    setError(null);

    if (typeof cacheKey === "string") {
      const [personId, translationLang] = cacheKey.split("-");
      fetchZones(personId, translationLang);
    }
  }, [fetchZones]);

  const contextValue: ZonesContextType = {
    zones,
    person,
    isLoading,
    error,
    searchQuery,
    showAllZones,
    setSearchQuery,
    setShowAllZones,
    refetch,
    initialize,
  };

  return (
    <ZonesContext.Provider value={contextValue}>
      {children}
    </ZonesContext.Provider>
  );
}

export function useZonesContext() {
  const context = useContext(ZonesContext);
  if (!context) {
    throw new Error("useZonesContext must be used within a ZonesProvider");
  }
  return context;
}
