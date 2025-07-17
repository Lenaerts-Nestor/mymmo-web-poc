// src/app/components/threads/ThreadCard.tsx

import { ThreadCardProps } from "@/app/types/threads";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const threadDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (threadDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }
};

// Helper function to get user initials
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export function ThreadCard({
  thread,
  currentPersonId,
  onClick,
}: ThreadCardProps) {
  const latestMessage = thread.latest_message;
  const lastSender = thread.followers.find(
    (follower) => follower.person_id === latestMessage.created_by
  );

  const handleClick = () => {
    if (onClick) {
      onClick(thread._id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200"
    >
      {/* Header with sender info and time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {lastSender?.profilePic ? (
              <img
                src={lastSender.profilePic}
                alt={`${lastSender.firstName} ${lastSender.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-gray-600">
                {lastSender
                  ? getInitials(lastSender.firstName, lastSender.lastName)
                  : "?"}
              </span>
            )}
          </div>

          {/* Sender name */}
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {lastSender
                ? `${lastSender.firstName} ${lastSender.lastName}`
                : "Onbekend"}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(latestMessage.created_on)}
            </p>
          </div>
        </div>

        {/* Unread count badge */}
        {thread.unread_count > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {thread.unread_count}
          </span>
        )}
      </div>

      {/* Message content */}
      <div className="mb-2">
        <p className="text-gray-800 text-sm leading-relaxed">
          {truncateText(latestMessage.text, 120)}
        </p>
      </div>

      {/* Communication group info (if available) */}
      {thread.communication_group.group_name && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Groep: {thread.communication_group.group_name}
          </p>
        </div>
      )}

      {/* Thread status indicator */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center space-x-2">
          {/* Dot indicator for unread */}
          {thread.dot && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}

          {/* Followers count */}
          <p className="text-xs text-gray-400">
            {thread.followers.length} deelnemer
            {thread.followers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
