// src/app/contexts/socket/socketEventHandlers.ts - CLEANED

import { RealtimeMessage, SocketStatus } from "../../types/socket";
import { joinSocketRoom } from "./socketUtils";

export function setupConnectionHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  personId: number,
  currentRooms: React.MutableRefObject<Set<string>>,
  setStatus: React.Dispatch<React.SetStateAction<SocketStatus>>,
  setLastError: React.Dispatch<React.SetStateAction<string | null>>,
  reconnectAttempts: React.MutableRefObject<number>,
  maxReconnectAttempts: number = 5
) {
  socket.on("connect", () => {
    setStatus("connected");
    setLastError(null);
    reconnectAttempts.current = 0;

    joinSocketRoom(socket, personId.toString(), personId);

    currentRooms.current.forEach((roomId) => {
      joinSocketRoom(socket, roomId, personId);
    });
  });

  socket.on("disconnect", (reason: string) => {
    setStatus("disconnected");

    if (reason === "io server disconnect") {
      setLastError("Server disconnected");
    } else {
      setStatus("reconnecting");
    }
  });

  socket.on("connect_error", (error: Error) => {
    console.error("Socket connection error:", error);
    setStatus("error");
    setLastError(error.message);
    reconnectAttempts.current++;

    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      setLastError("Unable to connect after multiple attempts");
    }
  });

  socket.on("reconnect", (attemptNumber: number) => {
    setStatus("connected");
    setLastError(null);
    reconnectAttempts.current = 0;
  });
}

export function setupMessageHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  messageCallbacks: React.MutableRefObject<
    Set<(message: RealtimeMessage) => void>
  >
) {
  const handleRealtimeMessage = (data: any) => {
    const message: RealtimeMessage = {
      _id: data._id || `temp-${Date.now()}`,
      text: data.text || "",
      created_on: data.created_on || new Date().toISOString(),
      created_by: data.created_by || 0,
      thread_id: data.thread_id || "",
      attachments: data.attachments || [],
      isOptimistic: false,
    };

    messageCallbacks.current.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("Error in message callback:", error);
      }
    });
  };

  socket.on("receive_thread_message", handleRealtimeMessage);
  socket.on("thread_message_broadcasted", handleRealtimeMessage);

  return () => {
    socket.off("receive_thread_message", handleRealtimeMessage);
    socket.off("thread_message_broadcasted", handleRealtimeMessage);
  };
}

export function setupThreadUpdateHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  threadUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>
) {
  const handleThreadUpdate = (data: any) => {
    threadUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in thread update callback:", error);
      }
    });
  };

  socket.on("update_thread_screen", handleThreadUpdate);
  socket.on("thread_list_updated", handleThreadUpdate);

  return () => {
    socket.off("update_thread_screen", handleThreadUpdate);
    socket.off("thread_list_updated", handleThreadUpdate);
  };
}

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
  setupConnectionHandlers(
    socket,
    personId,
    currentRooms,
    setStatus,
    setLastError,
    reconnectAttempts
  );

  const cleanupMessages = setupMessageHandlers(socket, messageCallbacks);
  const cleanupThreads = setupThreadUpdateHandlers(
    socket,
    threadUpdateCallbacks
  );

  socket.on("error", (error: any) => {
    console.error("Socket error:", error);
    setLastError(error.message || "Socket error occurred");
  });

  return () => {
    cleanupMessages();
    cleanupThreads();
    socket.off("error");
  };
}
