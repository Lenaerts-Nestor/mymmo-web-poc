"use client";

import { Users, Bell, Search } from "lucide-react"; // Added icons for consistency
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn Avatar is available
import { Badge } from "@/components/ui/badge"; // Assuming shadcn Badge is available
import type { ThreadCardProps } from "@/app/types/threads";

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
  const latestMessage =
    thread.latest_message ||
    (thread as any).latestMessage ||
    thread.unread_message;
  const lastSender = latestMessage
    ? thread.followers?.find(
        (follower) => follower.person_id === latestMessage.created_by
      )
    : null;

  const handleClick = () => {
    if (onClick) {
      onClick(thread._id);
    }
  };

  // Dynamic styling based on highlight status and unread status
  const cardClasses = `
    bg-[#ffffff] rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-200 border
    ${
      isHighlighted
        ? "border-[#b0c2fc] bg-[#b0c2fc]/20 shadow-lg ring-2 ring-[#b0c2fc]/50" // secondary-lightblue
        : (thread.unread_count || (thread as any).unreadCount || 0) > 0
        ? "border-[#ffb5b5] hover:border-[#ffb5b5]/80 hover:shadow-md" // secondary-melon
        : "border-[#cfc4c7] hover:border-[#a69298] hover:shadow-md" // gravel-100, gravel-300
    }
  `;
  return (
    <div onClick={handleClick} className={cardClasses}>
      {/* Highlight indicator */}
      {isHighlighted && (
        <div className="flex items-center gap-2 mb-3 text-[#552e38] bg-[#facf59]/20 p-2 rounded-lg">
          {" "}
          {/* primary-wine, primary-sunglow/20 */}
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Gemarkeerde conversatie</span>
        </div>
      )}
      {/* Header with sender info and unread badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            {lastSender?.profilePic ? (
              <AvatarImage
                src={lastSender.profilePic || "/placeholder.svg"}
                alt={`${lastSender.firstName} ${lastSender.lastName}`}
              />
            ) : (
              <AvatarFallback className="bg-[#b0c2fc]/30 text-[#552e38] text-sm font-medium">
                {" "}
                {/* secondary-lightblue/30, primary-wine */}
                {lastSender
                  ? getInitials(lastSender.firstName, lastSender.lastName)
                  : "?"}
              </AvatarFallback>
            )}
          </Avatar>
          {/* Sender info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#552e38] truncate">
              {" "}
              {/* primary-wine */}
              {lastSender
                ? `${lastSender.firstName} ${lastSender.lastName}`
                : "Onbekend"}
            </p>
            <p className="text-xs text-[#765860]">
              {" "}
              {/* gravel-500 */}
              {latestMessage?.created_on
                ? formatDate(latestMessage.created_on)
                : "Onbekend"}
            </p>
          </div>
        </div>
        {/* Unread count badge */}
        {(thread.unread_count || (thread as any).unreadCount || 0) > 0 && (
          <Badge className="bg-[#b00205] text-[#ffffff] text-xs px-2 py-1 rounded-full font-bold flex-shrink-0">
            {" "}
            {/* error color */}
            {thread.unread_count || (thread as any).unreadCount || 0}
          </Badge>
        )}
      </div>
      {/* Message content */}
      <div className="mb-4">
        <p className="text-[#765860] text-sm leading-relaxed">
          {" "}
          {/* gravel-500 */}
          {latestMessage?.text
            ? truncateText(latestMessage.text, 120)
            : "Geen bericht beschikbaar"}
        </p>
      </div>
      {/* Communication group info (if available) */}
      {thread.communication_group?.group_name && (
        <div className="mb-4 p-2 bg-[#f5f2de] rounded-lg">
          {" "}
          {/* primary-offwhite */}
          <p className="text-xs text-[#765860]">
            {" "}
            {/* gravel-500 */}
            Groep:{" "}
            <span className="font-medium text-[#552e38]">
              {" "}
              {/* primary-wine */}
              {thread.communication_group.group_name}
            </span>
          </p>
        </div>
      )}
      {/* Footer with thread info */}
      <div className="flex justify-between items-center pt-3 border-t border-[#cfc4c7]">
        {" "}
        {/* gravel-100 */}
        <div className="flex items-center gap-2">
          {/* Activity indicator */}
          {thread.dot && (
            <div className="w-2 h-2 bg-[#b0c2fc] rounded-full animate-pulse"></div>
          )}{" "}
          {/* secondary-lightblue */}
          {/* Followers count */}
          <p className="text-xs text-[#a69298]">
            {" "}
            {/* gravel-300 */}
            <Users className="inline-block w-3 h-3 mr-1" />
            {thread.followers?.length || 0} deelnemer
            {(thread.followers?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {/* Status indicators */}
        <div className="flex items-center gap-2">
          {/* Highlight animation */}
          {isHighlighted && (
            <div className="flex items-center gap-1 text-[#b0c2fc]">
              {" "}
              {/* secondary-lightblue */}
              <Bell className="w-3 h-3 animate-ping" />
              <span className="text-xs font-medium">Nieuw</span>
            </div>
          )}
          {/* Unread indicator */}
          {(thread.unread_count || (thread as any).unreadCount || 0) > 0 && !isHighlighted && (
            <div className="flex items-center gap-1 text-[#b00205]">
              {" "}
              {/* error color */}
              <Bell className="w-3 h-3 animate-pulse" />
              <span className="text-xs font-medium">Ongelezen</span>
            </div>
          )}
          {/* Read indicator */}
          {(thread.unread_count || (thread as any).unreadCount || 0) === 0 && !isHighlighted && (
            <div className="flex items-center gap-1 text-[#aced94]">
              {" "}
              {/* secondary-tea */}
              <Bell className="w-3 h-3" />
              <span className="text-xs">Gelezen</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
