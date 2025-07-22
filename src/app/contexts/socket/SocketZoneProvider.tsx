// src/app/contexts/socket/SocketZoneProvider.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketContext } from "../SocketContext";

interface ZoneUnreadUpdate {
  zoneId: number;
  unreadCount: number;
  hasUnreadMessages: boolean;
}

interface SocketZoneContextType {
  // Zone subscriptions
  subscribeToZoneUpdates: (personId: number, transLangId: string) => void;
  unsubscribeFromZoneUpdates: () => void;

  // Progressive loading
  loadZonesProgressively: (
    zoneIds: number[],
    personId: number,
    transLangId: string
  ) => void;

  // Real-time state
  zoneUnreadCounts: Map<number, number>;
  isLoadingZones: boolean;
  loadingProgress: { loaded: number; total: number };
  hasLoadedOnce: boolean; // ← ADD THIS LINE
}

const SocketZoneContext = createContext<SocketZoneContextType | null>(null);

export function SocketZoneProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { socket, isConnected } = useSocketContext();
  const queryClient = useQueryClient();

  // State management
  const [zoneUnreadCounts, setZoneUnreadCounts] = useState<Map<number, number>>(
    new Map()
  );
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    loaded: 0,
    total: 0,
  });

  // Refs for cleanup
  const subscribedPersonId = useRef<number | null>(null);
  const loadingController = useRef<AbortController | null>(null);

  // 🎯 ZONE UPDATE SUBSCRIPTION
  const subscribeToZoneUpdates = useCallback(
    (personId: number, transLangId: string) => {
      if (!socket || !isConnected) return;

      // Unsubscribe from previous if exists
      if (subscribedPersonId.current !== null) {
        socket.emit("leave_zone_updates", {
          personId: subscribedPersonId.current,
        });
      }

      // Subscribe to real-time zone updates
      socket.emit("subscribe_zone_updates", { personId, transLangId });
      subscribedPersonId.current = personId;

      console.log(
        "🔔 [ZONE_SOCKET] Subscribed to zone updates for person:",
        personId
      );
    },
    [socket, isConnected]
  );

  const unsubscribeFromZoneUpdates = useCallback(() => {
    if (!socket || subscribedPersonId.current === null) return;

    socket.emit("leave_zone_updates", { personId: subscribedPersonId.current });
    subscribedPersonId.current = null;

    console.log("🔕 [ZONE_SOCKET] Unsubscribed from zone updates");
  }, [socket]);

  // 🚀 PROGRESSIVE ZONE LOADING
  const loadZonesProgressively = useCallback(
    async (zoneIds: number[], personId: number, transLangId: string) => {
      if (!socket || !isConnected || zoneIds.length === 0) return;

      // Cancel any existing loading
      if (loadingController.current) {
        loadingController.current.abort();
      }

      loadingController.current = new AbortController();
      setIsLoadingZones(true);
      setLoadingProgress({ loaded: 0, total: zoneIds.length });

      console.log(
        "📊 [ZONE_SOCKET] Starting progressive loading for",
        zoneIds.length,
        "zones"
      );

      // Load in batches of 10 for optimal performance
      const BATCH_SIZE = 10;
      const batches: number[][] = [];

      for (let i = 0; i < zoneIds.length; i += BATCH_SIZE) {
        batches.push(zoneIds.slice(i, i + BATCH_SIZE));
      }

      try {
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];

          // Check if aborted
          if (loadingController.current?.signal.aborted) break;

          // Load batch via Socket.IO
          await Promise.all(
            batch.map(
              (zoneId) =>
                new Promise<void>((resolve) => {
                  const timeoutId = setTimeout(() => resolve(), 3000); // 3s timeout per zone

                  // Set up one-time listener for this specific zone
                  const handleUpdate = (data: any) => {
                    if (data.zoneId === zoneId) {
                      clearTimeout(timeoutId);
                      socket.off("update_groups", handleUpdate);

                      // Update unread count
                      const unreadCount =
                        data.threadsData?.reduce(
                          (sum: number, thread: any) =>
                            sum + (thread.unread_count || 0),
                          0
                        ) || 0;

                      setZoneUnreadCounts(
                        (prev) => new Map(prev.set(zoneId, unreadCount))
                      );

                      // Invalidate React Query cache for this zone
                      queryClient.setQueryData(
                        ["zone_threads", zoneId, personId, transLangId],
                        data.threadsData || []
                      );

                      resolve();
                    }
                  };

                  socket.on("update_groups", handleUpdate);

                  // Emit fetch request
                  socket.emit("fetch_threads", {
                    zoneId,
                    personId,
                    type: "active",
                    transLangId,
                  });
                })
            )
          );

          // Update progress
          const loaded = (batchIndex + 1) * BATCH_SIZE;
          setLoadingProgress({
            loaded: Math.min(loaded, zoneIds.length),
            total: zoneIds.length,
          });

          // Small delay between batches to prevent overwhelming the server
          if (batchIndex < batches.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        console.error("🚨 [ZONE_SOCKET] Progressive loading failed:", error);
      } finally {
        setIsLoadingZones(false);
        setHasLoadedOnce(true); // ← ADD THIS

        loadingController.current = null;
      }
    },
    [socket, isConnected, queryClient]
  );

  // 🔄 REAL-TIME EVENT HANDLERS
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle real-time zone updates
    const handleZoneUpdate = (data: ZoneUnreadUpdate) => {
      setZoneUnreadCounts(
        (prev) => new Map(prev.set(data.zoneId, data.unreadCount))
      );

      // Update all related React Query caches
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["globalUnreadCounter"] });
      queryClient.invalidateQueries({ queryKey: ["zonesWithUnread"] });
    };

    // Handle thread updates (affects unread counts)
    const handleThreadUpdate = (data: any) => {
      if (data.zoneId && data.unreadCount !== undefined) {
        setZoneUnreadCounts(
          (prev) => new Map(prev.set(data.zoneId, data.unreadCount))
        );
      }
    };

    // Handle new messages (update unread counts)
    const handleNewMessage = (data: any) => {
      if (data.zoneId) {
        setZoneUnreadCounts((prev) => {
          const current = prev.get(data.zoneId) || 0;
          return new Map(prev.set(data.zoneId, current + 1));
        });
      }
    };

    socket.on("zone_unread_update", handleZoneUpdate);
    socket.on("update_new_thread", handleThreadUpdate);
    socket.on("new_message_notification", handleNewMessage);

    return () => {
      socket.off("zone_unread_update", handleZoneUpdate);
      socket.off("update_new_thread", handleThreadUpdate);
      socket.off("new_message_notification", handleNewMessage);
    };
  }, [socket, isConnected, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromZoneUpdates();
      if (loadingController.current) {
        loadingController.current.abort();
      }
    };
  }, [unsubscribeFromZoneUpdates]);

  const contextValue: SocketZoneContextType = {
    subscribeToZoneUpdates,
    unsubscribeFromZoneUpdates,
    loadZonesProgressively,
    zoneUnreadCounts,
    isLoadingZones,
    loadingProgress,
    hasLoadedOnce,
  };

  return (
    <SocketZoneContext.Provider value={contextValue}>
      {children}
    </SocketZoneContext.Provider>
  );
}

export function useSocketZones(): SocketZoneContextType {
  const context = useContext(SocketZoneContext);
  if (!context) {
    throw new Error("useSocketZones must be used within a SocketZoneProvider");
  }
  return context;
}
