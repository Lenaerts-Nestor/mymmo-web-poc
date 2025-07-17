// src/app/(dashboard)/conversations/[personId]/[zoneId]/thread/[threadId]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useThreadDetails } from "@/app/hooks/useThreadDetails";
import { useSendMessage } from "@/app/hooks/useSendMessage";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG } from "@/app/constants/app";
import { ArrowLeft, Send } from "lucide-react";
import { ThreadMessage } from "@/app/services/mymmo-thread-service/apiThreads";

export default function ChatPage() {
  const { personId, zoneId, threadId } = useParams();
  const router = useRouter();
  const { user } = useUser();

  const translationLang =
    user?.translationLang || APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string}>
        <ChatContent
          personId={personId as string}
          zoneId={zoneId as string}
          threadId={threadId as string}
          translationLang={translationLang}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ChatContent({
  personId,
  zoneId,
  threadId,
  translationLang,
}: {
  personId: string;
  zoneId: string;
  threadId: string;
  translationLang: string;
}) {
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
    <div className="flex flex-col h-screen bg-gray-50">
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
      <div className="flex-1 overflow-y-auto px-6 py-4">
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

// CHAT HEADER COMPONENT
function ChatHeader({
  personId,
  zoneId,
  threadId,
  messagesCount,
  unreadCount,
  onBack,
  onMarkAsRead,
}: {
  personId: string;
  zoneId: string;
  threadId: string;
  messagesCount: number;
  unreadCount: number;
  onBack: () => void;
  onMarkAsRead: () => void;
}) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-stone-800">Conversatie</h1>
            <div className="flex items-center gap-4 text-sm text-stone-600">
              <span>
                {messagesCount} bericht{messagesCount === 1 ? "" : "en"}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {unreadCount} ongelezen
                </span>
              )}
              {/* Development polling indicator */}
              {process.env.NODE_ENV === "development" && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  ⚡ Real-time (5s)
                </span>
              )}
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Markeer als gelezen
          </button>
        )}
      </div>
    </div>
  );
}

// MESSAGE BUBBLE COMPONENT
function MessageBubble({
  message,
  currentPersonId,
  showTime,
}: {
  message: ThreadMessage;
  currentPersonId: number;
  showTime: boolean;
}) {
  const isOwnMessage = message.created_by === currentPersonId;
  const isOptimistic = message._id.startsWith("temp-");

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md ${
          isOwnMessage ? "order-2" : "order-1"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwnMessage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-900 border border-gray-200"
          } ${isOptimistic ? "opacity-70" : ""}`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>

        {showTime && (
          <div
            className={`text-xs text-gray-500 mt-1 ${
              isOwnMessage ? "text-right" : "text-left"
            }`}
          >
            {isOptimistic ? (
              <span className="italic">Verzenden...</span>
            ) : (
              formatMessageTime(message.created_on)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// CHAT INPUT COMPONENT
function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  isSending,
  error,
  inputRef,
  isTyping,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  isTyping: boolean;
}) {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Typ je bericht... (Enter om te verzenden, Shift+Enter voor nieuwe regel)"
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{
                minHeight: "48px",
                maxHeight: "120px",
              }}
              disabled={isSending}
            />
          </div>

          <button
            onClick={onSend}
            disabled={!value.trim() || isSending}
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="text-xs text-gray-500 mt-2">Aan het typen...</div>
        )}
      </div>
    </div>
  );
}

// UTILITY FUNCTIONS
function shouldShowTime(messages: ThreadMessage[], index: number): boolean {
  if (index === messages.length - 1) return true; // Always show time for last message

  const currentMessage = messages[index];
  const nextMessage = messages[index + 1];

  if (!nextMessage) return true;

  // Show time if next message is from different person
  if (currentMessage.created_by !== nextMessage.created_by) return true;

  // Show time if more than 5 minutes between messages
  const currentTime = new Date(currentMessage.created_on).getTime();
  const nextTime = new Date(nextMessage.created_on).getTime();
  const timeDiff = nextTime - currentTime;

  return timeDiff > 5 * 60 * 1000; // 5 minutes
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString("nl-NL", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
