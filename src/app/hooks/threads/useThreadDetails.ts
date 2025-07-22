// src/app/hooks/threads/useThreadDetails.ts - REFACTORED: Clean Thread Details Hook

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSocketContext } from "../../contexts/SocketContext";
import { useThreadPolling } from "./useThreadPolling";
import MyMMOApiThreads, {
  GetThreadDetailsResponse,
  ThreadMessage,
} from "../../services/mymmo-thread-service/apiThreads";
import { useSocketRooms } from "../useSocketRooms";

interface UseThreadDetailsResult {
  messages: ThreadMessage[];
  readMessages: ThreadMessage[];
  unreadMessages: ThreadMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  markAsRead: () => Promise<void>;
  sendMessageViaSocket: (text: string) => Promise<boolean>;
  isSocketConnected: boolean;
  socketStatus: string;
  pollingContext: string;
}

export function useThreadDetails(
  threadId: string,
  personId: string,
  zoneId: string,
  transLangId: string,
  isActiveChatPage: boolean = true
): UseThreadDetailsResult {
  const queryClient = useQueryClient();
  const personIdNum = parseInt(personId);

  // Socket integration
  const {
    isConnected,
    status,
    sendMessage: socketSendMessage,
  } = useSocketContext();

  // Room management
  useSocketRooms({
    threadId,
    zoneId,
    personId: personIdNum,
    autoJoin: true,
  });

  // Handle real-time message updates
  const handleMessageUpdate = () => {
    // Immediately invalidate cache for instant updates
    queryClient.invalidateQueries({
      queryKey: ["threadDetails", threadId, personId, transLangId],
    });
  };

  // Get polling configuration
  const {
    interval,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchIntervalInBackground,
    pollingContext,
    isSocketConnected,
    socketStatus,
  } = useThreadPolling({
    enabled: true,
    onThreadUpdate: handleMessageUpdate,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["threadDetails", threadId, personId, transLangId],
    queryFn: async (): Promise<GetThreadDetailsResponse> => {
      // Debug logging for API monitoring
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [THREAD_DETAILS] API call triggered:", {
          threadId,
          personId: personIdNum,
          interval,
          context: pollingContext,
          socketConnected: isSocketConnected,
        });
      }

      return await MyMMOApiThreads.getThreadDetails({
        threadId,
        transLangId,
        personId: personIdNum,
      });
    },

    // Use optimized polling configuration
    staleTime,
    gcTime,
    refetchInterval: interval,
    refetchIntervalInBackground,
    refetchOnWindowFocus,
    refetchOnMount,

    retry: 2,
    retryDelay: 1000,
    enabled: !!threadId && !!personId,
  });

  // Extract messages from API response
  const readMessages = data?.data?.readMessages || [];
  const unreadMessages = data?.data?.unreadMessages || [];
  const allMessages = [...readMessages, ...unreadMessages].sort(
    (a, b) =>
      new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
  );

  // Mark as read function
  const markAsRead = useCallback(async () => {
    try {
      await MyMMOApiThreads.updateThreadLastAccess({
        threadId,
        personId: personIdNum,
      });

      // Immediately invalidate caches for instant UI update
      queryClient.invalidateQueries({
        queryKey: ["threadDetails", threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["threads"],
      });

      if (process.env.NODE_ENV === "development") {
        console.log("✅ [THREAD_DETAILS] Marked as read:", threadId);
      }
    } catch (error) {
      console.error("❌ [THREAD_DETAILS] Mark as read failed:", error);
    }
  }, [threadId, personIdNum, queryClient]);

  // Send message via socket with fallback to HTTP
  const sendMessageViaSocket = useCallback(
    async (text: string): Promise<boolean> => {
      if (isConnected) {
        // Try socket first for instant delivery
        console.log("🚀 Sending message via socket...");
        const socketSuccess = await socketSendMessage(
          threadId,
          text,
          personIdNum
        );

        if (socketSuccess) {
          // Socket message sent - the response will trigger cache invalidation
          return true;
        }
      }

      // Fallback to HTTP API if socket fails
      console.log("📡 Fallback: Sending message via HTTP API...");
      try {
        await MyMMOApiThreads.saveMessage({
          threadId,
          text,
          createdBy: personIdNum,
          completed: false,
        });

        // HTTP success - manually invalidate caches
        queryClient.invalidateQueries({
          queryKey: ["threadDetails", threadId],
        });
        queryClient.invalidateQueries({
          queryKey: ["threads"],
        });

        return true;
      } catch (error) {
        console.error("❌ HTTP message send failed:", error);
        return false;
      }
    },
    [threadId, personIdNum, isConnected, socketSendMessage, queryClient]
  );

  const errorMessage = error
    ? "Fout bij het laden van berichten. Probeer het opnieuw."
    : null;

  return {
    messages: allMessages,
    readMessages,
    unreadMessages,
    isLoading,
    error: errorMessage,
    refetch,
    markAsRead,
    sendMessageViaSocket,
    isSocketConnected,
    socketStatus,
    pollingContext,
  };
}
