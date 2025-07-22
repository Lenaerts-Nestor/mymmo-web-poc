// src/app/contexts/socket/SocketProvider.tsx - Clean Socket Provider

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

// Create context
const SocketContext = createContext<SocketContextType | null>(null);

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

  // Track current rooms
  const currentRooms = useRef<Set<string>>(new Set());
  const reconnectAttempts = useRef(0);

  // Callback refs for real-time events
  const messageCallbacks = useRef<Set<(message: RealtimeMessage) => void>>(
    new Set()
  );
  const threadUpdateCallbacks = useRef<Set<(data: any) => void>>(new Set());

  // Create socket connection
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
      console.error("❌ NEXT_PUBLIC_SOCKET_URL not configured");
      setStatus("error");
      setLastError("Socket URL not configured");
      return;
    }

    console.log("🔌 Creating socket connection to:", socketUrl);
    setStatus("connecting");

    // Create socket instance
    const newSocket = createSocketConnection(socketUrl, personId);

    // Setup all event handlers
    const cleanup = setupAllSocketHandlers(
      newSocket,
      personId,
      currentRooms,
      setStatus,
      setLastError,
      reconnectAttempts,
      messageCallbacks,
      threadUpdateCallbacks
    );

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      cleanup();
      currentRooms.current.clear();
      newSocket.disconnect();
      setSocket(null);
      setStatus("disconnected");
    };
  }, [enabled, personId]);

  // Join thread room (for real-time chat)
  const joinThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || !personId || status !== "connected") return;

      console.log("🎯 Joining thread room:", threadId, "zone:", zoneId);

      // Join both thread and zone rooms
      joinSocketRoom(socket, threadId, personId);
      joinSocketRoom(socket, zoneId, personId);

      currentRooms.current.add(threadId);
      currentRooms.current.add(zoneId);
    },
    [socket, personId, status]
  );

  // Leave thread room
  const leaveThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || !personId) return;

      console.log("🚪 Leaving thread room:", threadId, "zone:", zoneId);

      leaveSocketRoom(socket, threadId, personId);
      leaveSocketRoom(socket, zoneId, personId);

      currentRooms.current.delete(threadId);
      currentRooms.current.delete(zoneId);
    },
    [socket, personId]
  );

  // Send message via socket
  const sendMessage = useCallback(
    async (
      threadId: string,
      text: string,
      createdBy: number
    ): Promise<boolean> => {
      if (!socket || status !== "connected") {
        console.warn("⚠️ Cannot send message - socket not connected");
        return false;
      }

      console.log("📤 Sending message via socket:", {
        threadId,
        text,
        createdBy,
      });

      try {
        socket.emit("send_thread_message", {
          threadId,
          text,
          createdBy,
          completed: false,
          attachments: [],
          appName: "Mymmo-mobile-app-v2", // Critical for backend routing
        });

        return true;
      } catch (error) {
        console.error("❌ Socket send error:", error);
        return false;
      }
    },
    [socket, status]
  );

  // Message callback management
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

  // Thread update callback management
  const onThreadUpdate = useCallback((callback: (data: any) => void) => {
    threadUpdateCallbacks.current.add(callback);
  }, []);

  const offThreadUpdate = useCallback((callback: (data: any) => void) => {
    threadUpdateCallbacks.current.delete(callback);
  }, []);

  const contextValue: SocketContextType = {
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
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook to use socket context
export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
