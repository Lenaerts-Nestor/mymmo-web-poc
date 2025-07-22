// src/app/hooks/socket/useSocketRooms.ts - Socket Room Management

"use client";

import { useEffect, useRef } from "react";
import { useSocketContext } from "../contexts/SocketContext";

interface UseSocketRoomsOptions {
  threadId?: string;
  zoneId?: string;
  personId?: number;
  autoJoin?: boolean;
}

export function useSocketRooms({
  threadId,
  zoneId,
  personId,
  autoJoin = true,
}: UseSocketRoomsOptions) {
  const { isConnected, joinThreadRoom, leaveThreadRoom } = useSocketContext();

  // Keep track of joined rooms to avoid duplicate joins
  const joinedRooms = useRef<Set<string>>(new Set());

  // Auto-join rooms when connected
  useEffect(() => {
    if (!autoJoin || !isConnected || !threadId || !zoneId || !personId) {
      return;
    }

    const roomKey = `${threadId}-${zoneId}`;
    if (joinedRooms.current.has(roomKey)) {
      return;
    }

    console.log("🎯 Auto-joining thread room:", threadId, "zone:", zoneId);
    joinThreadRoom(threadId, zoneId);
    joinedRooms.current.add(roomKey);

    // Cleanup: leave room when component unmounts or params change
    return () => {
      if (joinedRooms.current.has(roomKey)) {
        console.log("🚪 Auto-leaving thread room:", threadId, "zone:", zoneId);
        leaveThreadRoom(threadId, zoneId);
        joinedRooms.current.delete(roomKey);
      }
    };
  }, [
    threadId,
    zoneId,
    personId,
    isConnected,
    autoJoin,
    joinThreadRoom,
    leaveThreadRoom,
  ]);

  // Manual join/leave functions
  const joinRoom = (roomThreadId: string, roomZoneId: string) => {
    if (!isConnected) return false;

    const roomKey = `${roomThreadId}-${roomZoneId}`;
    if (joinedRooms.current.has(roomKey)) return true;

    console.log("🎯 Manually joining room:", roomThreadId, "zone:", roomZoneId);
    joinThreadRoom(roomThreadId, roomZoneId);
    joinedRooms.current.add(roomKey);
    return true;
  };

  const leaveRoom = (roomThreadId: string, roomZoneId: string) => {
    const roomKey = `${roomThreadId}-${roomZoneId}`;
    if (!joinedRooms.current.has(roomKey)) return false;

    console.log("🚪 Manually leaving room:", roomThreadId, "zone:", roomZoneId);
    leaveThreadRoom(roomThreadId, roomZoneId);
    joinedRooms.current.delete(roomKey);
    return true;
  };

  return {
    isConnected,
    joinedRooms: Array.from(joinedRooms.current),
    joinRoom,
    leaveRoom,
  };
}
