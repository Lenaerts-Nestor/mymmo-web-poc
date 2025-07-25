// src/app/contexts/socket/socketEventHandlers.ts - MODULAR HANDLERS

import { RealtimeMessage, SocketStatus } from "../../types/socket";
import { setupConnectionHandlers } from "./handlers/connectionHandlers";
import { setupMessageHandlers } from "./handlers/messageHandlers";
import { setupThreadUpdateHandlers } from "./handlers/threadHandlers";
import { setupUnreadCountHandlers } from "./handlers/unreadCountHandlers";

// Re-export individual handlers for backward compatibility
export {
  setupConnectionHandlers,
  setupMessageHandlers,
  setupThreadUpdateHandlers,
};
export { setupUnreadCountHandlers as setupInboxUpdateHandlers }; // Legacy alias

// Updated setupAllSocketHandlers with modular imports
export function setupAllSocketHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  personId: number,
  currentRooms: React.MutableRefObject<Set<string>>,
  setStatus: React.Dispatch<React.SetStateAction<SocketStatus>>,
  setLastError: React.Dispatch<React.SetStateAction<string | null>>,
  reconnectAttempts: React.MutableRefObject<number>,
  messageCallbacks: React.MutableRefObject<
    Set<(message: RealtimeMessage) => void>
  >,
  threadUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>,
  inboxUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>,
  zoneRequestMap: React.MutableRefObject<Map<string, string>> = {
    current: new Map(),
  },
  currentZoneContext: React.MutableRefObject<string | null> = { current: null }
) {
  setupConnectionHandlers(
    socket,
    personId,
    currentRooms,
    setStatus,
    setLastError,
    reconnectAttempts
  );

  const cleanupMessages = setupMessageHandlers(socket, messageCallbacks);
  const cleanupThreads = setupThreadUpdateHandlers(
    socket,
    threadUpdateCallbacks
  );
  const cleanupUnreadCounts = setupUnreadCountHandlers(
    socket,
    inboxUpdateCallbacks,
    zoneRequestMap,
    personId
  );

  socket.on("error", (error: any) => {
    console.error("Socket error:", error.message || "Unknown error");
    setLastError(error.message || "Socket error occurred");
  });

  socket.on("update_groups", (data: any) => {
    // Try to determine zone from thread data or context
    if (data.threadsData && data.threadsData.length > 0) {
      // Check if we can determine zone from existing data
      let zoneId = data.zoneId;

      if (!zoneId && data.threadsData[0]) {
        const firstThread = data.threadsData[0];

        zoneId =
          firstThread.zone_id || firstThread.zoneId || firstThread.comm_zone_id;

        if (!zoneId) {
          zoneId = zoneRequestMap.current.get("current");

          if (!zoneId && zoneRequestMap.current.size > 0) {
            zoneId = Array.from(zoneRequestMap.current.values())[0];
          }
        }
      }

      if (zoneId) {
        const enrichedData = {
          ...data,
          zoneId: zoneId,
          threadsData: data.threadsData.map((thread: any) => ({
            ...thread,
            zone_id: zoneId,
            zoneId: zoneId,
          })),
        };

        inboxUpdateCallbacks.current.forEach((callback) => {
          try {
            callback(enrichedData);
          } catch (error) {
            console.error("Error in unread count callback:", error);
          }
        });

        return;
      }
    }

    inboxUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in unread count callback:", error);
      }
    });
  });

  return () => {
    cleanupMessages();
    cleanupThreads();
    cleanupUnreadCounts();
    socket.off("error");
    socket.off("update_groups");
  };
}
