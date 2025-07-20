// src/app/components/chat/ChatContent.tsx - FIXED: TypeScript errors resolved

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { useThreadDetails } from "@/app/hooks/useThreadDetails";
import { useSendMessage } from "@/app/hooks/useSendMessage";
import { useThreads } from "@/app/hooks/useThreads";
import { shouldShowTime } from "./chatUtils";

interface ChatContentProps {
  personId: string;
  zoneId: string;
  threadId: string;
  translationLang: string;
}

// 🆕 Socket connection status indicator component
function SocketStatusIndicator({
  isConnected,
  status,
}: {
  isConnected: boolean;
  status: string;
}) {
  if (isConnected) {
    return (
      <div className="flex items-center text-green-600 text-xs">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
        Live
      </div>
    );
  }

  if (status === "connecting" || status === "reconnecting") {
    return (
      <div className="flex items-center text-yellow-600 text-xs">
        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></div>
        Connecting...
      </div>
    );
  }

  return (
    <div className="flex items-center text-red-600 text-xs">
      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
      Offline
    </div>
  );
}

// 🆕 Simple Chat Header Component (if not exists)
function ChatHeader({ threadId }: { threadId: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Chat</h2>
        <p className="text-sm text-gray-500">Thread: {threadId.slice(-8)}</p>
      </div>
    </div>
  );
}

// 🆕 Simple Message Bubble Component (if not exists)
function MessageBubble({
  message,
  isCurrentUser,
  showTime,
  firstName,
}: {
  message: any;
  isCurrentUser: boolean;
  showTime: boolean;
  firstName: string;
}) {
  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {!isCurrentUser && (
          <p className="text-xs font-medium mb-1">{firstName}</p>
        )}
        <p className="text-sm">{message.text}</p>
        {showTime && (
          <p className="text-xs opacity-75 mt-1">
            {new Date(message.created_on).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

// 🆕 Simple Chat Input Component (if not exists)
function ChatInput({
  messageInput,
  setMessageInput,
  handleSendMessage,
  handleKeyPress,
  isSending,
  messageInputRef,
  sendButtonText,
}: {
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
  sendButtonText: string;
}) {
  return (
    <div className="flex items-end space-x-2">
      <textarea
        ref={messageInputRef}
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={1}
        disabled={isSending}
      />
      <button
        onClick={handleSendMessage}
        disabled={isSending || !messageInput.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium"
      >
        {sendButtonText}
      </button>
    </div>
  );
}

export function ChatContent({
  personId,
  zoneId,
  threadId,
  translationLang,
}: ChatContentProps) {
  const router = useRouter();
  const [messageInput, setMessageInput] = useState("");
  const [isSendingViaSocket, setIsSendingViaSocket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // 🎯 ENHANCED HOOKS: Now with socket integration
  const {
    messages,
    unreadMessages,
    isLoading,
    error,
    refetch,
    markAsRead,
    // 🆕 NEW: Socket-enhanced functions
    sendMessageViaSocket,
    isSocketConnected,
    socketStatus,
  } = useThreadDetails(threadId, personId, translationLang, true);

  // 🆕 NEW: Fetch thread data for follower info (names, profile pics)
  const { threads: threadsData, isSocketConnected: threadsSocketConnected } =
    useThreads(
      personId,
      zoneId,
      translationLang,
      false // Not active chat page for this call
    );

  // 🔄 FALLBACK: Keep existing HTTP send message hook as backup
  const {
    sendMessage: sendMessageViaHTTP,
    isSending: isSendingViaHTTP,
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

  // 🆕 ENHANCED: Smart message sending with socket-first approach
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSendingViaSocket || isSendingViaHTTP) return;

    const messageText = messageInput.trim();
    setMessageInput("");

    // 🚀 SOCKET-FIRST: Try socket for instant delivery
    if (isSocketConnected) {
      setIsSendingViaSocket(true);

      try {
        const success = await sendMessageViaSocket(messageText);

        if (success) {
          console.log("✅ Message sent via socket");
          // Socket message sent successfully - real-time update will handle UI
          return;
        } else {
          console.warn("⚠️ Socket send failed, falling back to HTTP");
        }
      } catch (error) {
        console.error("❌ Socket send error:", error);
      } finally {
        setIsSendingViaSocket(false);
      }
    }

    // 🔄 FALLBACK: Use HTTP API if socket failed or not connected
    console.log("📡 Sending message via HTTP API (fallback)");
    const httpSuccess = await sendMessageViaHTTP(messageText);

    if (!httpSuccess) {
      // Restore message if both methods failed
      setMessageInput(messageText);
    }
  };

  // Handle Enter key in textarea
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isSending = isSendingViaSocket || isSendingViaHTTP;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ErrorDisplay error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 🆕 ENHANCED: Chat header with socket status */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <ChatHeader threadId={threadId} />

        {/* 🆕 NEW: Socket status indicator */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500">
            {currentThread?.followers?.length || 0} deelnemers
          </div>
          <SocketStatusIndicator
            isConnected={isSocketConnected}
            status={socketStatus}
          />
        </div>
      </div>

      {/* 🎯 MESSAGES AREA: Real-time message display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">Geen berichten</p>
              <p className="text-sm">
                Start een gesprek door een bericht te typen
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const userInfo = getUserInfo(message.created_by);
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showTime = shouldShowTime(message, previousMessage);
            const isCurrentUser = message.created_by === parseInt(personId);

            return (
              <MessageBubble
                key={message._id}
                message={message}
                isCurrentUser={isCurrentUser}
                showTime={showTime}
                firstName={userInfo.firstName}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 🆕 ENHANCED: Chat input with socket status */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* 🆕 NEW: Connection status message */}
        {!isSocketConnected && (
          <div className="mb-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Real-time verbinding niet beschikbaar. Berichten worden via
            standaard API verzonden.
          </div>
        )}

        {sendError && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            ❌ Fout bij versturen: {sendError}
          </div>
        )}

        <ChatInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          isSending={isSending}
          messageInputRef={messageInputRef}
          sendButtonText={
            isSendingViaSocket
              ? "Verzenden..."
              : isSendingViaHTTP
              ? "Verzenden (HTTP)..."
              : isSocketConnected
              ? "Verzenden (Live)"
              : "Verzenden"
          }
        />
      </div>
    </div>
  );
}
