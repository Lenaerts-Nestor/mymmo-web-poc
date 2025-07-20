// src/app/hooks/useSendMessage.ts - Send Message Hook

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";

interface UseSendMessageResult {
  sendMessage: (text: string) => Promise<boolean>;
  isSending: boolean;
  error: string | null;
}

export function useSendMessage(
  threadId: string,
  personId: string,
  translationLang: string
): UseSendMessageResult {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = async (text: string): Promise<boolean> => {
    if (isSending || !text.trim()) return false;

    setIsSending(true);
    setError(null);

    try {
      const personIdNum = parseInt(personId);

      await MyMMOApiThreads.saveMessage({
        threadId,
        text: text.trim(),
        createdBy: personIdNum,
        completed: false,
      });

      // Invalidate relevant caches for UI update
      queryClient.invalidateQueries({
        queryKey: ["threadDetails", threadId],
      });

      queryClient.invalidateQueries({
        queryKey: ["threads"],
      });

      // Also invalidate inbox for unread counts
      queryClient.invalidateQueries({
        queryKey: ["inbox"],
      });

      console.log("✅ Message sent via HTTP API");
      return true;
    } catch (err: any) {
      console.error("❌ HTTP message send failed:", err);
      setError(err.message || "Failed to send message");
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
