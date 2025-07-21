// src/app/components/chat/ChatContent.tsx - REAL-TIME CHAT COMPONENT

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { useThreads } from "@/app/hooks/useThreads";
import { MessageBubble } from "./MessageBubble";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { shouldShowTime } from "./chatUtils";
import { useChatMessages } from "@/app/hooks/useChatMessages";

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

  // 🚀 REAL-TIME CHAT MESSAGES (Local state + Socket)
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

  // 🔄 THREAD METADATA (Still use React Query for non-real-time data)
  const { threads: threadsData } = useThreads(
    personId,
    zoneId,
    translationLang,
    false // Not active chat page for this call
  );

  // 🎯 GET CURRENT THREAD for follower info
  const currentThread = threadsData.find((t) => t._id === threadId);

  // 🎯 USER INFO LOOKUP
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

  // 🎯 AUTO-SCROLL to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  // 🎯 AUTO-FOCUS input for better UX
  useEffect(() => {
    if (!messagesLoading && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [messagesLoading]);

  // 🚀 SEND MESSAGE with real-time updates
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    const messageText = messageInput.trim();
    setMessageInput(""); // Clear input immediately for better UX
    setIsSending(true);

    try {
      const success = await sendMessage(messageText);

      if (!success) {
        // Restore message if failed
        setMessageInput(messageText);
      }
    } catch (error) {
      console.error("❌ Send message error:", error);
      setMessageInput(messageText); // Restore on error
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key in textarea
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 🎯 HANDLE BACK NAVIGATION
  const handleBack = () => {
    router.push(`/conversations/${personId}/${zoneId}`);
  };

  // 🎯 MARK AS READ manually
  const handleMarkAsRead = async () => {
    await markAsRead();
  };

  // 🚀 LOADING STATE
  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Berichten laden...</p>
          {isConnected && (
            <p className="mt-2 text-green-600 text-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Real-time verbinding actief
            </p>
          )}
        </div>
      </div>
    );
  }

  // 🚀 ERROR STATE
  if (messagesError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <ErrorDisplay error={messagesError} onRetry={refreshMessages} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 🚀 ENHANCED HEADER with real-time status */}
      <ChatHeader
        personId={personId}
        zoneId={zoneId}
        threadId={threadId}
        messagesCount={messages.length}
        unreadCount={unreadMessages.length}
        onBack={handleBack}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* 🚀 CONNECTION STATUS INDICATOR */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {currentThread?.followers?.length || 0} deelnemers
            </span>

            {/* Real-time status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">Live chat</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600">Offline mode</span>
                </>
              )}
            </div>
          </div>

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-400">
              Socket: {socketStatus} | Messages: {messages.length}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 MESSAGES AREA with real-time updates */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl font-medium mb-2">Geen berichten</p>
              <p className="text-sm">
                Start een gesprek door een bericht te typen
              </p>
              {isConnected && (
                <p className="text-xs text-green-600 mt-2">
                  ✨ Real-time chat is actief
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const userInfo = getUserInfo(message.created_by);
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showTime = shouldShowTime(message, previousMessage);
              const isCurrentUser = message.created_by === parseInt(personId);

              // Check if message is optimistic (being sent)
              const isOptimistic = message._id.startsWith("temp-");

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
          </>
        )}
      </div>

      {/* 🚀 ENHANCED INPUT with real-time status */}
      <ChatInput
        value={messageInput}
        onChange={setMessageInput}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        isSending={isSending}
        error={messagesError}
        inputRef={messageInputRef}
      />

      {/* 🚀 OFFLINE WARNING */}
      {!isConnected && (
        <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2">
          <div className="flex items-center text-yellow-800 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span>
              Real-time verbinding niet beschikbaar. Berichten worden via
              standaard API verzonden.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
