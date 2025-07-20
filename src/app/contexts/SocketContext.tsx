// src/app/contexts/SocketContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import io from "socket.io-client";

// Socket connection states
export type SocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

// Socket context interface
interface SocketContextType {
  socket: ReturnType<typeof io> | null;
  status: SocketStatus;
  isConnected: boolean;
  lastError: string | null;
  joinRoom: (roomId: string, userId: number) => void;
  leaveRoom: (roomId: string, userId: number) => void;
  emit: (event: string, data: any) => void;
}

// Create context
const SocketContext = createContext<SocketContextType | null>(null);

// Provider props
interface SocketProviderProps {
  children: React.ReactNode;
  personId?: number; // User ID for socket connection
  enabled?: boolean; // Allow enabling/disabling socket connection
}

export function SocketProvider({
  children,
  personId,
  enabled = true,
}: SocketProviderProps) {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Create socket connection
  useEffect(() => {
    if (!enabled || !personId) {
      // Disconnect if disabled or no user
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
      transports: ["websocket", "polling"], // Fallback to polling if websocket fails
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Removed maxHttpBufferSize as it's not supported in client options
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setStatus("connected");
      setLastError(null);
      reconnectAttempts.current = 0;

      // 🔧 FIXED: Join user to their personal room (following backend logic for non-mobile-v2 apps)
      newSocket.emit("join_socket", {
        roomId: personId.toString(), // ✅ CORRECT: Use personId as roomId for web app
        userId: personId,
        appName: "mymmo-web-poc",
      });

      console.log(`🏠 Joined personal room: ${personId}`);
    });

    newSocket.on("disconnect", (reason: string) => {
      console.log("❌ Socket disconnected:", reason);
      setStatus("disconnected");

      // Handle different disconnect reasons
      if (reason === "io server disconnect") {
        // Server initiated disconnect - don't auto-reconnect
        setLastError("Server disconnected");
      } else {
        // Client-side disconnect - will auto-reconnect
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

    newSocket.on("reconnect_attempt", (attemptNumber: number) => {
      console.log("🔄 Reconnection attempt:", attemptNumber);
      setStatus("reconnecting");
    });

    newSocket.on("reconnect_error", (error: Error) => {
      console.error("🔴 Reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed");
      setStatus("error");
      setLastError("Reconnection failed");
    });

    // Debug: Log all socket events in development
    if (process.env.NODE_ENV === "development") {
      // Use a more compatible way to log all events
      const originalEmit = newSocket.emit.bind(newSocket);
      newSocket.emit = (event: string, ...args: any[]) => {
        console.log("📤 Socket event sent:", event, args);
        return originalEmit(event, ...args);
      };

      // Listen for common events using standard event listeners
      const commonEvents = [
        "connect",
        "disconnect",
        "error",
        "message",
        "newMessage",
        "messageUpdate",
      ];
      commonEvents.forEach((eventName) => {
        newSocket.on(eventName, (...args: any[]) => {
          console.log(`📡 Socket event received: ${eventName}`, args);
        });
      });
    }

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.disconnect();
      setSocket(null);
      setStatus("disconnected");
    };
  }, [enabled, personId]);

  // Helper functions
  const joinRoom = (roomId: string, userId: number) => {
    if (socket && status === "connected") {
      console.log("🏠 Joining room:", roomId);
      socket.emit("join_socket", {
        roomId,
        userId,
        appName: "mymmo-web-poc",
      });
    }
  };

  const leaveRoom = (roomId: string, userId: number) => {
    if (socket && status === "connected") {
      console.log("🚪 Leaving room:", roomId);
      socket.emit("leave_socket", {
        roomId,
        userId,
      });
    }
  };

  const emit = (event: string, data: any) => {
    if (socket && status === "connected") {
      console.log("📤 Emitting event:", event, data);
      socket.emit(event, data);
    } else {
      console.warn("⚠️ Cannot emit - socket not connected:", { event, status });
    }
  };

  const contextValue: SocketContextType = {
    socket,
    status,
    isConnected: status === "connected",
    lastError,
    joinRoom,
    leaveRoom,
    emit,
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
