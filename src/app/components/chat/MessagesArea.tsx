"use client";

import type React from "react";

import { MessageBubble } from "./MessageBubble";
import { EmptyMessagesState } from "./EmptyMessagesState";
import { shouldShowTime } from "./chatUtils";

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

export function MessagesArea({
  messages,
  personId,
  isConnected,
  messagesEndRef,
  getUserInfo,
}: MessagesAreaProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[var(--pure-white)]/50 to-[var(--primary-offwhite)]/30">
        <EmptyMessagesState isConnected={isConnected} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[var(--pure-white)]/50 to-[var(--primary-offwhite)]/30 custom-scrollbar">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const showTime = shouldShowTime
          ? shouldShowTime(message, previousMessage)
          : true;
        const userInfo = getUserInfo(message.created_by);

        return (
          <MessageBubble
            key={message._id}
            message={message}
            currentPersonId={Number.parseInt(personId)}
            showTime={showTime}
            senderInfo={userInfo}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
