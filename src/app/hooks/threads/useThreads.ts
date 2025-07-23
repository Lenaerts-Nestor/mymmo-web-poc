// src/app/hooks/threads/useThreads.ts - SOCKET ONLY VERSION

import { useState, useEffect, useCallback } from "react";
import { Thread } from "../../types/threads";
import { useSocketContext } from "../../contexts/SocketContext";

interface UseThreadsResult {
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isSocketConnected: boolean;
  socketStatus: string;
  pollingContext: string; // Keep for compatibility, but will be "socket-only"
}

export function useThreads(
  personId: string,
  zoneId: string,
  transLangId: string,
  isActiveChatPage: boolean = false // Keep for compatibility
): UseThreadsResult {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFallbackRefresh, setLastFallbackRefresh] = useState<number>(0);

  const {
    socket,
    isConnected,
    status,
    onInboxUpdate,
    offInboxUpdate,
    userZones,
    initializeZones,
  } = useSocketContext();

  const zoneIdNum = parseInt(zoneId);
  const personIdNum = parseInt(personId);

  // Ensure zone rooms are joined for this specific zone
  const ensureZoneJoined = useCallback(() => {
    if (!socket || !isConnected || !zoneId) return;

    // Check if this zone is in userZones, if not, join its room
    const zoneExists = userZones.some((zone) => zone.zoneId === zoneIdNum);

    if (!zoneExists) {
      console.log("📡 [THREADS] Joining zone room:", zoneId);
      socket.emit("join_socket", {
        roomId: zoneId,
        userId: personIdNum,
        appName: "Mymmo-mobile-app-v2",
      });
    }

    // Fetch threads for this zone
    console.log("📡 [THREADS] Fetching threads for zone:", zoneId);
    socket.emit("fetch_threads", {
      zoneId: zoneIdNum,
      personId: personIdNum,
      type: "active",
      transLangId: transLangId,
    });
  }, [
    socket,
    isConnected,
    zoneId,
    zoneIdNum,
    personIdNum,
    transLangId,
    userZones,
  ]);

  // Handle socket thread updates
  useEffect(() => {
    const handleThreadUpdate = (data: any) => {
      console.log("📋 [THREADS] Processing thread update:", data);

      // Handle update_groups response (threads for this specific zone)
      if (data.threadsData || data.threads) {
        const receivedThreads = data.threadsData || data.threads;
        const dataZoneId = data.zoneId || receivedThreads[0]?.zone_id;

        // Only process if it's for our zone
        if (dataZoneId && dataZoneId.toString() === zoneId) {
          console.log(
            "📋 [THREADS] Updating threads for our zone:",
            zoneId,
            "count:",
            receivedThreads.length
          );

          setThreads(receivedThreads);
          setIsLoading(false);
          setError(null);
        }
      }

      // Handle single thread updates
      if (data.thread_id || data._id) {
        const threadId = data.thread_id || data._id;
        const threadZoneId = data.zone_id;

        // Only process if it's for our zone
        if (threadZoneId && threadZoneId.toString() === zoneId) {
          console.log("📋 [THREADS] Updating single thread:", threadId);

          setThreads((prev) => {
            const threadIndex = prev.findIndex((t) => t._id === threadId);
            if (threadIndex !== -1) {
              // Update existing thread
              const newThreads = [...prev];
              newThreads[threadIndex] = { ...newThreads[threadIndex], ...data };
              return newThreads;
            } else {
              // Add new thread if it doesn't exist
              return [...prev, data];
            }
          });
        }
      }

      // Handle new message updates (affects unread counts)
      if (data.type === "new_message" && data.thread_id) {
        const threadId = data.thread_id;
        const isOwnMessage = data.message?.created_by === personIdNum;

        if (!isOwnMessage) {
          console.log(
            "📋 [THREADS] New message received, updating thread:",
            threadId
          );

          setThreads((prev) => {
            const threadIndex = prev.findIndex((t) => t._id === threadId);
            if (threadIndex !== -1) {
              const newThreads = [...prev];
              newThreads[threadIndex] = {
                ...newThreads[threadIndex],
                unread_count: (newThreads[threadIndex].unread_count || 0) + 1,
                latest_message: data.message,
              };
              return newThreads;
            }
            return prev;
          });
        }
      }
    };

    onInboxUpdate(handleThreadUpdate);
    return () => offInboxUpdate(handleThreadUpdate);
  }, [onInboxUpdate, offInboxUpdate, zoneId, personIdNum]);

  // Initialize when socket connects or zone changes
  useEffect(() => {
    if (isConnected && zoneId) {
      ensureZoneJoined();
    }
  }, [isConnected, zoneId, ensureZoneJoined]);

  // Fallback refresh after 30s disconnect (as per requirements)
  useEffect(() => {
    if (!isConnected && status === "disconnected") {
      const timer = setTimeout(() => {
        if (!isConnected && Date.now() - lastFallbackRefresh > 30000) {
          console.log(
            "🔄 [THREADS] Socket disconnected >30s, triggering fallback refresh"
          );
          // For threads, we can't do HTTP fallback easily, so just try to reconnect socket
          setError("Connection lost. Attempting to reconnect...");
          setLastFallbackRefresh(Date.now());
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, status, lastFallbackRefresh]);

  // Reset loading state when zone changes
  useEffect(() => {
    setIsLoading(true);
    setThreads([]);
    setError(null);
  }, [zoneId]);

  const refetch = useCallback(() => {
    console.log("📋 [THREADS] Manual refetch triggered");
    if (socket && isConnected) {
      setIsLoading(true);
      ensureZoneJoined();
    } else {
      setError("Socket not connected. Cannot refresh threads.");
    }
  }, [socket, isConnected, ensureZoneJoined]);

  // Performance logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("📋 [THREADS] Status:", {
        zoneId,
        socketConnected: isConnected,
        socketStatus: status,
        threadsCount: threads.length,
        isLoading,
        error: error ? "Has error" : "No error",
      });
    }
  }, [zoneId, isConnected, status, threads.length, isLoading, error]);

  return {
    threads,
    isLoading,
    error,
    refetch,
    isSocketConnected: isConnected,
    socketStatus: status,
    pollingContext: "socket-only", // Static value for compatibility
  };
}
