"use client";

import { useRouter } from "next/navigation";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { useChatMessages } from "@/app/hooks/chat/useChatMessages";
import { OfflineWarning } from "./OfflineWarning";
import { MessagesArea } from "./MessagesArea";
import { ChatLoadingState } from "./ChatLoadingState";
import { ChatErrorState } from "./ChatErrorState";
import { useChatHandlers } from "@/app/hooks/chat/useChatHandlers";
import { useChatUserInfo } from "@/app/hooks/chat/useChatUserInfo";

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

  const { getUserInfo } = useChatUserInfo({
    personId,
    zoneId,
    threadId,
    translationLang,
  });

  const {
    messageInput,
    setMessageInput,
    isSending,
    messagesEndRef,
    messageInputRef,
    handleSendMessage,
    handleKeyPress,
    handleImageUpload,
  } = useChatHandlers({
    sendMessage,
    messagesLength: messages.length,
    messagesLoading,
    threadId,
    zoneId,
    personId,
  });

  const handleBack = () => {
    router.push(`/conversations/${personId}/${zoneId}`);
  };

  if (messagesLoading) {
    return <ChatLoadingState isConnected={isConnected} />;
  }

  if (messagesError) {
    return <ChatErrorState error={messagesError} onRetry={refreshMessages} />;
  }

  return (
    <div className="flex flex-col h-[90vh] bg-gradient-to-br from-[#f5f2de] to-[#ffffff] rounded-2xl shadow-lg overflow-hidden">
      {" "}
      {/* primary-offwhite to pure-white gradient */}
      <ChatHeader
        personId={personId}
        zoneId={zoneId}
        threadId={threadId}
        messagesCount={messages.length}
        unreadCount={unreadMessages.length}
        onBack={handleBack}
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
        onImageUpload={handleImageUpload}
      />
      <OfflineWarning isConnected={isConnected} />
    </div>
  );
}
