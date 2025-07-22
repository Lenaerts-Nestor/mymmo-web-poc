// src/app/components/chat/ChatContent.tsx - CLEANED & SPLIT

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { useThreads } from "@/app/hooks/threads/useThreads";
import { MessageBubble } from "./MessageBubble";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { shouldShowTime } from "./chatUtils";
import { useChatMessages } from "@/app/hooks/chat/useChatMessages";
import { ConnectionStatus } from "./ConnectionStatus";
import { EmptyMessagesState } from "./EmptyMessagesState";
import { OfflineWarning } from "./OfflineWarning";

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
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    unreadMessages,
    isLoading: messagesLoading,
    error: messagesError,
    sendMessage,
    markAsRead,
    refreshMessages,
    isConnected,
    socketStatus,
  } = useChatMessages({
    threadId,
    personId,
    zoneId,
    transLangId: translationLang,
    autoMarkAsRead: true,
  });

  // Get thread data for follower info
  const { threads: threadsData } = useThreads(
    personId,
    zoneId,
    translationLang,
    false // Not active chat page for this call
  );

  // Get current thread for follower info
  const currentThread = threadsData.find((t) => t._id === threadId);

  // User info lookup function
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

  // Auto-scroll to bottom when new messages arrive
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

  // Auto-focus input for better UX
  useEffect(() => {
    if (!messagesLoading && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [messagesLoading]);

  // Send message with real-time updates
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    try {
      const success = await sendMessage(messageText);
      if (!success) {
        setMessageInput(messageText);
      }
    } catch (error) {
      console.error("Send message error:", error);
      setMessageInput(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    router.push(`/conversations/${personId}/${zoneId}`);
  };

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Berichten laden...</p>
          {isConnected && (
            <div className="mt-2 text-green-600 text-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Real-time verbinding actief
            </div>
          )}
        </div>
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <ErrorDisplay error={messagesError} onRetry={refreshMessages} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[90vh] bg-gray-50 rounded-t-lg">
      <ChatHeader
        personId={personId}
        zoneId={zoneId}
        threadId={threadId}
        messagesCount={messages.length}
        unreadCount={unreadMessages.length}
        onBack={handleBack}
      />

      <ConnectionStatus
        isConnected={isConnected}
        socketStatus={socketStatus}
        participantCount={currentThread?.followers?.length || 0}
        messagesCount={messages.length}
      />

      <MessagesArea
        messages={messages}
        personId={personId}
        isConnected={isConnected}
        messagesEndRef={messagesEndRef}
        getUserInfo={getUserInfo}
      />

      <ChatInput
        value={messageInput}
        onChange={setMessageInput}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        isSending={isSending}
        error={messagesError}
        inputRef={messageInputRef}
      />

      <OfflineWarning isConnected={isConnected} />
    </div>
  );
}

// Messages Area Component
interface MessagesAreaProps {
  messages: any[];
  personId: string;
  isConnected: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  getUserInfo: (createdBy: number) => {
    firstName?: string;
    lastName?: string;
    profilePic?: string | null;
  };
}

function MessagesArea({
  messages,
  personId,
  isConnected,
  messagesEndRef,
  getUserInfo,
}: MessagesAreaProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <EmptyMessagesState isConnected={isConnected} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const showTime = shouldShowTime(message, previousMessage);
        const userInfo = getUserInfo(message.created_by);

        return (
          <MessageBubble
            key={message._id}
            message={message}
            currentPersonId={parseInt(personId)}
            showTime={showTime}
            senderInfo={userInfo}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
