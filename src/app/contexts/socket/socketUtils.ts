// src/app/contexts/socket/socketUtils.ts - CLEANED

import io from "socket.io-client";
import { SocketStatus } from "../../types/socket";

export function createSocketConnection(socketUrl: string, personId: number) {
  const socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    forceNew: true,
  });

  // Add heartbeat to keep connection alive
  socket.on("connect", () => {
    console.log("🔌 Socket connected, starting heartbeat");
    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
      } else {
        clearInterval(heartbeat);
      }
    }, 30000); // Ping every 30 seconds

    socket.on("disconnect", () => {
      clearInterval(heartbeat);
    });
  });

  return socket;
}

export function joinSocketRoom(
  socket: ReturnType<typeof io>,
  roomId: string,
  personId: number
) {
  // Join as new version (zone-based)
  socket.emit("join_socket", {
    roomId,
    userId: personId,
    personId: personId,
    appName: "Mymmo-mobile-app-v2",
  });

  // ALSO join as old version for compatibility with phone messages
  socket.emit("join_socket", {
    roomId: personId.toString(), // Personal room
    userId: personId,
    personId: personId,
    // No appName = old version
  });
}

export function leaveSocketRoom(
  socket: ReturnType<typeof io>,
  roomId: string,
  personId: number
) {
  socket.emit("leave_socket", {
    roomId,
    userId: personId,
  });
}

export function getSocketStatus(
  connected: boolean,
  connecting: boolean,
  error: boolean
): SocketStatus {
  if (error) return "error";
  if (connecting) return "connecting";
  if (connected) return "connected";
  return "disconnected";
}
