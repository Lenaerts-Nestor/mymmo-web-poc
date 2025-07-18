// src/app/components/chat/chatUtils.ts

import { ThreadMessage } from "@/app/services/mymmo-thread-service/apiThreads";

export function shouldShowTime(
  messages: ThreadMessage[],
  index: number
): boolean {
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

export function formatMessageTime(timestamp: string): string {
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
