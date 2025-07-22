// src/app/components/chat/MessageBubble.tsx - CLEANED

import { ThreadMessage } from "@/app/services/mymmo-thread-service/apiThreads";
import { formatMessageTime } from "./chatUtils";

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
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-xs lg:max-w-md ${
          isOwnMessage ? "order-2" : "order-1"
        }`}
      >
        {!isOwnMessage && senderInfo && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden"
              style={{
                backgroundColor: "var(--primary-cream)",
              }}
            >
              {senderInfo.profilePic ? (
                <img
                  src={senderInfo.profilePic}
                  alt={`${senderInfo.firstName} ${senderInfo.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span style={{ color: "var(--text-medium-brown)" }}>
                  {getUserInitials(senderInfo.firstName, senderInfo.lastName)}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {senderInfo.firstName || "Buur"}
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isOwnMessage
              ? "text-white shadow-lg"
              : "bg-white text-gray-900 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
          } ${isOptimistic ? "opacity-70" : ""}`}
          style={
            isOwnMessage
              ? {
                  backgroundColor: "var(--secondary-lavender)",
                }
              : {}
          }
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        </div>

        {showTime && (
          <div
            className={`text-xs mt-1.5 px-1 ${
              isOwnMessage
                ? "text-right text-purple-200"
                : "text-left text-gray-500"
            }`}
          >
            {isOptimistic ? (
              <span className="italic flex items-center gap-1">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Verzenden...
              </span>
            ) : (
              <span className="bg-white bg-opacity-90 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                {formatMessageTime(message.created_on)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
