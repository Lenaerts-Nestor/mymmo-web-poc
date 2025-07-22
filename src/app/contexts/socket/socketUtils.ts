// src/app/contexts/socket/socketUtils.ts - CLEANED

import io from "socket.io-client";
import { SocketStatus } from "../../types/socket";

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

export function joinSocketRoom(
  socket: ReturnType<typeof io>,
  roomId: string,
  personId: number
) {
  socket.emit("join_socket", {
    roomId,
    userId: personId,
    appName: "Mymmo-mobile-app-v2",
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
