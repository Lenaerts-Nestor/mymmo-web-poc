// src/app/contexts/SocketContext.tsx - REAL-TIME CHAT OPTIMIZED
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import io from "socket.io-client";

// Socket connection states
export type SocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

// Real-time message interface
export interface RealtimeMessage {
  _id: string;
  text: string;
  created_on: string;
  created_by: number;
  thread_id: string;
  attachments?: any[];
  isOptimistic?: boolean;
}

// Socket context interface - ENHANCED FOR REAL-TIME CHAT
interface SocketContextType {
  socket: ReturnType<typeof io> | null;
  status: SocketStatus;
  isConnected: boolean;
  lastError: string | null;

  // Room management
  joinThreadRoom: (threadId: string, zoneId: string) => void;
  leaveThreadRoom: (threadId: string, zoneId: string) => void;

  // Message handling
  sendMessage: (
    threadId: string,
    text: string,
    createdBy: number
  ) => Promise<boolean>;
  onMessageReceived: (callback: (message: RealtimeMessage) => void) => void;
  offMessageReceived: (callback: (message: RealtimeMessage) => void) => void;

  // Thread updates
  onThreadUpdate: (callback: (data: any) => void) => void;
  offThreadUpdate: (callback: (data: any) => void) => void;
}

// Create context
const SocketContext = createContext<SocketContextType | null>(null);

// Provider props
interface SocketProviderProps {
  children: React.ReactNode;
  personId?: number;
  enabled?: boolean;
}

export function SocketProvider({
  children,
  personId,
  enabled = true,
}: SocketProviderProps) {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);

  // Track current rooms
  const currentRooms = useRef<Set<string>>(new Set());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

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
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setStatus("connected");
      setLastError(null);
      reconnectAttempts.current = 0;

      // 🚀 CRITICAL: Join as mobile-v2 to trigger room-based backend
      newSocket.emit("join_socket", {
        roomId: personId.toString(),
        userId: personId,
        appName: "Mymmo-mobile-app-v2", // ✅ TRIGGERS NEW VERSION BACKEND
      });

      console.log(`🏠 Joined as mobile-v2 user: ${personId}`);

      // Rejoin any rooms we were in before disconnect
      currentRooms.current.forEach((roomId) => {
        newSocket.emit("join_socket", {
          roomId,
          userId: personId,
          appName: "Mymmo-mobile-app-v2",
        });
        console.log(`🔄 Rejoined room: ${roomId}`);
      });
    });

    newSocket.on("disconnect", (reason: string) => {
      console.log("❌ Socket disconnected:", reason);
      setStatus("disconnected");

      if (reason === "io server disconnect") {
        setLastError("Server disconnected");
      } else {
        setStatus("reconnecting");
      }
    });

    newSocket.on("connect_error", (error: Error) => {
      console.error("🔴 Socket connection error:", error);
      setStatus("error");
      setLastError(error.message);
      reconnectAttempts.current++;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error("❌ Max reconnection attempts reached");
        setLastError("Unable to connect after multiple attempts");
      }
    });

    newSocket.on("reconnect", (attemptNumber: number) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setStatus("connected");
      setLastError(null);
      reconnectAttempts.current = 0;
    });

    // 🚀 REAL-TIME MESSAGE HANDLER
    newSocket.on("receive_thread_message", (data: any) => {
      console.log("💬 Real-time message received:", data);

      const message: RealtimeMessage = {
        _id: data._id || `temp-${Date.now()}`,
        text: data.text || "",
        created_on: data.created_on || new Date().toISOString(),
        created_by: data.created_by || 0,
        thread_id: data.thread_id || "",
        attachments: data.attachments || [],
        isOptimistic: false,
      };

      // Notify all message callbacks
      messageCallbacks.current.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error("Error in message callback:", error);
        }
      });
    });

    // 🚀 THREAD UPDATE HANDLER
    newSocket.on("update_thread_screen", (data: any) => {
      console.log("📋 Thread update received:", data);

      // Notify all thread update callbacks
      threadUpdateCallbacks.current.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in thread update callback:", error);
        }
      });
    });

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      newSocket.onAny((eventName, ...args) => {
        console.log(`📡 Socket event: ${eventName}`, args);
      });
    }

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      currentRooms.current.clear();
      newSocket.disconnect();
      setSocket(null);
      setStatus("disconnected");
    };
  }, [enabled, personId]);

  // 🚀 JOIN THREAD ROOM (for real-time chat)
  const joinThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || !personId || status !== "connected") return;

      console.log("🎯 Joining thread room:", threadId, "zone:", zoneId);

      // Join both thread and zone rooms
      socket.emit("join_socket", {
        roomId: threadId,
        userId: personId,
        appName: "Mymmo-mobile-app-v2",
      });

      socket.emit("join_socket", {
        roomId: zoneId,
        userId: personId,
        appName: "Mymmo-mobile-app-v2",
      });

      currentRooms.current.add(threadId);
      currentRooms.current.add(zoneId);
    },
    [socket, personId, status]
  );

  // 🚀 LEAVE THREAD ROOM
  const leaveThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || !personId) return;

      console.log("🚪 Leaving thread room:", threadId, "zone:", zoneId);

      socket.emit("leave_socket", {
        roomId: threadId,
        userId: personId,
      });

      socket.emit("leave_socket", {
        roomId: zoneId,
        userId: personId,
      });

      currentRooms.current.delete(threadId);
      currentRooms.current.delete(zoneId);
    },
    [socket, personId]
  );

  // 🚀 SEND MESSAGE VIA SOCKET
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
          appName: "Mymmo-mobile-app-v2", // ✅ CRITICAL FOR BACKEND ROUTING
        });

        return true;
      } catch (error) {
        console.error("❌ Socket send error:", error);
        return false;
      }
    },
    [socket, status]
  );

  // 🚀 MESSAGE CALLBACK MANAGEMENT
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

  // 🚀 THREAD UPDATE CALLBACK MANAGEMENT
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
