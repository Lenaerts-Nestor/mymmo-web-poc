import { useState, useEffect, useRef } from "react";
import { createImageAttachments } from "@/app/services/imageUploadService";

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

  // Auto-scroll to bottom when new messages arrive
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

  // Auto-focus input for better UX
  useEffect(() => {
    if (!messagesLoading && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [messagesLoading]);

  // Send message with real-time updates
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
        // Trigger thread list refresh after successful send
        setTimeout(() => {
          // Trigger a custom event that the thread list can listen to
          window.dispatchEvent(
            new CustomEvent("messagesSent", {
              detail: { threadId, zoneId, personId },
            })
          );
        }, 500);
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

    const attachments = createImageAttachments(files);
    await handleSendMessage(attachments);
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