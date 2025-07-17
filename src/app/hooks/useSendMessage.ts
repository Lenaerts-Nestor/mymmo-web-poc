// src/app/hooks/useSendMessage.ts - OPTIMISTIC UPDATES FOR INSTANT FEEL

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MyMMOApiThreads, {
  SaveMessagePayload,
  ThreadMessage,
} from "../services/mymmo-thread-service/apiThreads";

interface UseSendMessageResult {
  sendMessage: (text: string) => Promise<boolean>;
  isSending: boolean;
  error: string | null;
}

export function useSendMessage(
  threadId: string,
  personId: string,
  transLangId: string
): UseSendMessageResult {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;

    setIsSending(true);
    setError(null);

    const personIdNum = parseInt(personId);

    // 🎯 OPTIMISTIC UPDATE: Add message immediately to UI
    const optimisticMessage: ThreadMessage = {
      _id: `temp-${Date.now()}`, // Temporary ID
      text: text.trim(),
      attachments: [],
      thread_id: threadId,
      lang_id_detected: "nl", // Default, will be updated by API
      metadata: {
        recipients: [], // Will be filled by API
      },
      is_deleted: false,
      created_by: personIdNum,
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      updated_by: null,
      __v: 0,
    };

    // Get current thread details cache key
    const cacheKey = ["threadDetails", threadId, personId, transLangId];

    try {
      // 🚀 INSTANT UI UPDATE: Add optimistic message to cache
      queryClient.setQueryData(cacheKey, (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            // Add to readMessages (assuming user sent it)
            readMessages: [
              ...(oldData.data.readMessages || []),
              optimisticMessage,
            ],
          },
        };
      });

      // Debug logging
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [SEND_MESSAGE] Optimistic update applied:", {
          threadId,
          messageText: text.substring(0, 50) + "...",
          tempId: optimisticMessage._id,
        });
      }

      // 📤 SEND TO API: Actual API call
      const response = await MyMMOApiThreads.saveMessage({
        threadId,
        text: text.trim(),
        createdBy: personIdNum,
        completed: false,
      });

      // 🎯 SUCCESS: Force refresh to get real message data
      await queryClient.invalidateQueries({
        queryKey: ["threadDetails", threadId],
      });

      // Also refresh thread lists to update last message
      await queryClient.invalidateQueries({
        queryKey: ["threads"],
      });

      // 🎯 FIX: Also invalidate zones cache to update unread counts
      await queryClient.invalidateQueries({
        queryKey: ["zonesWithUnread"],
      });

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [SEND_MESSAGE] Message sent successfully:", {
          messageId: response.data.messageId,
          threadId,
        });
      }

      return true;
    } catch (sendError) {
      console.error("Failed to send message:", sendError);

      // 🔄 ROLLBACK: Remove optimistic message on failure
      queryClient.setQueryData(cacheKey, (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            readMessages: (oldData.data.readMessages || []).filter(
              (msg: ThreadMessage) => msg._id !== optimisticMessage._id
            ),
          },
        };
      });

      setError("Bericht kon niet worden verzonden. Probeer het opnieuw.");

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [SEND_MESSAGE] Rollback applied due to error");
      }

      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendMessage,
    isSending,
    error,
  };
}
