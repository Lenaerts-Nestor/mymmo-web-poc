// src/app/components/threads/ThreadCard.tsx - Improved Design

import { ThreadCardProps } from "@/app/types/threads";

// Updated interface to include highlighting
interface ExtendedThreadCardProps extends ThreadCardProps {
  isHighlighted?: boolean;
}

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
  isHighlighted = false,
}: ExtendedThreadCardProps) {
  const latestMessage = thread.latest_message || thread.latestMessage || thread.unread_message;
  const lastSender = latestMessage ? thread.followers?.find(
    (follower) => follower.person_id === latestMessage.created_by
  ) : null;

  const handleClick = () => {
    if (onClick) {
      onClick(thread._id);
    }
  };

  // Dynamic styling based on highlight status and unread status
  const cardClasses = `
    bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-200 border
    ${
      isHighlighted
        ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
        : thread.unread_count > 0
        ? "border-red-200 hover:border-red-300 hover:shadow-md"
        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
    }
  `;

  return (
    <div onClick={handleClick} className={cardClasses}>
      {/* Highlight indicator */}
      {isHighlighted && (
        <div className="flex items-center space-x-2 mb-3 text-blue-600 bg-blue-100 p-2 rounded-lg">
          <span className="text-sm">🔍</span>
          <span className="text-sm font-medium">Gemarkeerde conversatie</span>
        </div>
      )}

      {/* Header with sender info and unread badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
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

          {/* Sender info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {lastSender
                ? `${lastSender.firstName} ${lastSender.lastName}`
                : "Onbekend"}
            </p>
            <p className="text-xs text-gray-500">
              {latestMessage?.created_on ? formatDate(latestMessage.created_on) : 'Onbekend'}
            </p>
          </div>
        </div>

        {/* Unread count badge */}
        {thread.unread_count > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0">
            {thread.unread_count}
          </span>
        )}
      </div>

      {/* Message content */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {latestMessage?.text ? truncateText(latestMessage.text, 120) : 'Geen bericht beschikbaar'}
        </p>
      </div>

      {/* Communication group info (if available) */}
      {thread.communication_group?.group_name && (
        <div className="mb-4 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            Groep:{" "}
            <span className="font-medium">
              {thread.communication_group.group_name}
            </span>
          </p>
        </div>
      )}

      {/* Footer with thread info */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {/* Activity indicator */}
          {thread.dot && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}

          {/* Followers count */}
          <p className="text-xs text-gray-400">
            {thread.followers?.length || 0} deelnemer
            {(thread.followers?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex items-center space-x-2">
          {/* Highlight animation */}
          {isHighlighted && (
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              <span className="text-xs font-medium">Nieuw</span>
            </div>
          )}

          {/* Unread indicator */}
          {thread.unread_count > 0 && !isHighlighted && (
            <div className="flex items-center space-x-1 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Ongelezen</span>
            </div>
          )}

          {/* Read indicator */}
          {thread.unread_count === 0 && !isHighlighted && (
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs">Gelezen</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
