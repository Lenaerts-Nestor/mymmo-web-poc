// src/app/components/inbox/inboxCard.tsx - Improved Design

import { InboxCardProps } from "@/app/types/inbox";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (messageDate.getTime() === today.getTime()) {
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

export function InboxCard({ item, onClick }: InboxCardProps) {
  const { thread, zoneName, zoneDescription, unreadCount } = item;
  const latestMessage = thread.latest_message;

  const lastSender = thread.followers.find(
    (follower) => follower.person_id === latestMessage.created_by
  );

  const handleClick = () => {
    onClick(item.zoneId, thread._id);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
    >
      {/* Zone Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{zoneName}</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              Zone {item.zoneId}
            </span>
          </div>
          <p className="text-sm text-gray-500">{zoneDescription}</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Unread count badge */}
          <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
            {unreadCount}
          </span>
          <p className="text-sm text-gray-500">
            {formatDate(latestMessage.created_on)}
          </p>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex items-start space-x-4">
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

        {/* Message Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-semibold text-gray-800">
              {lastSender
                ? `${lastSender.firstName} ${lastSender.lastName}`
                : "Onbekend"}
            </p>
            {/* Message time */}
            <p className="text-xs text-gray-400">
              {formatDate(latestMessage.created_on)}
            </p>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {truncateText(latestMessage.text, 150)}
          </p>

          {/* Communication group info (if available) */}
          {thread.communication_group.group_name && (
            <p className="text-xs text-gray-400 mb-2">
              Groep: {thread.communication_group.group_name}
            </p>
          )}

          {/* Action hint */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-gray-400">
                {thread.followers.length} deelnemer
                {thread.followers.length !== 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Klik om naar conversatie te gaan →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
