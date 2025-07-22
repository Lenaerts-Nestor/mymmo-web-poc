// src/app/hooks/useSocket.ts - REFACTORED: Clean Socket Hook

"use client";

import { useEffect, useCallback } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { UseSocketOptions } from "../types/socket";
import { useSocketRooms } from "./useSocketRooms";

export function useSocket(options: UseSocketOptions = {}) {
  const { threadId, personId, onMessage, onThreadUpdate, onError } = options;
  const queryClient = useQueryClient();

  // Get socket context
  const {
    socket,
    status,
    isConnected,
    lastError,
    sendMessage: socketSendMessage,
    onMessageReceived,
    offMessageReceived,
    onThreadUpdate: socketOnThreadUpdate,
    offThreadUpdate,
  } = useSocketContext();

  // Room management (automatically handles join/leave)
  const { joinedRooms, joinRoom, leaveRoom } = useSocketRooms({
    threadId,
    personId,
    autoJoin: !!threadId && !!personId, // Auto-join if both provided
  });

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle incoming messages
    const handleMessage = (data: any) => {
      console.log("💬 Received message:", data);

      // Call custom handler if provided
      if (onMessage) {
        onMessage(data);
      }

      // Invalidate relevant React Query caches for instant UI updates
      if (data.thread_id || data.threadId) {
        const messageThreadId = data.thread_id || data.threadId;

        queryClient.invalidateQueries({
          queryKey: ["threadDetails", messageThreadId],
        });

        queryClient.invalidateQueries({
          queryKey: ["threads"],
        });

        queryClient.invalidateQueries({
          queryKey: ["inbox"],
        });
      }
    };

    // Handle thread updates
    const handleThreadUpdate = (data: any) => {
      console.log("📋 Thread updated:", data);

      // Call custom handler if provided
      if (onThreadUpdate) {
        onThreadUpdate(data);
      }

      // Invalidate threads cache
      queryClient.invalidateQueries({
        queryKey: ["threads"],
      });
    };

    // Register event listeners using the context methods
    onMessageReceived(handleMessage);
    socketOnThreadUpdate(handleThreadUpdate);

    // Cleanup listeners
    return () => {
      offMessageReceived(handleMessage);
      offThreadUpdate(handleThreadUpdate);
    };
  }, [
    socket,
    queryClient,
    onMessage,
    onThreadUpdate,
    onMessageReceived,
    offMessageReceived,
    socketOnThreadUpdate,
    offThreadUpdate,
  ]);

  // Handle connection errors
  useEffect(() => {
    if (lastError && onError) {
      onError(lastError);
    }
  }, [lastError, onError]);

  // Send message function
  const sendSocketMessage = useCallback(
    async (messageData: {
      threadId: string;
      text: string;
      createdBy: number;
      completed?: boolean;
    }) => {
      if (!isConnected) {
        console.warn("⚠️ Cannot send message - socket not connected");
        return false;
      }

      console.log("📤 Sending message via socket:", messageData);

      // Use the context's sendMessage method
      return await socketSendMessage(
        messageData.threadId,
        messageData.text,
        messageData.createdBy
      );
    },
    [isConnected, socketSendMessage]
  );

  // Fetch messages function
  const fetchMessages = useCallback(
    (threadId: string, personId: number) => {
      if (!isConnected || !socket) return;

      console.log("📥 Fetching messages for thread:", threadId);
      socket.emit("fetch_thread_messages", {
        threadId,
        personId,
      });
    },
    [isConnected, socket]
  );

  return {
    // Connection status
    socket,
    status,
    isConnected,
    lastError,

    // Room management
    joinedRooms,
    joinRoom: (roomId: string, zoneId?: string) => {
      if (zoneId) {
        return joinRoom(roomId, zoneId);
      }
      return false;
    },
    leaveRoom: (roomId: string, zoneId?: string) => {
      if (zoneId) {
        return leaveRoom(roomId, zoneId);
      }
      return false;
    },

    // Messaging functions
    sendSocketMessage,
    fetchMessages,

    // Raw emit function for custom events
    emit: useCallback(
      (event: string, data: any) => {
        if (socket) {
          socket.emit(event, data);
        }
      },
      [socket]
    ),
  };
}
