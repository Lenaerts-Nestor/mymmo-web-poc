// src/app/hooks/useSocket.ts - CLEANED

"use client";

import { useEffect, useCallback } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { UseSocketOptions } from "../types/socket";
import { useSocketRooms } from "./useSocketRooms";

export function useSocket(options: UseSocketOptions = {}) {
  const { threadId, personId, onMessage, onThreadUpdate, onError } = options;
  const queryClient = useQueryClient();

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

  const { joinedRooms, joinRoom, leaveRoom } = useSocketRooms({
    threadId,
    personId,
    autoJoin: !!threadId && !!personId,
  });

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: any) => {
      if (onMessage) {
        onMessage(data);
      }

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

    const handleThreadUpdate = (data: any) => {
      if (onThreadUpdate) {
        onThreadUpdate(data);
      }

      queryClient.invalidateQueries({
        queryKey: ["threads"],
      });
    };

    onMessageReceived(handleMessage);
    socketOnThreadUpdate(handleThreadUpdate);

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

  useEffect(() => {
    if (lastError && onError) {
      onError(lastError);
    }
  }, [lastError, onError]);

  const sendSocketMessage = useCallback(
    async (messageData: {
      threadId: string;
      text: string;
      createdBy: number;
      completed?: boolean;
    }) => {
      if (!isConnected) {
        return false;
      }

      return await socketSendMessage(
        messageData.threadId,
        messageData.text,
        messageData.createdBy
      );
    },
    [isConnected, socketSendMessage]
  );

  const fetchMessages = useCallback(
    (threadId: string, personId: number) => {
      if (!isConnected || !socket) return;

      socket.emit("fetch_thread_messages", {
        threadId,
        personId,
      });
    },
    [isConnected, socket]
  );

  return {
    socket,
    status,
    isConnected,
    lastError,
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
    sendSocketMessage,
    fetchMessages,
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
