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
      _id: data._id || `temp-${crypto.randomUUID()}`,
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
  inboxUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>,
  zoneRequestMap: React.MutableRefObject<Map<string, string>> = { current: new Map() }
) {
  const handleInboxUpdate = (data: any) => {
    console.log(
      "🏠 [ZONES_UNREAD] RAW DATA STRUCTURE:",
      JSON.stringify(data, null, 2)
    );

    // Extract zone information from stored request map or data
    if (data.threadsData) {
      const threads = data.threadsData;
      console.log("🔧 FIXED - Extracted threads in handler:", threads.length);
      
      // Try to get zone_id from the data or map it from stored requests
      let zoneId = threads[0]?.zone_id || threads[0]?.zoneId;
      
      // If no zone_id in thread data, try to infer from stored context
      if (!zoneId && data.zoneId) {
        zoneId = data.zoneId;
      }
      
      console.log("🔧 FIXED - Determined zone_id:", zoneId);
      
      // Add zone_id to each thread if missing
      const threadsWithZone = threads.map((thread: any) => ({
        ...thread,
        zone_id: zoneId || thread.zone_id || thread.zoneId,
        zoneId: zoneId || thread.zone_id || thread.zoneId
      }));
      
      // Update the data with zone information
      const enrichedData = {
        ...data,
        threadsData: threadsWithZone,
        zoneId: zoneId
      };
      
      inboxUpdateCallbacks.current.forEach((callback) => {
        try {
          callback(enrichedData);
        } catch (error) {
          console.error("❌ Error in inbox update callback:", error);
        }
      });
      
      return;
    }

    // 🔧 FIX: Forward other data as-is
    inboxUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(data);
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
    console.log("📨 [INBOX] New message received:", data);
    
    // Convert and forward as inbox update with zone info
    handleInboxUpdate({
      type: "new_message",
      thread_id: data.thread_id,
      zone_id: data.zone_id, // Include zone_id from message data
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
  inboxUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>, // 🆕 NEW parameter
  zoneRequestMap: React.MutableRefObject<Map<string, string>> = { current: new Map() }, // 🆕 NEW parameter
  currentZoneContext: React.MutableRefObject<string | null> = { current: null } // 🆕 NEW parameter
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
  const cleanupInbox = setupInboxUpdateHandlers(socket, inboxUpdateCallbacks, zoneRequestMap); // 🆕 NEW

  socket.on("error", (error: any) => {
    console.error("❌ Socket error:", error);
    setLastError(error.message || "Socket error occurred");
  });

  // 🆕 NEW: Handle fetch_threads responses (update_groups) with zone context
  socket.on("update_groups", (data: any) => {
    console.log("📊 Received update_groups:", data);
    
    // Try to determine zone from thread data or context
    if (data.threadsData && data.threadsData.length > 0) {
      // Check if we can determine zone from existing data
      let zoneId = data.zoneId;
      
      // If not in data, try to infer from thread participants or other context
      if (!zoneId && data.threadsData[0]) {
        // This is a fallback - you may need to adjust based on your actual data structure
        const firstThread = data.threadsData[0];
        
        // Try different potential zone field names
        zoneId = firstThread.zone_id || firstThread.zoneId || firstThread.comm_zone_id;
        
        // If still no zone, use the current zone context or request tracking (fallback)
        if (!zoneId) {
          // Try to get current zone from context
          zoneId = zoneRequestMap.current.get("current");
          
          if (zoneId) {
            console.log("✅ Using current zone context:", zoneId);
          } else if (zoneRequestMap.current.size > 0) {
            // Take the first available zone from requests as a fallback
            zoneId = Array.from(zoneRequestMap.current.values())[0];
            console.log("⚠️  Using fallback zone_id from request map:", zoneId);
          }
        }
      }
      
      if (zoneId) {
        console.log("📊 Enriching update_groups with zone_id:", zoneId);
        
        // Enrich the data with zone information
        const enrichedData = {
          ...data,
          zoneId: zoneId,
          threadsData: data.threadsData.map((thread: any) => ({
            ...thread,
            zone_id: zoneId,
            zoneId: zoneId
          }))
        };
        
        // Forward enriched data to inbox handlers
        inboxUpdateCallbacks.current.forEach((callback) => {
          try {
            callback(enrichedData);
          } catch (error) {
            console.error("❌ Error in inbox update callback:", error);
          }
        });
        
        return;
      }
    }
    
    // Fallback: forward as-is if no zone enrichment possible
    inboxUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("❌ Error in inbox update callback:", error);
      }
    });
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
