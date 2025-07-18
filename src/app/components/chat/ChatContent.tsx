// src/app/components/chat/ChatContent.tsx - Fetch thread follower data

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { useThreadDetails } from "@/app/hooks/useThreadDetails";
import { useSendMessage } from "@/app/hooks/useSendMessage";
import { useThreads } from "@/app/hooks/useThreads"; // 🆕 NEW: For thread follower data
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // 🎯 REAL-TIME HOOKS
  const { messages, unreadMessages, isLoading, error, refetch, markAsRead } =
    useThreadDetails(threadId, personId, translationLang, true);

  // 🆕 NEW: Fetch thread data for follower info (names, profile pics)
  const { threads: threadsData } = useThreads(
    personId,
    zoneId,
    translationLang,
    false // Not active chat page for this call
  );

  const {
    sendMessage,
    isSending,
    error: sendError,
  } = useSendMessage(threadId, personId, translationLang);

  // 🎯 GET CURRENT THREAD: Find the specific thread we're chatting in
  const currentThread = threadsData.find((t) => t._id === threadId);

  // 🎯 CREATE USER LOOKUP: Map person_id to real user info from thread followers
  const getUserInfo = (createdBy: number) => {
    if (!currentThread?.followers) {
      return {
        firstName: "Buur",
        lastName: "",
        profilePic: null,
      };
    }

    const follower = currentThread.followers.find(
      (f) => f.person_id === createdBy
    );
    if (!follower) {
      return {
        firstName: "Buur",
        lastName: "",
        profilePic: null,
      };
    }

    return {
      firstName: follower.firstName || "Buur",
      lastName: follower.lastName || "",
      profilePic: follower.profilePic || null,
    };
  };

  // 🎯 AUTO-SCROLL: Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  // 🎯 FOCUS INPUT: Auto-focus for better UX
  useEffect(() => {
    if (!isLoading && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [isLoading]);

  // 🎯 SEND MESSAGE HANDLER
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput("");

    const success = await sendMessage(messageText);
    if (!success) {
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
    <div
      className="flex flex-col mx-auto bg-white h-[90vh] w-[45vw] shadow-lg border border-gray-200 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #ffffff 0%, #fefbf3 100%)",
      }}
    >
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
      <div
        className="flex-1 overflow-y-auto"
        style={{
          background: "linear-gradient(to bottom, #fefbf3 0%, #f9f7f1 100%)",
        }}
      >
        <div className="max-w-full px-4 py-6 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #e4dece 0%, #d4c4a8 100%)",
                }}
              >
                <span className="text-2xl">💬</span>
              </div>
              <div className="text-gray-600 text-base mb-2 font-medium">
                Nog geen berichten in deze conversatie
              </div>
              <div className="text-sm text-gray-500">
                Begin de conversatie hieronder 👇
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                currentPersonId={parseInt(personId)}
                showTime={shouldShowTime(messages, index)}
                senderInfo={getUserInfo(message.created_by)}
              />
            ))
          )}

          {/* LOADING INDICATOR */}
          {isLoading && messages.length > 0 && (
            <div className="text-center py-2">
              <div className="text-xs text-gray-400">Laden...</div>
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
      />
    </div>
  );
}
