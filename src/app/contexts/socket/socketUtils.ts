// src/app/contexts/socket/socketUtils.ts - Socket Utilities

import io from "socket.io-client";
import { SocketStatus } from "../../types/socket";

/**
 * Create socket connection with optimized configuration
 */
export function createSocketConnection(socketUrl: string, personId: number) {
  const socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

/**
 * Join socket room with mobile-v2 configuration
 */
export function joinSocketRoom(
  socket: ReturnType<typeof io>,
  roomId: string,
  personId: number
) {
  socket.emit("join_socket", {
    roomId,
    userId: personId,
    appName: "Mymmo-mobile-app-v2", // Critical for backend routing
  });

  console.log(`🏠 Joined room: ${roomId} as mobile-v2 user: ${personId}`);
}

/**
 * Leave socket room
 */
export function leaveSocketRoom(
  socket: ReturnType<typeof io>,
  roomId: string,
  personId: number
) {
  socket.emit("leave_socket", {
    roomId,
    userId: personId,
  });

  console.log(`🚪 Left room: ${roomId}`);
}

/**
 * Get socket status from connection state
 */
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

/**
 * Log socket event in development
 */
export function logSocketEvent(eventName: string, ...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`📡 Socket event: ${eventName}`, args);
  }
}
