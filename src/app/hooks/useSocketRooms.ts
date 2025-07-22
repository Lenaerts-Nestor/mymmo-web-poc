// src/app/hooks/useSocketRooms.ts - CLEANED

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

  const joinedRooms = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!autoJoin || !isConnected || !threadId || !zoneId || !personId) {
      return;
    }

    const roomKey = `${threadId}-${zoneId}`;
    if (joinedRooms.current.has(roomKey)) {
      return;
    }

    joinThreadRoom(threadId, zoneId);
    joinedRooms.current.add(roomKey);

    return () => {
      if (joinedRooms.current.has(roomKey)) {
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

  const joinRoom = (roomThreadId: string, roomZoneId: string) => {
    if (!isConnected) return false;

    const roomKey = `${roomThreadId}-${roomZoneId}`;
    if (joinedRooms.current.has(roomKey)) return true;

    joinThreadRoom(roomThreadId, roomZoneId);
    joinedRooms.current.add(roomKey);
    return true;
  };

  const leaveRoom = (roomThreadId: string, roomZoneId: string) => {
    const roomKey = `${roomThreadId}-${roomZoneId}`;
    if (!joinedRooms.current.has(roomKey)) return false;

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
