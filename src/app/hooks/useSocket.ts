// src/app/hooks/useSocket.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import { useQueryClient } from "@tanstack/react-query";

interface UseSocketOptions {
  threadId?: string;
  personId?: number;
  onMessage?: (data: any) => void;
  onThreadUpdate?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { socket, status, isConnected, lastError, joinRoom, leaveRoom, emit } =
    useSocketContext();
  const queryClient = useQueryClient();
  const { threadId, personId, onMessage, onThreadUpdate, onError } = options;

  // Keep track of joined rooms to avoid duplicate joins
  const joinedRooms = useRef<Set<string>>(new Set());

  // Join thread room when threadId and personId are available
  useEffect(() => {
    if (
      threadId &&
      personId &&
      isConnected &&
      !joinedRooms.current.has(threadId)
    ) {
      console.log("🎯 Joining thread room:", threadId);
      joinRoom(threadId, personId);
      joinedRooms.current.add(threadId);
    }

    // Cleanup: leave room when component unmounts or threadId changes
    return () => {
      if (threadId && personId && joinedRooms.current.has(threadId)) {
        console.log("🚪 Leaving thread room:", threadId);
        leaveRoom(threadId, personId);
        joinedRooms.current.delete(threadId);
      }
    };
  }, [threadId, personId, isConnected, joinRoom, leaveRoom]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle incoming messages (real-time message updates)
    const handleMessage = (data: any) => {
      console.log("💬 Received message:", data);

      // Call custom handler if provided
      if (onMessage) {
        onMessage(data);
      }

      // Invalidate relevant React Query caches for instant UI updates
      if (data.thread_id || data.threadId) {
        const messageThreadId = data.thread_id || data.threadId;

        // Invalidate thread details cache to show new message
        queryClient.invalidateQueries({
          queryKey: ["threadDetails", messageThreadId],
        });

        // Invalidate threads list cache to update unread counts
        queryClient.invalidateQueries({
          queryKey: ["threads"],
        });

        // Invalidate zones cache to update global unread counter
        queryClient.invalidateQueries({
          queryKey: ["inbox"],
        });
      }
    };

    // Handle thread updates (thread list changes, unread counts, etc.)
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

    // Handle connection errors
    const handleSocketError = (error: any) => {
      console.error("🔴 Socket error:", error);

      if (onError) {
        onError(error.message || "Socket error occurred");
      }
    };

    // Register event listeners
    // Note: Based on the backend analysis, these are the key events we need to listen for
    socket.on("message_received", handleMessage); // Real-time message updates
    socket.on("thread_message_broadcasted", handleMessage); // Message broadcast from backend
    socket.on("thread_updated", handleThreadUpdate); // Thread list updates
    socket.on("thread_list_updated", handleThreadUpdate); // Thread list changes
    socket.on("error", handleSocketError); // Socket errors

    // Cleanup listeners
    return () => {
      socket.off("message_received", handleMessage);
      socket.off("thread_message_broadcasted", handleMessage);
      socket.off("thread_updated", handleThreadUpdate);
      socket.off("thread_list_updated", handleThreadUpdate);
      socket.off("error", handleSocketError);
    };
  }, [socket, queryClient, onMessage, onThreadUpdate, onError]);

  // Send message function (uses existing HTTP API but enhanced with socket awareness)
  const sendSocketMessage = useCallback(
    (messageData: {
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

      // Emit to backend (this will trigger the handleSendThreadMessage function)
      emit("send_thread_message", {
        threadId: messageData.threadId,
        text: messageData.text,
        createdBy: messageData.createdBy,
        completed: messageData.completed || false,
        attachments: [], // For now, no attachments in POC
      });

      return true;
    },
    [isConnected, emit]
  );

  // Fetch messages function (can be used to refresh message history)
  const fetchMessages = useCallback(
    (threadId: string, personId: number) => {
      if (!isConnected) return;

      console.log("📥 Fetching messages for thread:", threadId);
      emit("fetch_thread_messages", {
        threadId,
        personId,
      });
    },
    [isConnected, emit]
  );

  return {
    // Connection status
    socket,
    status,
    isConnected,
    lastError,

    // Room management
    joinRoom: useCallback(
      (roomId: string) => {
        if (personId) joinRoom(roomId, personId);
      },
      [joinRoom, personId]
    ),

    leaveRoom: useCallback(
      (roomId: string) => {
        if (personId) leaveRoom(roomId, personId);
      },
      [leaveRoom, personId]
    ),

    // Messaging functions
    sendSocketMessage,
    fetchMessages,

    // Raw emit function for custom events
    emit,
  };
}
