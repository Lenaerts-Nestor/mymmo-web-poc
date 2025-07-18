// src/app/components/chat/ChatContent.tsx

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { useThreadDetails } from "@/app/hooks/useThreadDetails";
import { useSendMessage } from "@/app/hooks/useSendMessage";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { shouldShowTime } from "./chatUtils";

interface ChatContentProps {
  personId: string;
  zoneId: string;
  threadId: string;
  translationLang: string;
}

export function ChatContent({
  personId,
  zoneId,
  threadId,
  translationLang,
}: ChatContentProps) {
  const router = useRouter();
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // 🎯 REAL-TIME HOOKS
  const { messages, unreadMessages, isLoading, error, refetch, markAsRead } =
    useThreadDetails(threadId, personId, translationLang, true); // isActiveChatPage = true

  const {
    sendMessage,
    isSending,
    error: sendError,
  } = useSendMessage(threadId, personId, translationLang);

  // 🎯 AUTO-SCROLL: Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    // Auto-scroll when new messages arrive
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100); // Small delay for DOM update
    }
  }, [messages.length]);

  // 🎯 FOCUS INPUT: Auto-focus message input
  useEffect(() => {
    if (!isLoading && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [isLoading]);

  // 🎯 SEND MESSAGE HANDLER
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput(""); // Clear input immediately for responsive feel

    const success = await sendMessage(messageText);

    if (!success) {
      // Restore message on failure
      setMessageInput(messageText);
    }
  };

  // 🎯 KEYBOARD SHORTCUTS
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 🎯 TYPING INDICATOR
  useEffect(() => {
    if (messageInput.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [messageInput]);

  const handleBackToConversations = () => {
    router.push(`/conversations/${personId}/${zoneId}`);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Chat laden..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorDisplay error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="flex flex-col mx-auto border-1 rounded-t-xl bg-white h-[90vh] w-[40vw]">
      {/* CHAT HEADER */}
      <ChatHeader
        personId={personId}
        zoneId={zoneId}
        threadId={threadId}
        messagesCount={messages.length}
        unreadCount={unreadMessages.length}
        onBack={handleBackToConversations}
        onMarkAsRead={markAsRead}
      />

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-4  rounded-xl">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                Geen berichten in deze conversatie.
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Stuur het eerste bericht hieronder! 👇
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                currentPersonId={parseInt(personId)}
                showTime={shouldShowTime(messages, index)}
              />
            ))
          )}

          {/* LOADING INDICATOR */}
          {isLoading && messages.length > 0 && (
            <div className="text-center py-2">
              <div className="text-sm text-gray-400">Updates laden...</div>
            </div>
          )}

          {/* SCROLL ANCHOR */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* CHAT INPUT */}
      <ChatInput
        value={messageInput}
        onChange={setMessageInput}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        isSending={isSending}
        error={sendError}
        inputRef={messageInputRef}
        isTyping={isTyping}
      />
    </div>
  );
}
