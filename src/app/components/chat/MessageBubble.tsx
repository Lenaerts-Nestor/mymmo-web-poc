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
                <AvatarFallback className="bg-[#b0c2fc]/30 text-[#552e38] text-xs font-bold">
                  {" "}
                  {/* secondary-lightblue/30, primary-wine */}
                  {getUserInitials(senderInfo.firstName, senderInfo.lastName)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm text-[#765860] font-medium">
              {" "}
              {/* gravel-500 */}
              {senderInfo.firstName || "Buur"}
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-5 py-4 shadow-md transition-all duration-200 border-2 ${
            isOwnMessage
              ? "bg-[#b0c2fc] text-[#552e38] border-[#b0c2fc] shadow-lg ml-4" // secondary-lightblue, primary-wine
              : "bg-[#ffffff] text-[#552e38] border-[#cfc4c7] hover:border-[#a69298] hover:shadow-lg mr-4" // pure-white, primary-wine, gravel-100, gravel-300
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
              <Badge className="bg-[#facf59]/20 text-[#552e38] px-3 py-1 rounded-full text-xs font-medium">
                {" "}
                {/* primary-sunglow/20, primary-wine */}
                <div className="w-3 h-3 border-2 border-[#552e38] border-t-transparent rounded-full animate-spin mr-2"></div>
                Verzenden...
              </Badge>
            ) : (
              <Badge className="bg-[#ffffff]/90 text-[#765860] px-3 py-1 rounded-full text-xs font-medium shadow-sm border border-[#cfc4c7]">
                {" "}
                {/* pure-white/90, gravel-500, gravel-100 */}
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
