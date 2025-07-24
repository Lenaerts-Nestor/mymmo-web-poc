export interface ThreadMessage {
  _id: string;
  text: string;
  created_on: string;
  created_by: number;
  [key: string]: any;
}

/**
 * Determines if timestamp should be shown for a message
 * Shows time if more than 5 minutes passed since previous message
 */
export function shouldShowTime(
  currentMessage: ThreadMessage,
  previousMessage: ThreadMessage | null
): boolean {
  if (!previousMessage) return true;

  const currentTime = new Date(currentMessage.created_on).getTime();
  const previousTime = new Date(previousMessage.created_on).getTime();
  const timeDifference = currentTime - previousTime;

  // Show time if more than 5 minutes passed
  return timeDifference > 5 * 60 * 1000;
}

/**
 * Formats timestamp for display
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  // If today, show only time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // If yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Gisteren ${date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // If within current year, show date without year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Full date
  return date.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Groups messages by date for display
 */

//! dit is voor de toekomst, om de berichten te groeperen op datum
//! momenteel wordt dit niet gebruikt in de chat, maar kan handig zijn voor toekomstige features
export function groupMessagesByDate(messages: ThreadMessage[]) {
  const groups: { [key: string]: ThreadMessage[] } = {};

  messages.forEach((message) => {
    const date = new Date(message.created_on).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  return groups;
}
