// src/app/contexts/socket/SocketProvider.tsx - FIXED WITH MISSING FUNCTIONS

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  SocketContextType,
  SocketProviderProps,
  SocketStatus,
  RealtimeMessage,
} from "../../types/socket";
import {
  createSocketConnection,
  joinSocketRoom,
  leaveSocketRoom,
} from "./socketUtils";
import { setupAllSocketHandlers } from "./socketEventHandlers";

// 🆕 EXTENDED: SocketContextType with inbox functions
interface ExtendedSocketContextType extends SocketContextType {
  // 🆕 NEW: Inbox functions that your hooks expect
  initializeZones: (zones: any[], translationLang?: string) => void;
  onInboxUpdate: (callback: (data: any) => void) => void;
  offInboxUpdate: (callback: (data: any) => void) => void;
  userZones: any[];
}

const SocketContext = createContext<ExtendedSocketContextType | null>(null);

export function SocketProvider({
  children,
  personId,
  enabled = true,
}: SocketProviderProps) {
  const [socket, setSocket] = useState<ReturnType<
    typeof import("socket.io-client").io
  > | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);

  // 🆕 NEW: User zones state
  const [userZones, setUserZones] = useState<any[]>([]);

  const currentRooms = useRef<Set<string>>(new Set());
  const reconnectAttempts = useRef(0);
  
  // 🆕 NEW: Track zone requests to map responses back to zones
  const zoneRequestMap = useRef<Map<string, string>>(new Map());
  const currentZoneContext = useRef<string | null>(null);

  const messageCallbacks = useRef<Set<(message: RealtimeMessage) => void>>(
    new Set()
  );
  const threadUpdateCallbacks = useRef<Set<(data: any) => void>>(new Set());

  // 🆕 NEW: Inbox update callbacks
  const inboxUpdateCallbacks = useRef<Set<(data: any) => void>>(new Set());

  useEffect(() => {
    if (!enabled || !personId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setStatus("disconnected");
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      console.error("NEXT_PUBLIC_SOCKET_URL not configured");
      setStatus("error");
      setLastError("Socket URL not configured");
      return;
    }

    setStatus("connecting");

    const newSocket = createSocketConnection(socketUrl, personId);

    // 🆕 FIXED: Include inbox callbacks parameter
    const cleanup = setupAllSocketHandlers(
      newSocket,
      personId,
      currentRooms,
      setStatus,
      setLastError,
      reconnectAttempts,
      messageCallbacks,
      threadUpdateCallbacks,
      inboxUpdateCallbacks, // 🆕 NEW: This was missing!
      zoneRequestMap, // 🆕 NEW: Pass zone request map
      currentZoneContext // 🆕 NEW: Pass current zone context
    );

    setSocket(newSocket);

    return () => {
      cleanup();
      currentRooms.current.clear();
      newSocket.disconnect();
      setSocket(null);
      setStatus("disconnected");
    };
  }, [enabled, personId]);

  // 🆕 NEW: Initialize zones function
  const initializeZones = useCallback(
    (zones: any[], translationLang: string = "nl") => {
      if (!socket || !personId || status !== "connected") {
        return;
      }
      setUserZones(zones);

      // Join zone rooms
      zones.forEach((zone) => {
        joinSocketRoom(socket, zone.zoneId.toString(), personId);
        currentRooms.current.add(zone.zoneId.toString());
      });

      // Fetch initial threads for each zone sequentially to maintain context
      const fetchZoneThreadsSequentially = async () => {
        for (const zone of zones) {
          
          // Set current zone context
          currentZoneContext.current = zone.zoneId.toString();
          zoneRequestMap.current.set("current", zone.zoneId.toString());
          
          // Emit request with zone context
          socket.emit("fetch_threads", {
            zoneId: zone.zoneId,
            personId: personId,
            type: "active",
            transLangId: translationLang,
          });
          
          // Wait a bit between requests to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      };
      
      fetchZoneThreadsSequentially();
    },
    [socket, personId, status]
  );

  const joinThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || !personId || status !== "connected") return;

      joinSocketRoom(socket, threadId, personId);
      joinSocketRoom(socket, zoneId, personId);

      currentRooms.current.add(threadId);
      currentRooms.current.add(zoneId);
    },
    [socket, personId, status]
  );

  const leaveThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || !personId) return;

      leaveSocketRoom(socket, threadId, personId);
      leaveSocketRoom(socket, zoneId, personId);

      currentRooms.current.delete(threadId);
      currentRooms.current.delete(zoneId);
    },
    [socket, personId]
  );

  const sendMessage = useCallback(
    async (
      threadId: string,
      text: string,
      createdBy: number,
      attachments?: any[]
    ): Promise<boolean> => {
      if (!socket || status !== "connected") {
        return false;
      }

      try {
        socket.emit("send_thread_message", {
          threadId,
          text,
          createdBy,
          completed: false,
          attachments: attachments || [],
          appName: "Mymmo-mobile-app-v2",
        });

        // Trigger immediate inbox update for sent message
        socket.emit("fetch_threads", {
          type: "active",
          personId: createdBy,
          transLangId: "nl",
        });

        return true;
      } catch (error) {
        console.error("Socket send error:", error);
        return false;
      }
    },
    [socket, status]
  );

  const onMessageReceived = useCallback(
    (callback: (message: RealtimeMessage) => void) => {
      messageCallbacks.current.add(callback);
    },
    []
  );

  const offMessageReceived = useCallback(
    (callback: (message: RealtimeMessage) => void) => {
      messageCallbacks.current.delete(callback);
    },
    []
  );

  const onThreadUpdate = useCallback((callback: (data: any) => void) => {
    threadUpdateCallbacks.current.add(callback);
  }, []);

  const offThreadUpdate = useCallback((callback: (data: any) => void) => {
    threadUpdateCallbacks.current.delete(callback);
  }, []);

  // 🆕 NEW: Inbox update functions
  const onInboxUpdate = useCallback((callback: (data: any) => void) => {
    inboxUpdateCallbacks.current.add(callback);
  }, []);

  const offInboxUpdate = useCallback((callback: (data: any) => void) => {
    inboxUpdateCallbacks.current.delete(callback);
  }, []);

  const contextValue: ExtendedSocketContextType = {
    socket,
    status,
    isConnected: status === "connected",
    lastError,
    joinThreadRoom,
    leaveThreadRoom,
    sendMessage,
    onMessageReceived,
    offMessageReceived,
    onThreadUpdate,
    offThreadUpdate,
    // 🆕 NEW: Inbox functions
    initializeZones,
    onInboxUpdate,
    offInboxUpdate,
    userZones,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
