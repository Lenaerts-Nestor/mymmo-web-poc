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
      if (data.threadsData) {
        const receivedThreads = data.threadsData;
        const dataZoneId = receivedThreads[0]?.zone_id;

        // Handle both zone-based threads and direct message threads
        const isDirectMessage = !dataZoneId;
        const isForCurrentZone = dataZoneId && dataZoneId.toString() === zoneId;

        if (isForCurrentZone || isDirectMessage) {
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
        const messageZoneId = data.zone_id;
        const isOwnMessage = data.message?.created_by === personIdNum;

        // Only update if message is for current zone or check threads dynamically
        const shouldUpdate = messageZoneId?.toString() === zoneId;

        if (!isOwnMessage && shouldUpdate) {
          console.log(
            "📋 [THREADS] New message received, updating thread:",
            threadId,
            "for zone:",
            messageZoneId || "unknown"
          );

          setThreads((prev) => {
            const threadIndex = prev.findIndex((t) => t._id === threadId);
            if (threadIndex !== -1) {
              const newThreads = [...prev];
              newThreads[threadIndex] = {
                ...newThreads[threadIndex],
                unread_count: (newThreads[threadIndex].unread_count || 0) + 1,
                latest_message: data.message,
                dot: true,
              };

              return newThreads;
            }
            return prev;
          });
        }
      }
    };

    // Listen for socket inbox updates
    onInboxUpdate(handleThreadUpdate);

    // Also listen directly to socket for immediate message updates
    if (socket && isConnected) {
      const handleDirectMessage = (data: any) => {
        // Check if message is for current zone
        if (
          data.thread_id &&
          (data.zone_id?.toString() === zoneId || !data.zone_id)
        ) {
          const isOwnMessage = data.created_by === personIdNum;

          if (!isOwnMessage) {
            console.log(
              "📋 [THREADS] Processing direct message for thread:",
              data.thread_id
            );

            setThreads((prev) => {
              const threadIndex = prev.findIndex(
                (t) => t._id === data.thread_id
              );
              if (threadIndex !== -1) {
                const newThreads = [...prev];
                newThreads[threadIndex] = {
                  ...newThreads[threadIndex],
                  unread_count: (newThreads[threadIndex].unread_count || 0) + 1,
                  latest_message: data,
                  dot: true,
                };
                console.log(
                  "📋 [THREADS] Direct update - new unread count:",
                  newThreads[threadIndex].unread_count
                );
                return newThreads;
              }
              return prev;
            });
          }
        }
      };

      socket.on("receive_thread_message", handleDirectMessage);
      socket.on("thread_message_broadcasted", handleDirectMessage);

      return () => {
        offInboxUpdate(handleThreadUpdate);
        socket.off("receive_thread_message", handleDirectMessage);
        socket.off("thread_message_broadcasted", handleDirectMessage);
      };
    }

    return () => offInboxUpdate(handleThreadUpdate);
  }, [onInboxUpdate, offInboxUpdate, zoneId, personIdNum, socket, isConnected]);

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
          //dit is voor het geval dat de socket disconnect en we willen een fallback refresh doen
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

      // Add delay to ensure server has processed any recent messages

      socket.emit("fetch_threads", {
        zoneId: zoneIdNum,
        personId: personIdNum,
        type: "active",
        transLangId: transLangId,
      });
    } else {
      setError("Socket not connected. Cannot refresh threads.");
    }
  }, [
    socket,
    isConnected,
    ensureZoneJoined,
    zoneIdNum,
    personIdNum,
    transLangId,
  ]);

  // Listen for message sent events to refresh thread list
  useEffect(() => {
    const handleMessagesSent = (event: CustomEvent) => {
      const { zoneId: eventZoneId } = event.detail;

      // Only refresh if it's for our zone
      if (eventZoneId === zoneId) {
        console.log(
          "📋 [THREADS] Message sent event received, refreshing threads"
        );
        setTimeout(() => {
          refetch();
        }, 1000);
      }
    };

    window.addEventListener(
      "messagesSent",
      handleMessagesSent as EventListener
    );

    return () => {
      window.removeEventListener(
        "messagesSent",
        handleMessagesSent as EventListener
      );
    };
  }, [zoneId, refetch]);

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
    pollingContext: "socket-only",
  };
}
