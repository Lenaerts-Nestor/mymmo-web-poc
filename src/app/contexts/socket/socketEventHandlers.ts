// src/app/contexts/socket/socketEventHandlers.ts - Socket Event Handlers

import { RealtimeMessage, SocketStatus } from "../../types/socket";
import { joinSocketRoom } from "./socketUtils";

/**
 * Handle socket connection events
 */
export function setupConnectionHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  personId: number,
  currentRooms: React.MutableRefObject<Set<string>>,
  setStatus: React.Dispatch<React.SetStateAction<SocketStatus>>,
  setLastError: React.Dispatch<React.SetStateAction<string | null>>,
  reconnectAttempts: React.MutableRefObject<number>,
  maxReconnectAttempts: number = 5
) {
  // Connection success
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    setStatus("connected");
    setLastError(null);
    reconnectAttempts.current = 0;

    // Join as mobile-v2 to trigger room-based backend
    joinSocketRoom(socket, personId.toString(), personId);

    // Rejoin any rooms we were in before disconnect
    currentRooms.current.forEach((roomId) => {
      joinSocketRoom(socket, roomId, personId);
      console.log(`🔄 Rejoined room: ${roomId}`);
    });
  });

  // Disconnection
  socket.on("disconnect", (reason: string) => {
    console.log("❌ Socket disconnected:", reason);
    setStatus("disconnected");

    if (reason === "io server disconnect") {
      setLastError("Server disconnected");
    } else {
      setStatus("reconnecting");
    }
  });

  // Connection errors
  socket.on("connect_error", (error: Error) => {
    console.error("🔴 Socket connection error:", error);
    setStatus("error");
    setLastError(error.message);
    reconnectAttempts.current++;

    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      setLastError("Unable to connect after multiple attempts");
    }
  });

  // Reconnection success
  socket.on("reconnect", (attemptNumber: number) => {
    console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    setStatus("connected");
    setLastError(null);
    reconnectAttempts.current = 0;
  });
}

/**
 * Handle real-time message events
 */
export function setupMessageHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  messageCallbacks: React.MutableRefObject<
    Set<(message: RealtimeMessage) => void>
  >
) {
  const handleRealtimeMessage = (data: any) => {
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
  };

  // Register message event listeners
  socket.on("receive_thread_message", handleRealtimeMessage);
  socket.on("thread_message_broadcasted", handleRealtimeMessage);

  return () => {
    socket.off("receive_thread_message", handleRealtimeMessage);
    socket.off("thread_message_broadcasted", handleRealtimeMessage);
  };
}

/**
 * Handle thread update events
 */
export function setupThreadUpdateHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  threadUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>
) {
  const handleThreadUpdate = (data: any) => {
    console.log("📋 Thread update received:", data);

    // Notify all thread update callbacks
    threadUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in thread update callback:", error);
      }
    });
  };

  // Register thread update event listeners
  socket.on("update_thread_screen", handleThreadUpdate);
  socket.on("thread_list_updated", handleThreadUpdate);

  return () => {
    socket.off("update_thread_screen", handleThreadUpdate);
    socket.off("thread_list_updated", handleThreadUpdate);
  };
}

/**
 * Setup all socket event handlers
 */
export function setupAllSocketHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  personId: number,
  currentRooms: React.MutableRefObject<Set<string>>,
  setStatus: React.Dispatch<React.SetStateAction<SocketStatus>>,
  setLastError: React.Dispatch<React.SetStateAction<string | null>>,
  reconnectAttempts: React.MutableRefObject<number>,
  messageCallbacks: React.MutableRefObject<
    Set<(message: RealtimeMessage) => void>
  >,
  threadUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>
) {
  // Setup connection handlers
  setupConnectionHandlers(
    socket,
    personId,
    currentRooms,
    setStatus,
    setLastError,
    reconnectAttempts
  );

  // Setup message handlers
  const cleanupMessages = setupMessageHandlers(socket, messageCallbacks);

  // Setup thread update handlers
  const cleanupThreads = setupThreadUpdateHandlers(
    socket,
    threadUpdateCallbacks
  );

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    socket.onAny((eventName, ...args) => {
      console.log(`📡 Socket event: ${eventName}`, args);
    });
  }

  // Handle connection errors
  socket.on("error", (error: any) => {
    console.error("🔴 Socket error:", error);
    setLastError(error.message || "Socket error occurred");
  });

  return () => {
    cleanupMessages();
    cleanupThreads();
    socket.off("error");
    if (process.env.NODE_ENV === "development") {
      socket.offAny();
    }
  };
}
