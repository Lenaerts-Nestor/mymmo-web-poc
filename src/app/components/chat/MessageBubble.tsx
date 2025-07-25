"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatMessageTime } from "./chatUtils";
import { ImageMessage } from "./ImageMessage";

interface ThreadMessage {
  _id: string;
  text?: string;
  created_by: number;
  created_on: string;
  attachments?: any[];
}

interface MessageBubbleProps {
  message: ThreadMessage;
  currentPersonId: number;
  showTime: boolean;
  senderInfo?: {
    firstName?: string;
    lastName?: string;
    profilePic?: string | null;
  };
}

const getUserInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return "?";
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return `${first}${last}`;
};

export function MessageBubble({
  message,
  currentPersonId,
  showTime,
  senderInfo,
}: MessageBubbleProps) {
  const isOwnMessage = message.created_by === currentPersonId;
  const isOptimistic = message._id.startsWith("temp-");

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-xs lg:max-w-md ${
          isOwnMessage ? "order-2" : "order-1"
        }`}
      >
        {!isOwnMessage && senderInfo && (
          <div className="flex items-center gap-3 mb-2 ml-1">
            <Avatar className="w-8 h-8">
              {senderInfo.profilePic ? (
                <AvatarImage
                  src={senderInfo.profilePic || "/placeholder.svg"}
                  alt={`${senderInfo.firstName} ${senderInfo.lastName}`}
                />
              ) : (
                <AvatarFallback className="bg-[var(--secondary-lightblue)]/30 text-[var(--primary-wine)] text-xs font-bold">
                  {getUserInitials(senderInfo.firstName, senderInfo.lastName)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm text-[var(--gravel-500)] font-medium">
              {senderInfo.firstName || "Buur"}
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-5 py-4 shadow-md transition-all duration-200 border-2 ${
            isOwnMessage
              ? "bg-[var(--secondary-lightblue)] text-[var(--primary-wine)] border-[var(--secondary-lightblue)] shadow-lg ml-4"
              : "bg-[var(--pure-white)] text-[var(--primary-wine)] border-[var(--gravel-100)] hover:border-[var(--gravel-300)] hover:shadow-lg mr-4"
          } ${isOptimistic ? "opacity-70" : ""}`}
        >
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
              {message.text}
            </p>
          )}

          {message.attachments && message.attachments.length > 0 && (
            <ImageMessage attachments={message.attachments} />
          )}
        </div>

        {showTime && (
          <div
            className={`flex items-center gap-2 mt-2 px-2 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            {isOptimistic ? (
              <Badge className="bg-[var(--primary-sunglow)]/20 text-[var(--primary-wine)] px-3 py-1 rounded-full text-xs font-medium">
                <div className="w-3 h-3 border-2 border-[var(--primary-wine)] border-t-transparent rounded-full animate-spin mr-2"></div>
                Verzenden...
              </Badge>
            ) : (
              <Badge className="bg-[var(--pure-white)]/90 text-[var(--gravel-500)] px-3 py-1 rounded-full text-xs font-medium shadow-sm border border-[var(--gravel-100)]">
                <Clock className="w-3 h-3 mr-1" />
                {formatMessageTime
                  ? formatMessageTime(message.created_on)
                  : new Date(message.created_on).toLocaleTimeString()}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
