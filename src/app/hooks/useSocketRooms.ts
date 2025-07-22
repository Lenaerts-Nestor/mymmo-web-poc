// src/app/hooks/useSocketRooms.ts - FIXED SOCKET CONTEXT
"use client";

import { useEffect, useRef } from "react";
import { useUnifiedApp } from "../contexts/UnifiedAppContext"; // FIXED: Use unified context

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
  const { isSocketConnected, joinThreadRoom, leaveThreadRoom } =
    useUnifiedApp(); // FIXED: Use unified context

  const joinedRooms = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!autoJoin || !isSocketConnected || !threadId || !zoneId || !personId) {
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
    isSocketConnected,
    autoJoin,
    joinThreadRoom,
    leaveThreadRoom,
  ]);

  const joinRoom = (roomThreadId: string, roomZoneId: string) => {
    if (!isSocketConnected) return false;

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
    isConnected: isSocketConnected, // FIXED: Use unified context property
    joinedRooms: Array.from(joinedRooms.current),
    joinRoom,
    leaveRoom,
  };
}
