// src/app/contexts/socket/socketEventHandlers.ts - UPDATED WITH INBOX SUPPORT

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
    console.log("🔗 Socket connected:", socket.id);
    setStatus("connected");
    setLastError(null);
    reconnectAttempts.current = 0;

    // Auto-join person room
    joinSocketRoom(socket, personId.toString(), personId);

    // Rejoin all rooms
    currentRooms.current.forEach((roomId) => {
      joinSocketRoom(socket, roomId, personId);
    });
  });

  socket.on("disconnect", (reason: string) => {
    console.log("🔌 Socket disconnected:", reason);
    setStatus("disconnected");

    if (reason === "io server disconnect") {
      setLastError("Server disconnected");
    } else {
      setStatus("reconnecting");
    }
  });

  socket.on("connect_error", (error: Error) => {
    console.error("❌ Socket connection error:", error);
    setStatus("error");
    setLastError(error.message);
    reconnectAttempts.current++;

    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      setLastError("Unable to connect after multiple attempts");
    }
  });

  socket.on("reconnect", (attemptNumber: number) => {
    console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
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
    console.log("📨 Realtime message received:", data);

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
        console.error("❌ Error in message callback:", error);
      }
    });
  };

  socket.on("receive_thread_message", handleRealtimeMessage);
  socket.on("thread_message_broadcasted", handleRealtimeMessage);
  socket.on("update_thread_screen", handleRealtimeMessage);

  return () => {
    socket.off("receive_thread_message", handleRealtimeMessage);
    socket.off("thread_message_broadcasted", handleRealtimeMessage);
    socket.off("update_thread_screen", handleRealtimeMessage);
  };
}

export function setupThreadUpdateHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  threadUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>
) {
  const handleThreadUpdate = (data: any) => {
    console.log("📋 Thread update received:", data);

    threadUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("❌ Error in thread update callback:", error);
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

// 🆕 NEW: Inbox update handlers
export function setupInboxUpdateHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  inboxUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>
) {
  const handleInboxUpdate = (data: any) => {
    console.log("📬 Inbox update received:", data);

    // Convert camelCase to snake_case for consistency
    const convertedData = {
      ...data,
      // Convert thread data
      threads:
        data.threads?.map((thread: any) => ({
          ...thread,
          latest_message: thread.latestMessage || thread.latest_message,
          unread_count:
            thread.unreadCount !== undefined
              ? thread.unreadCount
              : thread.unread_count,
          communication_group:
            thread.communicationGroup || thread.communication_group,
        })) || data.threads,
      // Convert single thread data
      latest_message: data.latestMessage || data.latest_message,
      unread_count:
        data.unreadCount !== undefined ? data.unreadCount : data.unread_count,
      communication_group: data.communicationGroup || data.communication_group,
    };

    inboxUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(convertedData);
      } catch (error) {
        console.error("❌ Error in inbox update callback:", error);
      }
    });
  };

  // Listen to the existing thread events that affect inbox
  socket.on("update_groups", handleInboxUpdate);
  socket.on("thread_list_updated", handleInboxUpdate);

  // Also listen to message events that affect unread counts
  socket.on("receive_thread_message", (data: any) => {
    // Convert and forward as inbox update
    handleInboxUpdate({
      type: "new_message",
      thread_id: data.thread_id,
      message: data,
    });
  });

  return () => {
    socket.off("update_groups", handleInboxUpdate);
    socket.off("thread_list_updated", handleInboxUpdate);
    socket.off("receive_thread_message");
  };
}

// 🆕 UPDATED: setupAllSocketHandlers now includes inbox handlers
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
  threadUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>,
  inboxUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>> // 🆕 NEW parameter
) {
  console.log("🚀 Setting up socket handlers for person:", personId);

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
  const cleanupInbox = setupInboxUpdateHandlers(socket, inboxUpdateCallbacks); // 🆕 NEW

  socket.on("error", (error: any) => {
    console.error("❌ Socket error:", error);
    setLastError(error.message || "Socket error occurred");
  });

  // 🆕 NEW: Handle fetch_threads responses (update_groups)
  socket.on("update_groups", (data: any) => {
    console.log("📊 Received update_groups:", data);
    // This will be handled by inbox update handlers automatically
  });

  return () => {
    console.log("🧹 Cleaning up socket handlers");
    cleanupMessages();
    cleanupThreads();
    cleanupInbox(); // 🆕 NEW
    socket.off("error");
    socket.off("update_groups");
  };
}
