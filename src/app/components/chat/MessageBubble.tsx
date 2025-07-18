// src/app/components/chat/MessageBubble.tsx

import { ThreadMessage } from "@/app/services/mymmo-thread-service/apiThreads";
import { formatMessageTime } from "./chatUtils";

interface MessageBubbleProps {
  message: ThreadMessage;
  currentPersonId: number;
  showTime: boolean;
}

export function MessageBubble({
  message,
  currentPersonId,
  showTime,
}: MessageBubbleProps) {
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
