import { useState, useEffect, useRef } from "react";
import { processImageAttachments } from "@/app/services/imageUploadService";

interface UseChatHandlersProps {
  sendMessage: (message: string, attachments?: any[]) => Promise<boolean>;
  messagesLength: number;
  messagesLoading: boolean;
  threadId: string;
  zoneId: string;
  personId: string;
}

export function useChatHandlers({
  sendMessage,
  messagesLength,
  messagesLoading,
  threadId,
  zoneId,
  personId,
}: UseChatHandlersProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    if (messagesLength > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messagesLength]);

  useEffect(() => {
    if (!messagesLoading && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [messagesLoading]);

  const handleSendMessage = async (attachments?: any[]) => {
    if (!messageInput.trim() && !attachments?.length) return;
    if (isSending) return;

    const messageText = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    try {
      const success = await sendMessage(messageText, attachments);
      if (!success) {
        setMessageInput(messageText);
      } else {
        window.dispatchEvent(
          new CustomEvent("messagesSent", {
            detail: { threadId, zoneId, personId },
          })
        );
      }
    } catch (error) {
      console.error("Send message error:", error);
      setMessageInput(messageText);
    } finally {
      setIsSending(false);
    }
  };

  // Handle image uploads
  const handleImageUpload = async (files: File[]) => {
    if (isSending) return;

    try {
      const attachments = await processImageAttachments(files);
      // Include the current text content with the image
      await handleSendMessage(attachments);
    } catch (error) {
      console.error("Error processing image attachments:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    messageInput,
    setMessageInput,
    isSending,
    messagesEndRef,
    messageInputRef,
    handleSendMessage,
    handleKeyPress,
    handleImageUpload,
  };
}
